# Deployment Instructions

## fieldtest docs

### Build
```bash
cd /home/watthem/git/oss/@watthem/fieldtest
pnpm docs:build
```

### Deploy to Netlify

Option 1 - One-line deploy:
```bash
cd /home/watthem/git/oss/@watthem/fieldtest
netlify deploy --dir=docs/.vitepress/dist --site 39cce096-03bb-4b57-9beb-dfa1d6aa8948 --prod
```

Option 2 - Use deploy.sh (recommended):
```bash
cd /home/watthem/git/oss/@watthem/fieldtest
./deploy.sh --prod
```

Option 3 - Preview deploy:
```bash
cd /home/watthem/git/oss/@watthem/fieldtest
./deploy.sh --preview --message "Docs update"
```

## Current Setup

- **Hosting:** Netlify (manual deploys)
- **Site URL:** https://fieldtest.matthewhendricks.net/
- **Site ID:** 39cce096-03bb-4b57-9beb-dfa1d6aa8948
- **Build command:** `pnpm docs:build`
- **Publish directory:** `docs/.vitepress/dist`
