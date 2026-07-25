/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath, URL } from 'node:url';
import { createRequire } from 'node:module';

const { version } = createRequire(import.meta.url)('./package.json');

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: "script-defer",
      devOptions: {
        enabled: true,
      },
      manifest: {
        name: 'MyMotionStudio',
        short_name: 'MyMotionStudio',
        description: 'Create 2D & 3D motion design videos in your browser',
        theme_color: '#0f0f12',
        background_color: '#0f0f12',
        display: 'standalone',
        orientation: 'any',
        start_url: "/",
        id: "/",
        display_override: ["window-controls-overlay"],
        protocol_handlers: [
          { protocol: "web+tea", url: "/tea?type=%s" },
          { protocol: "web+coffee", url: "/coffee?type=%s" },
        ],
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        screenshots: [
          {
            src: "/desktop.webp",
            sizes: "3164x1788",
            type: "image/webp",
            form_factor: "wide",
          },
          {
            src: "/phone.webp",
            sizes: "796x1634",
            type: "image/webp",
            platform: "ios",
            label: "MyMotionStudio",
          },
          {
            src: "/phone.webp",
            sizes: "796x1634",
            type: "image/webp",
            platform: "android",
            label: "MyMotionStudio",
          },
        ],
        categories: ["education", "productivity"],
        // Build-time only, can't follow the runtime language switch — kept in
        // sync with index.html's static <html lang="en"> instead of the app's
        // actual fallback language (fr), which only the JS-side i18n setup
        // (src/lib/i18n.ts) can apply dynamically once the page has loaded.
        lang: "en",
      },
      workbox: {
        // json/jpg cover the Text3D font (public/fonts) and the landing-page
        // demo projects + thumbnails (public/demos) — without these, both
        // silently fail once the PWA is actually used offline.
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,json,jpg}'],
        // The full-resolution source art (only used for the OG/share image
        // and as the source the smaller icon-*.png/logo-sm.png were resized
        // from) isn't referenced by the app itself — precaching 2.6MB of PWA
        // install payload for images nothing ever requests is pure waste.
        globIgnores: ['motion-icon.png', 'motion-logo.png'],
        // The 3D object-import demo embeds its GLB models as base64 JSON
        // (~2.5MB), over workbox's default 2MB precache cap — bump it so
        // that demo stays offline-available like the others instead of
        // failing the production build.
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  optimizeDeps: {
    include: [
      'react-router-dom', 'zustand', 'dexie', 'dexie-react-hooks', 'konva', 'react-konva',
      'three', '@react-three/fiber', '@react-three/drei',
      // Without these, Vite pre-bundles the main 'three' package but leaves
      // these example loaders to be transformed on demand, which resolves a
      // second copy of three.js and trips its "multiple instances" warning.
      'three/examples/jsm/loaders/GLTFLoader.js',
      'three/examples/jsm/loaders/OBJLoader.js',
    ],
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    // Konva/react-konva and the Three.js/WebGL renderer both need a real
    // canvas/WebGL context that jsdom doesn't provide — component tests for
    // Canvas2D/Canvas3D would need heavy mocking to be worth much. The test
    // suite instead targets the framework-agnostic logic (store, animation,
    // persistence, hooks), which is both where regressions are cheapest to
    // catch and where they actually happened (see useAutoSave.test.ts).
    exclude: ['node_modules/**', 'dist/**'],
  },
});
