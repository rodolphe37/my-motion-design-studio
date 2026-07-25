import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as docsFr from '@/locales/fr/docs';
import * as docsEn from '@/locales/en/docs';

export default function DocsPage() {
  const { t, i18n } = useTranslation('common');
  const { SECTIONS, CONTENT, Search, ChevronRight } = i18n.language === 'en' ? docsEn : docsFr;
  const [activeSection, setActiveSection] = useState('start');
  const [query, setQuery] = useState('');

  const filteredSections = useMemo(() => {
    if (!query) return SECTIONS;
    const q = query.toLowerCase();
    return SECTIONS.filter((s) => s.label.toLowerCase().includes(q) || (CONTENT[s.id]?.title || '').toLowerCase().includes(q));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, i18n.language]);

  const content = CONTENT[activeSection];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="grid lg:grid-cols-[260px_1fr] gap-8">
        {/* Sidebar */}
        <aside className="lg:sticky lg:top-20 lg:h-[calc(100vh-6rem)] lg:overflow-y-auto scrollbar-thin">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input
              type="text"
              placeholder={t('docsSearchPlaceholder')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="input pl-9"
            />
          </div>
          <nav className="space-y-1">
            {filteredSections.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all text-left ${
                  activeSection === s.id
                    ? 'bg-accent-violet/10 text-accent-violet'
                    : 'text-ink-300 hover:text-ink-50 hover:bg-ink-750'
                }`}
              >
                <s.icon className="w-4 h-4 shrink-0" />
                {s.label}
                {activeSection === s.id && <ChevronRight className="w-4 h-4 ml-auto" />}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <div className="min-w-0 max-w-3xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{content?.title}</h1>
            <div className="h-1 w-16 bg-gradient-to-r from-accent-violet to-accent-blue rounded-full" />
          </div>
          <div className="space-y-6">
            {content?.body.map((block, i) => (
              <div key={i}>
                {block.h && <h2 className="text-xl font-semibold mb-2 text-ink-50">{block.h}</h2>}
                <p className="text-ink-300 leading-relaxed">{block.p}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
