import "dotenv/config";
import { inArray, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { speciality } from "../src/server/db/schema/speciality";
import {
  type CreateSpecialityInput,
  createSpecialitySchema,
} from "../src/zod/schema/speciality";
import { specialitySeedData } from "./data/speciality";

const specialitySeedFilePath = "scripts/data/speciality.ts";

function getDuplicates(values: string[]) {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const value of values) {
    if (seen.has(value)) {
      duplicates.add(value);
      continue;
    }

    seen.add(value);
  }

  return [...duplicates];
}

function getValidatedSpecialitiesFromFile(): CreateSpecialityInput[] {
  if (specialitySeedData.length === 0) {
    throw new Error(
      `No speciality seed data found in ${specialitySeedFilePath}`,
    );
  }

  const parsedInputs: CreateSpecialityInput[] = [];

  for (const [index, specialityInput] of specialitySeedData.entries()) {
    const parsed = createSpecialitySchema.safeParse(specialityInput);

    if (!parsed.success) {
      const issueSummary = parsed.error.issues
        .map((issue) => {
          const path = issue.path.join(".") || "value";

          return `${path}: ${issue.message}`;
        })
        .join("\n");

      throw new Error(
        `Invalid speciality input at row ${index + 1} in ${specialitySeedFilePath}:\n${issueSummary}`,
      );
    }

    parsedInputs.push(parsed.data);
  }

  const duplicateNames = getDuplicates(parsedInputs.map((input) => input.name));
  const duplicateSlugs = getDuplicates(parsedInputs.map((input) => input.slug));

  if (duplicateNames.length > 0 || duplicateSlugs.length > 0) {
    const duplicateMessages = [
      duplicateNames.length > 0
        ? `Duplicate names in input: ${duplicateNames.join(", ")}`
        : null,
      duplicateSlugs.length > 0
        ? `Duplicate slugs in input: ${duplicateSlugs.join(", ")}`
        : null,
    ].filter(Boolean);

    throw new Error(duplicateMessages.join("\n"));
  }

  return parsedInputs;
}

async function main() {
  const inputs = getValidatedSpecialitiesFromFile();
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is required to seed specialities");
  }

  const client = postgres(connectionString, {
    max: 1,
    prepare: false,
  });

  const db = drizzle(client);

  try {
    console.log(
      `Seeding ${inputs.length} specialities from ${specialitySeedFilePath}...`,
    );

    const names = inputs.map((input) => input.name);
    const slugs = inputs.map((input) => input.slug);

    const existingSpecialities = await db
      .select({
        id: speciality.id,
        name: speciality.name,
        slug: speciality.slug,
      })
      .from(speciality)
      .where(
        or(inArray(speciality.name, names), inArray(speciality.slug, slugs)),
      );

    const existingByName = new Map(
      existingSpecialities.map((record) => [record.name, record]),
    );
    const existingBySlug = new Map(
      existingSpecialities.map((record) => [record.slug, record]),
    );
    const conflicts: string[] = [];

    const specialitiesToInsert: CreateSpecialityInput[] = [];
    const skippedInputs: CreateSpecialityInput[] = [];

    for (const input of inputs) {
      const nameMatch = existingByName.get(input.name);
      const slugMatch = existingBySlug.get(input.slug);

      if (!nameMatch && !slugMatch) {
        specialitiesToInsert.push(input);
        continue;
      }

      if (nameMatch && slugMatch && nameMatch.id === slugMatch.id) {
        skippedInputs.push(input);
        continue;
      }

      const conflictDetails = [
        nameMatch
          ? `name already exists as ${nameMatch.name} (${nameMatch.slug}) [${nameMatch.id}]`
          : null,
        slugMatch
          ? `slug already exists as ${slugMatch.name} (${slugMatch.slug}) [${slugMatch.id}]`
          : null,
      ].filter(Boolean);

      conflicts.push(
        `- ${input.name} (${input.slug}): ${conflictDetails.join("; ")}`,
      );
    }

    if (conflicts.length > 0) {
      throw new Error(
        `Conflicting speciality seed data found in ${specialitySeedFilePath}:\n${conflicts.join("\n")}`,
      );
    }

    if (specialitiesToInsert.length > 0) {
      const insertedSpecialities = await db
        .insert(speciality)
        .values(specialitiesToInsert)
        .returning({
          id: speciality.id,
          name: speciality.name,
          slug: speciality.slug,
        });

      console.log(
        `Inserted ${insertedSpecialities.length} ${
          insertedSpecialities.length === 1 ? "speciality" : "specialities"
        }:`,
      );

      for (const record of insertedSpecialities) {
        console.log(`- ${record.name} (${record.slug}) [${record.id}]`);
      }
    } else {
      console.log("No new specialities were inserted.");
    }

    if (skippedInputs.length > 0) {
      console.log(
        `Skipped ${skippedInputs.length} existing ${
          skippedInputs.length === 1 ? "entry" : "entries"
        }:`,
      );

      for (const input of skippedInputs) {
        console.log(`- ${input.name} (${input.slug})`);
      }
    }
  } finally {
    await client.end({ timeout: 5 });
  }
}

void main().catch((error) => {
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error("Unknown error while seeding specialities");
  }

  process.exitCode = 1;
});
