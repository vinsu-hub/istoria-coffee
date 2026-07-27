import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://istoria.coffee";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/menu", "/board", "/order", "/contact"];
  return routes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
  }));
}
