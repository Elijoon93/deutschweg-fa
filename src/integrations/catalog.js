export const INTEGRATIONS = [
  {
    id: 'goethe-test',
    name: 'Goethe – Testen Sie Ihr Deutsch',
    category: 'placement',
    mode: 'external',
    primaryUrl: 'https://www.goethe.de/lrn/pro/30-item/m/de/index.html',
    fallbackUrls: [
      'https://www.goethe.de/de/spr/kur/tsd.html',
      'https://www.goethe.de/de/spr/kur.html'
    ],
    official: true,
    free: true,
    backendRequired: false,
    noteFa: 'ارزیابی اولیه؛ جایگزین تعیین‌سطح حضوری یا مدرک رسمی نیست.'
  },
  {
    id: 'goethe-pron',
    name: 'Goethe Online-Aussprachetrainer',
    category: 'pronunciation',
    mode: 'external',
    primaryUrl: 'https://www.goethe.de/de/spr/ueb/ast.html',
    fallbackUrls: ['https://aussprachetraining.goethe.de/', 'https://www.goethe.de/de/spr/ueb.html'],
    official: true,
    free: true,
    backendRequired: false
  },
  {
    id: 'goethe-exam',
    name: 'Goethe Prüfungstrainings',
    category: 'exam',
    mode: 'external',
    primaryUrl: 'https://www.goethe.de/de/spr/prf/ueb.html',
    fallbackUrls: ['https://www.goethe.de/de/spr/prf.html'],
    official: true,
    free: true,
    backendRequired: false
  },
  {
    id: 'goethe-dfd',
    name: 'Goethe Deutsch für dich',
    category: 'practice',
    mode: 'external',
    primaryUrl: 'https://www.goethe.de/deutsch-fuer-dich',
    fallbackUrls: ['https://www.goethe.de/prj/dfd/de/home.cfm'],
    official: true,
    free: true,
    backendRequired: false
  },
  {
    id: 'duden',
    name: 'Duden Wörterbuch',
    category: 'dictionary',
    mode: 'external-search',
    primaryUrl: 'https://www.duden.de/suchen/dudenonline/',
    fallbackUrls: ['https://www.duden.de/woerterbuch'],
    official: true,
    backendRequired: false
  },
  {
    id: 'languagetool',
    name: 'LanguageTool',
    category: 'writing',
    mode: 'api',
    primaryUrl: 'https://api.languagetool.org/v2/check',
    fallbackUrls: ['https://languagetool.org/http-api/'],
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
