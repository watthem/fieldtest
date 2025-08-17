/// <reference types="astro/client" />

interface ImportMetaEnv {
	readonly MODE: string;
	readonly BASE_URL: string;
	readonly SITE?: string;
	readonly ASSETS_PREFIX?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
