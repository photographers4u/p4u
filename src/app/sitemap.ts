import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { getCitySlug } from "@/lib/city-pages";
import { getPublicPhotographers } from "@/server/services/photographer";
import { CITIES } from "@/zod/helpers";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const photographers = await getPublicPhotographers();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteConfig.url}/`, changeFrequency: "daily", priority: 1 },
    {
      url: `${siteConfig.url}/photographers`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteConfig.url}/about-us`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${siteConfig.url}/contact`,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${siteConfig.url}/join-us`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${siteConfig.url}/register`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${siteConfig.url}/terms`,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${siteConfig.url}/privacy-policy`,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];

  const cityRoutes: MetadataRoute.Sitemap = CITIES.map((city) => ({
    url: `${siteConfig.url}/photographers/${getCitySlug(city)}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const photographerRoutes: MetadataRoute.Sitemap = photographers.map(
    (photographer) => ({
      url: `${siteConfig.url}/p/${photographer.slug}`,
      changeFrequency: "weekly",
      priority: 0.7,
    }),
  );

  return [...staticRoutes, ...cityRoutes, ...photographerRoutes];
}
