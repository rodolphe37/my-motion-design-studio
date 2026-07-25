import common_fr from './fr/common';
import landing_fr from './fr/landing';
import projects_fr from './fr/projects';
import settings_fr from './fr/settings';
import editor_fr from './fr/editor';

import common_en from './en/common';
import landing_en from './en/landing';
import projects_en from './en/projects';
import settings_en from './en/settings';
import editor_en from './en/editor';

// DocsPage content (fr/docs.ts, en/docs.ts) is NOT part of these resources —
// it's a large prose corpus selected directly by language in DocsPage.tsx,
// not addressed through individual t() keys.
export const resources = {
  fr: {
    common: common_fr,
    landing: landing_fr,
    projects: projects_fr,
    settings: settings_fr,
    editor: editor_fr,
  },
  en: {
    common: common_en,
    landing: landing_en,
    projects: projects_en,
    settings: settings_en,
    editor: editor_en,
  },
} as const;

export const defaultNS = 'common';
export const namespaces = ['common', 'landing', 'projects', 'settings', 'editor'] as const;
