/**
 * Internal Plugins (gnon)
 * 
 * Collection of built-in plugins that are loaded by default.
 * These plugins are designed to be completely independent,
 * using only public APIs for all operations.
 */

import { HelloWorldPlugin } from './hello-world';

// Export plugin instances (not just classes) for immediate use
export const internalPlugins = [
    new HelloWorldPlugin()
];

// Export classes for external use if needed
export { HelloWorldPlugin };
