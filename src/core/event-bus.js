class EventBus {
  constructor() { this.map = new Map(); }
  on(type, fn) {
    if (!this.map.has(type)) this.map.set(type, new Set());
    this.map.get(type).add(fn);
    return () => this.map.get(type)?.delete(fn);
  }
  emit(type, payload) {
    for (const fn of this.map.get(type) || []) {
      try { fn(payload); } catch (error) { console.error('[DeutschWegX:event]', type, error); }
    }
  }
}
export const eventBus = new EventBus();
