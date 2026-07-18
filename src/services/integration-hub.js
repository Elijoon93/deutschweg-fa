import { resolveResource, openResolvedResource } from './resource-service.js';
import { INTEGRATIONS } from '../integrations/catalog.js';
import { GADGETS } from '../gadgets/registry.js';

export function createIntegrationHub() {
  return {
    integrations: INTEGRATIONS,
    gadgets: GADGETS,
    resolveResource,
    openResource: openResolvedResource,
    capabilities() {
      return {
        webSpeech: 'speechSynthesis' in window,
        speechRecognition: Boolean(window.SpeechRecognition || window.webkitSpeechRecognition),
        indexedDB: 'indexedDB' in window,
        serviceWorker: 'serviceWorker' in navigator,
        persistentStorage: Boolean(navigator.storage?.persist),
        installablePWA: matchMedia('(display-mode: standalone)').matches || navigator.standalone === true
      };
    }
  };
}
