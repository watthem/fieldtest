import { defineConfig } from "vitepress";

const plausibleDomain =
  process.env.PLAUSIBLE_DOMAIN || "fieldtest.matthewhendricks.net";

export default defineConfig({
  title: "FieldTest",
  description:
    "Framework-agnostic validation toolkit for Markdown and Standard Schema. Built for Astro, Next.js, and modern frameworks. Catch content errors at build time, not in production.",
  base: "/",
  lang: "en-US",

  head: [
    // Favicons and icons
    [
      "link",
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/icon.png" },
    ],
    [
      "link",
      { rel: "icon", type: "image/png", sizes: "16x16", href: "/icon.png" },
    ],
    ["link", { rel: "apple-touch-icon", sizes: "180x180", href: "/icon.png" }],
    ["link", { rel: "manifest", href: "/manifest.json" }],

    // SEO Meta Tags
    ["meta", { name: "theme-color", content: "#3c82f6" }],
    [
      "meta",
      { name: "viewport", content: "width=device-width, initial-scale=1.0" },
    ],
    ["meta", { name: "author", content: "Matthew Hendricks" }],
    [
      "meta",
      {
        name: "keywords",
        content:
          "validation, typescript, markdown, schema validation, content validation, astro, nextjs, standard schema, build-time validation, developer tools, npm package",
      },
    ],
    [
      "meta",
      {
        name: "robots",
        content:
          "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
      },
    ],
    ["meta", { name: "googlebot", content: "index, follow" }],

    // Open Graph / Facebook
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { property: "og:locale", content: "en_US" }],
    ["meta", { property: "og:site_name", content: "FieldTest Documentation" }],
    [
      "meta",
      {
        property: "og:title",
        content: "FieldTest - Validation Toolkit for Modern Frameworks",
      },
    ],
    [
      "meta",
      {
        property: "og:description",
        content:
          "Framework-agnostic validation for Markdown and Standard Schema. Catch content errors at build time. Works with Astro, Next.js, Remix, and more.",
      },
    ],
    [
      "meta",
      { property: "og:url", content: "https://docs.matthewhendricks.net/" },
    ],
    [
      "meta",
      {
        property: "og:image",
        content: "https://docs.matthewhendricks.net/hero.png",
      },
    ],
    ["meta", { property: "og:image:width", content: "1200" }],
    ["meta", { property: "og:image:height", content: "630" }],
    [
      "meta",
      {
        property: "og:image:alt",
        content: "FieldTest - Validation toolkit for content",
      },
    ],

    // Twitter Card
    ["meta", { name: "twitter:card", content: "summary_large_image" }],
    ["meta", { name: "twitter:site", content: "@watthem" }],
    ["meta", { name: "twitter:creator", content: "@watthem" }],
    [
      "meta",
      {
        name: "twitter:title",
        content: "FieldTest - Validation Toolkit for Modern Frameworks",
      },
    ],
    [
      "meta",
      {
        name: "twitter:description",
        content:
          "Framework-agnostic validation for Markdown and Standard Schema. Catch content errors at build time.",
      },
    ],
    [
      "meta",
      {
        name: "twitter:image",
        content: "https://docs.matthewhendricks.net/hero.png",
      },
    ],
    [
      "meta",
      {
        name: "twitter:image:alt",
        content: "FieldTest - Validation toolkit for content",
      },
    ],

    // Canonical URL
    ["link", { rel: "canonical", href: "https://docs.matthewhendricks.net/" }],

    // DNS Prefetch & Preconnect for performance
    ["link", { rel: "dns-prefetch", href: "https://fonts.googleapis.com" }],
    [
      "link",
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
    ],

    // JSON-LD Structured Data
    [
      "script",
      { type: "application/ld+json" },
      JSON.stringify({
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "FieldTest",
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Cross-platform",
        description:
          "Framework-agnostic validation toolkit for Markdown and Standard Schema. Built for Astro, Next.js, and modern frameworks.",
        url: "https://docs.matthewhendricks.net",
        downloadUrl: "https://www.npmjs.com/package/@watthem/fieldtest",
        softwareVersion: "1.0.1",
        author: {
          "@type": "Person",
          name: "Matthew Hendricks",
          url: "https://matthewhendricks.net",
        },
        publisher: {
          "@type": "Organization",
          name: "Westmark Development",
          url: "https://westmark.dev",
        },
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "5",
          ratingCount: "1",
        },
      }),
    ],

    // Additional technical SEO
    ["meta", { name: "format-detection", content: "telephone=no" }],
    ["meta", { httpEquiv: "x-ua-compatible", content: "IE=edge" }],

    // Plausible Analytics
    [
      "script",
      {
        defer: "",
        "data-domain": plausibleDomain,
        src: "https://plausible.io/js/script.js",
      },
    ],
  ],

  themeConfig: {
    logo: "/logo.svg",

    nav: [
      { text: "Guide", link: "/getting-started" },
      { text: "API", link: "/reference/api" },
      { text: "Examples", link: "/examples/" },
      {
        text: "v1.0.1",
        items: [{ text: "Changelog", link: "/changelog" }],
      },
    ],

    sidebar: {
      "/": [
        {
          text: "Getting Started",
          collapsed: false,
          items: [
            { text: "Introduction", link: "/" },
            { text: "Installation", link: "/getting-started" },
            { text: "Quick Start", link: "/quick-start" },
            { text: "Why FieldTest?", link: "/explainers/why-fieldtest" },
          ],
        },
        {
          text: "Guides",
          collapsed: false,
          items: [
            { text: "Schema Validation", link: "/guides/schema-validation" },
            {
              text: "Framework Integration",
              link: "/guides/framework-integration",
            },
            { text: "Biome Integration", link: "/guides/biome-integration" },
            { text: "OpenAPI Integration", link: "/guides/openapi-integration" },
            { text: "Standard Schema", link: "/explainers/standard-schema" },
          ],
        },
        {
          text: "Examples",
          collapsed: false,
          items: [
            { text: "Overview", link: "/examples/" },
          ],
        },
        {
          text: "Reference",
          collapsed: false,
          items: [
            { text: "API Reference", link: "/reference/api" },
            { text: "OpenAPI Reference", link: "/reference/openapi" },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: "github", link: "https://github.com/watthem/fieldtest" },
      { icon: "npm", link: "https://www.npmjs.com/package/@watthem/fieldtest" },
    ],

    search: {
      provider: "local",
    },

    editLink: {
      pattern: "https://github.com/watthem/fieldtest/edit/main/docs/:path",
      text: "Edit this page on GitHub",
    },

    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright © 2024 Matthew Hendricks",
    },

    lastUpdated: {
      text: "Last updated",
      formatOptions: {
        dateStyle: "medium",
      },
    },
  },

  markdown: {
    theme: {
      light: "github-light",
      dark: "github-dark",
    },
    lineNumbers: true,
    codeTransformers: [
      // Add any custom code transformers here if needed
    ],
  },

  cleanUrls: true,

  ignoreDeadLinks: true,

  sitemap: {
    hostname: "https://docs.matthewhendricks.net",
  },
});
