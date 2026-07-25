import '@testing-library/jest-dom';
import 'fake-indexeddb/auto';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import i18n from '@/lib/i18n';

// Force a deterministic language regardless of jsdom's navigator.language
// (which the browser-language-detector would otherwise pick up), so default
// names produced by factories.ts/store.ts are stable across test runs.
// Top-level await ensures this resolves before any test file runs.
await i18n.changeLanguage('fr');

afterEach(() => {
  cleanup();
});
