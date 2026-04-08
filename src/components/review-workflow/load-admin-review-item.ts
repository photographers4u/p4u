import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { getServerAdminSession } from "@/lib/server-api";

type LoadAdminReviewItemResult<TItem> = {
  status: number;
  item: TItem | null;
  error: string | null;
};

export async function loadAdminReviewItem<TItem>({
  slug,
  fetchItem,
}: {
  slug: string;
  fetchItem: (input: {
    slug: string;
    requestHeaders: Headers;
  }) => Promise<LoadAdminReviewItemResult<TItem>>;
}) {
  const requestHeaders = await headers();
  await getServerAdminSession(requestHeaders);

  const result = await fetchItem({
    slug,
    requestHeaders,
  });

  if (result.status === 401) {
    redirect("/login");
  }

  if (result.status === 403 || result.status === 404) {
    notFound();
  }

  return result;
}
