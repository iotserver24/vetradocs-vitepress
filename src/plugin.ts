/**
 * Vetradocs VitePress Plugin Configuration
 */

import type { VetradocsConfig } from './types';

const defaultConfig: Required<VetradocsConfig> = {
    indexPath: '/search-index.json',
    apiEndpoint: '/api/chat',
    placeholder: 'Ask a question...',
    title: 'AI Assistant',
    shortcut: 'i',
    accentColor: '#f97316',
    position: 'bottom-center',
    enabled: true,
};

let pluginConfig: Required<VetradocsConfig> = { ...defaultConfig };

/**
 * Configure the Vetradocs plugin
 */
export function vetradocsPlugin(config: VetradocsConfig = {}) {
    pluginConfig = { ...defaultConfig, ...config };
    return pluginConfig;
}

/**
 * Get the current plugin configuration
 */
export function getVetradocsConfig(): Required<VetradocsConfig> {
    return pluginConfig;
}
