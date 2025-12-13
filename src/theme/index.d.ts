/**
 * Vetradocs Theme Types
 */

import type { DefineComponent } from 'vue';

export declare const VetradocsChat: DefineComponent<{
    apiEndpoint?: string;
    indexPath?: string;
    title?: string;
    accentColor?: string;
}>;

export declare const VetradocsFloatingBar: DefineComponent<{
    apiEndpoint?: string;
    indexPath?: string;
    placeholder?: string;
    accentColor?: string;
    position?: 'bottom-center' | 'bottom-right' | 'bottom-left';
}>;
