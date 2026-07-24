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
      manifest: {
        name: 'MyMotionDesignStudio',
        short_name: 'MyMotionDesignStudio',
        description: 'Create 2D & 3D motion design videos in your browser',
        theme_color: '#0f0f12',
        background_color: '#0f0f12',
        display: 'standalone',
        orientation: 'any',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
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
});
