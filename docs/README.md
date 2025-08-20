# FieldTest Landing Page

This directory contains the landing page for FieldTest hosted at [fieldtest.watthem.blog](https://fieldtest.watthem.blog).

## GitHub Pages Setup

1. Go to the watthem/fieldtest repository settings
2. Navigate to "Pages" in the left sidebar
3. Set source to "Deploy from a branch"
4. Choose "main" branch and "/docs" folder
5. The CNAME file will automatically configure the custom domain

## DNS Configuration

Add a CNAME record for your domain:
```
fieldtest.watthem.blog CNAME watthem.github.io
```

## Analytics

The page includes Plausible analytics configured for `fieldtest.watthem.blog` domain.

## Cross-linking Strategy

- Links back to matthewhendricks.net (personal hub)
- References Westmark.dev products that use FieldTest
- GitHub links include UTM tracking for attribution

## Files

- `index.html` - Main landing page following the UX specification
- `CNAME` - Custom domain configuration for GitHub Pages
- `README.md` - This documentation file