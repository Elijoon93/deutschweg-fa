export const GADGETS = [
  { id:'today', title:'Adaptive Today', category:'core', status:'active', requiresBackend:false },
  { id:'focus', title:'Focus / Pomodoro', category:'productivity', status:'active', requiresBackend:false },
  { id:'analytics', title:'Learning Analytics', category:'analytics', status:'active', requiresBackend:false },
  { id:'placement', title:'Placement Center', category:'assessment', status:'foundation', requiresBackend:false },
  { id:'dictionary', title:'Smart Dictionary', category:'vocabulary', status:'foundation', requiresBackend:false },
  { id:'pronunciation', title:'Pronunciation Studio', category:'speaking', status:'foundation', requiresBackend:false },
  { id:'writing', title:'Writing Lab', category:'writing', status:'planned', requiresBackend:true },
  { id:'translation', title:'Translation Gadget', category:'translation', status:'planned', requiresBackend:true },
  { id:'podcast', title:'Smart Podcast Player', category:'listening', status:'foundation', requiresBackend:false },
  { id:'exam', title:'Exam Center', category:'assessment', status:'foundation', requiresBackend:false },
  { id:'resource-health', title:'Resource Health Monitor', category:'platform', status:'active', requiresBackend:false },
  { id:'cloud', title:'Cloud Sync', category:'platform', status:'optional', requiresBackend:true },
  { id:'ai-coach', title:'AI Coach', category:'intelligence', status:'planned', requiresBackend:true }
];

export function gadgetById(id){ return GADGETS.find(x=>x.id===id) || null; }
