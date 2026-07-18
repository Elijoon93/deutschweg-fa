export const INTEGRATIONS = [
  {
    id: 'goethe-test',
    name: 'Goethe – Testen Sie Ihr Deutsch',
    category: 'placement',
    mode: 'external',
    primaryUrl: 'https://www.goethe.de/lrn/pro/30-item/m/de/index.html',
    fallbackUrls: [
      'https://www.goethe.de/de/m/spr/kur/tsd.html',
      'https://www.goethe.de/de/spr/kur/tsd.html'
    ],
    official: true,
    free: true,
    backendRequired: false
  },
  {
    id: 'goethe-pron',
    name: 'Goethe Online-Aussprachetrainer',
    category: 'pronunciation',
    mode: 'external',
    primaryUrl: 'https://www.goethe.de/de/spr/ueb/ast.html',
    fallbackUrls: ['https://www.goethe.de/de/spr/ueb.html'],
    official: true,
    free: true,
    backendRequired: false
  },
  {
    id: 'duden',
    name: 'Duden',
    category: 'dictionary',
    mode: 'external-search',
    primaryUrl: 'https://www.duden.de/suchen/dudenonline/',
    official: true,
    backendRequired: false
  },
  {
    id: 'languagetool',
    name: 'LanguageTool',
    category: 'writing',
    mode: 'api',
    backendRequired: true,
    status: 'planned'
  },
  {
    id: 'deepl',
    name: 'DeepL',
    category: 'translation',
    mode: 'api',
    backendRequired: true,
    status: 'planned'
  },
  {
    id: 'forvo',
    name: 'Forvo',
    category: 'native-pronunciation',
    mode: 'api',
    backendRequired: true,
    status: 'planned'
  }
];

export function integrationById(id) {
  return INTEGRATIONS.find(x => x.id === id) || null;
}
