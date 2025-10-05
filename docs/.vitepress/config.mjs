import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'FieldTest',
  description: 'A validation toolkit for Markdown and Standard Schema — built for Astro, Next.js, and modern frameworks.',
  base: '/',
  
  head: [
    ['meta', { name: 'theme-color', content: '#3c82f6' }],
    ['meta', { name: 'og:type', content: 'website' }],
    ['meta', { name: 'og:locale', content: 'en' }],
    ['meta', { name: 'og:site_name', content: 'FieldTest' }],
    ['meta', { name: 'og:image', content: 'https://fieldtest.watthem.blog/logo.png' }],
    ['link', { rel: 'icon', href: '/favicon.ico' }],
  ],

  themeConfig: {
    logo: '/logo.svg',
    
    nav: [
      { text: 'Guide', link: '/getting-started' },
      { text: 'API', link: '/reference/api' },
      { text: 'Examples', link: '/examples/' },
      {
        text: 'v1.0.0',
        items: [
          { text: 'Changelog', link: '/changelog' },
          { text: 'Migration', link: '/migration' },
        ]
      }
    ],

    sidebar: {
      '/': [
        {
          text: 'Getting Started',
          collapsed: false,
          items: [
            { text: 'Introduction', link: '/' },
            { text: 'Installation', link: '/getting-started' },
            { text: 'Quick Start', link: '/quick-start' },
            { text: 'Why FieldTest?', link: '/explainers/why-fieldtest' },
          ]
        },
        {
          text: 'Guides',
          collapsed: false,
          items: [
            { text: 'Schema Validation', link: '/guides/schema-validation' },
            { text: 'Framework Integration', link: '/guides/framework-integration' },
            { text: 'Biome Integration', link: '/guides/biome-integration' },
            { text: 'Standard Schema', link: '/guides/standard-schema' },
          ]
        },
        {
          text: 'Examples',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/examples/' },
            { text: 'Blog Validation', link: '/examples/blog-validation' },
            { text: 'CMS Integration', link: '/examples/cms-integration' },
            { text: 'Astro Content Collections', link: '/examples/astro-content' },
            { text: 'Next.js Pages', link: '/examples/nextjs-pages' },
          ]
        },
        {
          text: 'Reference',
          collapsed: false,
          items: [
            { text: 'API Reference', link: '/reference/api' },
            { text: 'Types', link: '/reference/types' },
            { text: 'Built-in Schemas', link: '/reference/schemas' },
            { text: 'Error Codes', link: '/reference/errors' },
          ]
        },
        {
          text: 'Advanced',
          collapsed: true,
          items: [
            { text: 'Migration from FKit', link: '/migration' },
            { text: 'MCP Integration', link: '/advanced/mcp' },
            { text: 'Performance', link: '/advanced/performance' },
            { text: 'Custom Schemas', link: '/advanced/custom-schemas' },
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/watthem/fieldtest' },
      { icon: 'npm', link: 'https://www.npmjs.com/package/@watthem/fieldtest' }
    ],

    search: {
      provider: 'local'
    },

    editLink: {
      pattern: 'https://github.com/watthem/fieldtest/edit/main/docs/:path',
      text: 'Edit this page on GitHub'
    },

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 Matthew Hendricks'
    },

    lastUpdated: {
      text: 'Last updated',
      formatOptions: {
        dateStyle: 'medium'
      }
    }
  },

  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    },
    lineNumbers: true,
    codeTransformers: [
      // Add any custom code transformers here if needed
    ]
  },

  cleanUrls: true,
  
  ignoreDeadLinks: true,
  
  sitemap: {
    hostname: 'https://docs.matthewhendricks.net'
  }
})
