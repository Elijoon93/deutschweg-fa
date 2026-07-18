export const GADGETS = [
  { id:'today', title:'Adaptive Today', category:'core', status:'active', requiresBackend:false },
  { id:'focus', title:'Focus / Pomodoro', category:'productivity', status:'active', requiresBackend:false },
  { id:'analytics', title:'Learning Analytics', category:'analytics', status:'active', requiresBackend:false },
  { id:'placement', title:'Placement Center', category:'assessment', status:'active', requiresBackend:false },
  { id:'resource-health', title:'Resource Reliability Center', category:'platform', status:'active', requiresBackend:false },
  { id:'dictionary', title:'Smart Dictionary', category:'vocabulary', status:'active', requiresBackend:false },
  { id:'pronunciation', title:'Pronunciation Studio', category:'speaking', status:'active', requiresBackend:false },
  { id:'podcast', title:'Smart Podcast Player', category:'listening', status:'active', requiresBackend:false },
  { id:'exam', title:'Exam Center', category:'assessment', status:'active', requiresBackend:false },
  { id:'writing', title:'Writing Lab', category:'writing', status:'active-local', requiresBackend:false },
  { id:'translation', title:'Translation Gadget', category:'translation', status:'active-safe-web', requiresBackend:false },
  { id:'cloud', title:'Cloud Sync', category:'platform', status:'optional-ready', requiresBackend:true },
  { id:'ai-coach', title:'Adaptive Coach 2.0', category:'intelligence', status:'active-local', requiresBackend:false }
];

export function gadgetById(id){ return GADGETS.find(x=>x.id===id) || null; }
