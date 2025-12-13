<script setup lang="ts">
/**
 * VetradocsChat - Main Chat Sidebar Component
 * 
 * A sliding sidebar panel with the AI chat interface.
 */

import { useVetradocs } from '../composables/useVetradocs';
import { computed, ref, watch, nextTick } from 'vue';

const props = defineProps<{
  apiEndpoint?: string;
  indexPath?: string;
  title?: string;
  accentColor?: string;
}>();

const {
  isOpen,
  messages,
  input,
  loading,
  sendMessage,
  clearChat,
  closeChat,
} = useVetradocs({
  apiEndpoint: props.apiEndpoint,
  indexPath: props.indexPath,
});

const title = computed(() => props.title || 'AI Assistant');
const accentColor = computed(() => props.accentColor || '#f97316');

const scrollContainer = ref<HTMLElement | null>(null);
const inputRef = ref<HTMLTextAreaElement | null>(null);

// Auto-scroll to bottom when messages change
watch(messages, async () => {
  await nextTick();
  if (scrollContainer.value) {
    scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight;
  }
}, { deep: true });

// Focus input when sidebar opens
watch(isOpen, (open) => {
  if (open) {
    nextTick(() => inputRef.value?.focus());
  }
});

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage(input.value);
  }
}

function adjustTextareaHeight(e: Event) {
  const target = e.target as HTMLTextAreaElement;
  target.style.height = 'auto';
  target.style.height = Math.min(target.scrollHeight, 200) + 'px';
}
</script>

<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition name="fade">
      <div 
        v-if="isOpen" 
        class="vetradocs-backdrop"
        @click="closeChat"
      />
    </Transition>

    <!-- Sidebar -->
    <Transition name="slide">
      <div v-if="isOpen" class="vetradocs-sidebar">
        <!-- Header -->
        <div class="vetradocs-header">
          <div class="vetradocs-header-title">
            <svg class="vetradocs-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 3l1.45 2.9L16.5 7l-2.05 2.1.5 3.4L12 11l-2.95 1.5.5-3.4L7.5 7l3.05-1.1L12 3z"/>
            </svg>
            <span>{{ title }}</span>
          </div>
          <div class="vetradocs-header-actions">
            <button @click="clearChat" class="vetradocs-btn-icon" title="Clear chat">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z"/>
              </svg>
            </button>
            <button @click="closeChat" class="vetradocs-btn-icon" title="Close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Messages -->
        <div ref="scrollContainer" class="vetradocs-messages">
          <!-- Empty state -->
          <div v-if="messages.length === 0" class="vetradocs-empty">
            <h4>How can I help?</h4>
            <p>Ask me about the documentation.</p>
          </div>

          <!-- Message list -->
          <div 
            v-for="(msg, i) in messages" 
            :key="i"
            :class="['vetradocs-message', msg.role]"
          >
            <div v-if="msg.role === 'assistant'" class="vetradocs-avatar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 3l1.45 2.9L16.5 7l-2.05 2.1.5 3.4L12 11l-2.95 1.5.5-3.4L7.5 7l3.05-1.1L12 3z"/>
              </svg>
            </div>
            <div class="vetradocs-message-content" v-html="msg.content" />
          </div>

          <!-- Loading indicator -->
          <div v-if="loading" class="vetradocs-loading">Thinking...</div>
        </div>

        <!-- Input -->
        <div class="vetradocs-input-container">
          <div class="vetradocs-input-wrapper">
            <textarea
              ref="inputRef"
              v-model="input"
              @keydown="handleKeydown"
              @input="adjustTextareaHeight"
              placeholder="Ask a question..."
              rows="1"
              class="vetradocs-input"
            />
            <button 
              @click="sendMessage(input)"
              :disabled="loading || !input.trim()"
              class="vetradocs-send-btn"
              :style="{ backgroundColor: accentColor }"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.vetradocs-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 999;
}

.vetradocs-sidebar {
  position: fixed;
  top: 16px;
  bottom: 16px;
  right: 16px;
  width: 420px;
  max-width: calc(100vw - 32px);
  background: var(--vp-c-bg-soft, #1a1a1a);
  border: 1px solid var(--vp-c-divider, #2e2e2e);
  border-radius: 16px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.vetradocs-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid var(--vp-c-divider, #2e2e2e);
}

.vetradocs-header-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: var(--vp-c-text-1, #fff);
}

.vetradocs-header-actions {
  display: flex;
  gap: 4px;
}

.vetradocs-icon {
  width: 18px;
  height: 18px;
  color: v-bind(accentColor);
}

.vetradocs-btn-icon {
  padding: 6px;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  color: var(--vp-c-text-2, #888);
  transition: all 0.2s;
}

.vetradocs-btn-icon:hover {
  background: var(--vp-c-bg-mute, #2a2a2a);
  color: var(--vp-c-text-1, #fff);
}

.vetradocs-btn-icon svg {
  width: 16px;
  height: 16px;
}

.vetradocs-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.vetradocs-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: var(--vp-c-text-2, #888);
}

.vetradocs-empty h4 {
  font-size: 16px;
  font-weight: 600;
  color: var(--vp-c-text-1, #fff);
  margin-bottom: 8px;
}

.vetradocs-empty p {
  font-size: 14px;
}

.vetradocs-message {
  display: flex;
  gap: 8px;
}

.vetradocs-message.user {
  justify-content: flex-end;
}

.vetradocs-message.user .vetradocs-message-content {
  background: var(--vp-c-bg-mute, #2a2a2a);
  border-radius: 16px 16px 4px 16px;
}

.vetradocs-message.assistant .vetradocs-message-content {
  background: transparent;
}

.vetradocs-avatar {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: rgba(249, 115, 22, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.vetradocs-avatar svg {
  width: 14px;
  height: 14px;
  color: v-bind(accentColor);
}

.vetradocs-message-content {
  max-width: 85%;
  padding: 10px 14px;
  font-size: 14px;
  line-height: 1.6;
  color: var(--vp-c-text-1, #fff);
}

.vetradocs-loading {
  font-size: 12px;
  color: var(--vp-c-text-2, #888);
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.vetradocs-input-container {
  padding: 16px;
  border-top: 1px solid var(--vp-c-divider, #2e2e2e);
}

.vetradocs-input-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 8px;
  background: var(--vp-c-bg-mute, #2a2a2a);
  border: 1px solid var(--vp-c-divider, #2e2e2e);
  border-radius: 20px;
}

.vetradocs-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  resize: none;
  padding: 8px 12px;
  font-size: 14px;
  color: var(--vp-c-text-1, #fff);
  max-height: 200px;
  font-family: inherit;
}

.vetradocs-input::placeholder {
  color: var(--vp-c-text-3, #666);
}

.vetradocs-send-btn {
  padding: 8px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  color: white;
  transition: all 0.2s;
  flex-shrink: 0;
}

.vetradocs-send-btn:hover:not(:disabled) {
  filter: brightness(1.1);
  transform: scale(1.05);
}

.vetradocs-send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.vetradocs-send-btn svg {
  width: 18px;
  height: 18px;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
