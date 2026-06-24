import "dotenv/config";
import { mkdirSync, writeFileSync } from "node:fs";
import { auth } from "../src/server/auth";
import db from "../src/server/db";
import { photographer, photographerContact } from "../src/server/db/schema";
import { CITIES, photographerSlugFromName } from "../src/zod/helpers";
import contactsSeedData from "./data/pdf-import-contacts.json";

const dataFilePath = "scripts/data/pdf-import-contacts.json";
const outputDir = "scripts/data/output";
const BIO_MAX_LENGTH = 1000;

type ImportContact = {
  name: string;
  category: string;
  phones: string[];
  instagram: string;
  location: string;
  needsReview: boolean;
};

const contacts = contactsSeedData as ImportContact[];

function buildEmailForPhone(phone: string) {
  return `work.photographers4u+${phone}@gmail.com`;
}

function buildPasswordForPhone(phone: string) {
  return `Photographer+${phone}`;
}

function matchLocationCity(rawLocation: string) {
  if (!rawLocation.trim()) {
    return null;
  }

  const normalized = rawLocation.toLowerCase();

  for (const city of CITIES) {
    if (normalized.includes(city.toLowerCase())) {
      return city;
    }
  }

  return null;
}

function buildBio(category: string) {
  const trimmed = category.trim();

  if (!trimmed) {
    return null;
  }

  return trimmed.slice(0, BIO_MAX_LENGTH);
}

type ImportResult = {
  name: string;
  phone: string;
  email: string;
  password: string;
  slug: string;
  status: "created" | "skipped";
  reason?: string;
};

async function importContact(contact: ImportContact): Promise<ImportResult> {
  const phone = contact.phones[0];
  const email = buildEmailForPhone(phone);
  const password = buildPasswordForPhone(phone);

  const existingByPhone = await db.query.photographerContact?.findFirst?.({
    where: (table, { eq: eqOp }) => eqOp(table.phone, phone),
  });

  if (existingByPhone) {
    return {
      name: contact.name,
      phone,
      email,
      password,
      slug: "",
      status: "skipped",
      reason: `Phone ${phone} already has a photographer_contact row`,
    };
  }

  const { user } = await auth.api.createUser({
    body: {
      email,
      password,
      name: contact.name,
      role: "user",
      data: {
        emailVerified: true,
      },
    },
  });

  const slug = photographerSlugFromName(contact.name);
  const locationCity = matchLocationCity(contact.location);
  const bio = buildBio(contact.category);
  const instagramReelUrl = contact.instagram.trim() || null;

  const [createdPhotographer] = await db
    .insert(photographer)
    .values({
      userId: user.id,
      slug,
      name: contact.name,
      bio,
      instagramReelUrl,
      locationCity,
      status: "pending_verification",
      isPublished: true,
    })
    .returning({ id: photographer.id });

  if (!createdPhotographer) {
    throw new Error(`Failed to insert photographer row for ${contact.name}`);
  }

  await db.insert(photographerContact).values({
    photographerId: createdPhotographer.id,
    phone,
    email,
    emailVerified: true,
    isPublic: false,
  });

  return {
    name: contact.name,
    phone,
    email,
    password,
    slug,
    status: "created",
  };
}

async function main() {
  const limit = Number(process.env.IMPORT_LIMIT ?? "0");
  const contactsToImport = limit > 0 ? contacts.slice(0, limit) : contacts;

  console.log(
    `Importing ${contactsToImport.length} of ${contacts.length} photographers from ${dataFilePath}...`,
  );

  const results: ImportResult[] = [];
  const reviewNeeded = contactsToImport.filter(
    (contact) => contact.needsReview,
  );

  if (reviewNeeded.length > 0) {
    console.log(
      `\n${reviewNeeded.length} contact(s) have a suspicious phone number from the source PDF (not 10 digits) - they will still be imported, double check before calling:`,
    );
    for (const contact of reviewNeeded) {
      console.log(`- ${contact.name}: ${contact.phones.join(", ")}`);
    }
  }

  for (const contact of contactsToImport) {
    try {
      const result = await importContact(contact);
      results.push(result);
      console.log(
        result.status === "created"
          ? `Created: ${result.name} (${result.phone})`
          : `Skipped: ${result.name} (${result.phone}) - ${result.reason}`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      results.push({
        name: contact.name,
        phone: contact.phones[0],
        email: buildEmailForPhone(contact.phones[0]),
        password: buildPasswordForPhone(contact.phones[0]),
        slug: "",
        status: "skipped",
        reason: message,
      });
      console.error(
        `Failed: ${contact.name} (${contact.phones[0]}) - ${message}`,
      );
    }
  }

  const created = results.filter((r) => r.status === "created");
  const skipped = results.filter((r) => r.status === "skipped");

  mkdirSync(outputDir, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const csvPath = `${outputDir}/photographer-import-${timestamp}.csv`;
  const csvHeader = "name,phone,email,password,slug,status,reason";
  const csvRows = results.map((r) =>
    [r.name, r.phone, r.email, r.password, r.slug, r.status, r.reason ?? ""]
      .map((value) => `"${String(value).replaceAll('"', '""')}"`)
      .join(","),
  );
  writeFileSync(csvPath, [csvHeader, ...csvRows].join("\n"), "utf8");

  console.log(
    `\nDone. Created ${created.length}, skipped ${skipped.length}, total ${results.length}.`,
  );
  console.log(`Calling-list with credentials written to ${csvPath}`);
  console.log(
    "This file contains real login passwords - keep it private, it is gitignored.",
  );
}

void main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => {
    process.exit(process.exitCode ?? 0);
  });
