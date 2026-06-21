// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
// @cloudflare/vite-plugin builds from this — wrangler.jsonc main alone is insufficient.
export default defineConfig({
  // Vercel can't run Cloudflare Workers — disable CF plugin and prerender
  // a static SPA shell instead. VERCEL=1 is injected automatically by Vercel.
  cloudflare: process.env.VERCEL ? false : undefined,
  tanstackStart: {
    server: { entry: "server" },
    ...(process.env.VERCEL
      ? { spa: { enabled: true, prerender: { outputPath: "/index.html" } } }
      : {}),
  },
});
