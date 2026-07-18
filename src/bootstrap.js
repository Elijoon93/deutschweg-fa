import { ARCHITECTURE_VERSION, DATA_SCHEMA_VERSION } from './core/constants.js';
import { initDataBridge, mirrorLegacyState } from './core/data-bridge.js';
import { createIntegrationHub } from './services/integration-hub.js';
import { eventBus } from './core/event-bus.js';

async function bootstrap() {
  const data = await initDataBridge();
  const integrations = createIntegrationHub();

  // Correct the broken legacy Goethe placement route without touching user data.
  const legacyOpenResource = typeof window.openResource === 'function' ? window.openResource : null;
  if (legacyOpenResource && !legacyOpenResource.__deutschwegXWrapped) {
    const wrapped = async function(id) {
      if (id === 'goethe-test') {
        const opened = await integrations.openResource(id);
        if (opened) return;
      }
      return legacyOpenResource(id);
    };
    wrapped.__deutschwegXWrapped = true;
    window.openResource = wrapped;
  }

  window.DeutschWegX = Object.freeze({
    architectureVersion: ARCHITECTURE_VERSION,
    dataSchemaVersion: DATA_SCHEMA_VERSION,
    data,
    integrations,
    events: eventBus,
    syncLegacySnapshot: () => mirrorLegacyState('manual-sync')
  });

  document.documentElement.dataset.dwArchitecture = ARCHITECTURE_VERSION;
  eventBus.emit('foundation:ready', window.DeutschWegX);
  console.info(`[DeutschWegX] Foundation ${ARCHITECTURE_VERSION} ready; data schema remains ${DATA_SCHEMA_VERSION}.`);
}

bootstrap().catch(error => console.error('[DeutschWegX] bootstrap failed', error));
