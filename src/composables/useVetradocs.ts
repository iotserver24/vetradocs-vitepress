/**
 * Vetradocs Composable for Vue 3
 * 
 * Provides reactive state and methods for the AI chat.
 */

import { ref, onMounted, onUnmounted } from 'vue';
import { restore } from '@orama/plugin-data-persistence';
import { search } from '@orama/orama';
import type { VetradocsConfig, VetradocsMessage, SearchResult } from '../types';

export function useVetradocs(config: VetradocsConfig = {}) {
    const isOpen = ref(false);
    const isFocused = ref(false);
    const input = ref('');
    const messages = ref<VetradocsMessage[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);

    // Orama database instance
    let oramaDB: any = null;

    // Default config values
    const indexPath = config.indexPath || '/search-index.json';
    const apiEndpoint = config.apiEndpoint || '/api/chat';
    const shortcut = config.shortcut || 'i';

    // Load the Orama index
    async function loadIndex() {
        try {
            const response = await fetch(indexPath);
            if (!response.ok) {
                console.warn('[Vetradocs] Search index not found. Run `npx vetradocs-build` first.');
                return;
            }
            const data = await response.text();
            oramaDB = await restore('json', data);
            console.log('[Vetradocs] Search index loaded successfully.');
        } catch (err) {
            console.error('[Vetradocs] Failed to load search index:', err);
        }
    }

    // Search the documentation
    async function searchDocs(query: string, limit = 3): Promise<SearchResult[]> {
        if (!oramaDB) return [];

        try {
            const result = await search(oramaDB, { term: query, limit });
            return result.hits.map((hit: any) => ({
                title: hit.document.title,
                url: hit.document.url,
                content: hit.document.content,
            }));
        } catch (err) {
            console.error('[Vetradocs] Search failed:', err);
            return [];
        }
    }

    // Send a message to the AI
    async function sendMessage(messageText: string) {
        if (!messageText.trim() || loading.value) return;

        const userMsg: VetradocsMessage = { role: 'user', content: messageText };
        messages.value.push(userMsg);
        input.value = '';
        loading.value = true;
        error.value = null;

        try {
            // Get relevant context from docs
            const context = await searchDocs(messageText);
            const contextText = context
                .map(doc => `Source: ${doc.title}\nContent: ${doc.content}`)
                .join('\n---\n');

            // Send to API
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: messages.value,
                    context: contextText,
                }),
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            if (!response.body) {
                throw new Error('No response body');
            }

            // Handle streaming response
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            const aiMsg: VetradocsMessage = { role: 'assistant', content: '' };
            messages.value.push(aiMsg);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                aiMsg.content += chunk;

                // Update reactive state
                messages.value = [...messages.value.slice(0, -1), { ...aiMsg }];
            }
        } catch (err: any) {
            console.error('[Vetradocs] Chat error:', err);
            error.value = err.message || 'Something went wrong';
            messages.value.push({
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.',
            });
        } finally {
            loading.value = false;
        }
    }

    // Clear chat history
    function clearChat() {
        messages.value = [];
        error.value = null;
    }

    // Toggle chat open/closed
    function toggleChat() {
        isOpen.value = !isOpen.value;
    }

    // Open the chat
    function openChat() {
        isOpen.value = true;
    }

    // Close the chat
    function closeChat() {
        isOpen.value = false;
    }

    // Keyboard shortcut handler
    function handleKeydown(e: KeyboardEvent) {
        if ((e.ctrlKey || e.metaKey) && e.key === shortcut) {
            e.preventDefault();
            toggleChat();
        }
        if (e.key === 'Escape' && isOpen.value) {
            closeChat();
        }
    }

    // Lifecycle hooks
    onMounted(() => {
        loadIndex();
        window.addEventListener('keydown', handleKeydown);
    });

    onUnmounted(() => {
        window.removeEventListener('keydown', handleKeydown);
    });

    return {
        // State
        isOpen,
        isFocused,
        input,
        messages,
        loading,
        error,

        // Methods
        sendMessage,
        clearChat,
        toggleChat,
        openChat,
        closeChat,
        searchDocs,
    };
}
