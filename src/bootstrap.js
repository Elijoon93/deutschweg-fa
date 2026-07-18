import { ARCHITECTURE_VERSION, APP_PRODUCT_VERSION, DATA_SCHEMA_VERSION } from './core/constants.js';
import { initDataBridge, mirrorAppState } from './core/data-bridge.js';
import { createIntegrationHub } from './services/integration-hub.js';
import { createPlacementCenter } from './gadgets/placement-center.js';
import { createResourceCenter } from './gadgets/resource-center.js';
import { createSmartDictionary } from './gadgets/smart-dictionary.js';
import { createPronunciationStudio } from './gadgets/pronunciation-studio.js';
import { createSmartPodcast } from './gadgets/smart-podcast.js';
import { createExamCenter } from './gadgets/exam-center.js';
import { createWritingLab } from './gadgets/writing-lab.js';
import { createAdaptiveEngine } from './services/adaptive-engine.js';
import { createAICoach } from './gadgets/ai-coach.js';
import { createCloudCenter } from './gadgets/cloud-center.js';
import { createTranslationGadget } from './gadgets/translation-gadget.js';
import { eventBus } from './core/event-bus.js';

function addMoreHubEntries() {
  const root=document.getElementById('view-more'); if(!root||root.querySelector('[data-dwx-hub]'))return;
  const block=document.createElement('section');block.dataset.dwxHub='true';block.className='dwx1-card';
  const tiles=[
    ['◎','مرکز تعیین سطح','Placement Center','openPlacementCenter()'],['◉','سلامت منابع','Resource Health','openResourceReliabilityCenter()'],
    ['Aa','فرهنگ هوشمند','Smart Dictionary','openSmartDictionary()'],['','استودیوی تلفظ','Pronunciation Studio','openPronunciationStudio()'],
    ['','پادکست هوشمند','Smart Podcast','openSmartPodcast()'],['','مرکز آزمون','Exam Center','openExamCenter()'],
    ['✍','آزمایشگاه نوشتن','Writing Lab','openWritingLab()'],['↔','ترجمه','Translation','openTranslationGadget()'],['⚡','مربی تطبیقی 2.0','Adaptive Coach','openAdaptiveCoachX()'],
    ['☁','Cloud و چند دستگاه','Cloud Sync','openCloudCenterX()']
  ];
  block.innerHTML=`<span class="kicker">DeutschWeg X · International Suite</span><h3>ابزارهای هوشمند یکپارچه</h3><div class="dwx1-grid">${tiles.map(x=>`<button class="dwx1-tile" onclick="${x[3]}"><b>${x[0]} ${x[1]}</b><span>${x[2]}</span></button>`).join('')}</div>`;
  const version=root.querySelector('.version');if(version)version.insertAdjacentElement('beforebegin',block);else root.appendChild(block);
}
function watchMoreHub(){const root=document.getElementById('view-more');if(!root)return;new MutationObserver(()=>queueMicrotask(addMoreHubEntries)).observe(root,{childList:true,subtree:false});addMoreHubEntries()}
async function bootstrap(){
  const data=await initDataBridge();const integrations=createIntegrationHub();const adaptive=createAdaptiveEngine();
  const placement=createPlacementCenter({integrations,events:eventBus});const resources=createResourceCenter({integrations});
  const dictionary=createSmartDictionary({integrations});const pronunciation=createPronunciationStudio({integrations});const podcast=createSmartPodcast({integrations});const exam=createExamCenter({integrations});const writing=createWritingLab();const translation=createTranslationGadget();const coach=createAICoach({adaptive});const cloud=createCloudCenter();
  const legacyOpenResource=typeof window.openResource==='function'?window.openResource:null;
  if(legacyOpenResource&&!legacyOpenResource.__deutschwegXWrapped){const wrapped=function(id){if(id==='goethe-test'){placement.open();return true}if(integrations.knows(id))return integrations.openResource(id);return legacyOpenResource(id)};wrapped.__deutschwegXWrapped=true;window.openResource=wrapped}
  window.DeutschWegX=Object.freeze({productVersion:APP_PRODUCT_VERSION,architectureVersion:ARCHITECTURE_VERSION,dataSchemaVersion:DATA_SCHEMA_VERSION,data,integrations,placement,resources,dictionary,pronunciation,podcast,exam,writing,translation,adaptive,coach,cloud,events:eventBus,syncSnapshot:()=>mirrorAppState('manual-sync')});
  document.documentElement.dataset.dwArchitecture=ARCHITECTURE_VERSION;watchMoreHub();eventBus.emit('foundation:ready',window.DeutschWegX);console.info(`[DeutschWegX] ${ARCHITECTURE_VERSION} ready; data schema ${DATA_SCHEMA_VERSION}.`)
}
bootstrap().catch(error=>console.error('[DeutschWegX] bootstrap failed',error));
