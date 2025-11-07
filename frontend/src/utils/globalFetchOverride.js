// Global fetch override to prevent Emergent monitoring script conflicts
// This MUST be imported FIRST before any other code runs

import { xhrFetch } from './xhrFetch';

console.log('🔧 Overriding global fetch to prevent clone errors...');

// Save original fetch
const originalFetch = window.fetch;

// Override with xhrFetch
window.fetch = xhrFetch;

// Also override for any modules that might have cached fetch
if (typeof global !== 'undefined') {
  global.fetch = xhrFetch;
}

console.log('✅ Global fetch override complete - no more clone errors!');

export { originalFetch };
