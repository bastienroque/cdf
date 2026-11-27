import { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Admin, account and member pages under every language prefix
      disallow: ["/*/admin", "/*/login", "/*/register", "/*/review"],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
