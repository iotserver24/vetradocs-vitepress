<script setup lang="ts">
/**
 * VetradocsFloatingBar - Floating Input Bar Component
 * 
 * A sleek floating input bar at the bottom of the page.
 */

import { useVetradocs } from '../composables/useVetradocs';
import { computed, ref, watch } from 'vue';

const props = defineProps<{
  apiEndpoint?: string;
  indexPath?: string;
  placeholder?: string;
  accentColor?: string;
  position?: 'bottom-center' | 'bottom-right' | 'bottom-left';
}>();

const {
  isOpen,
  isFocused,
  input,
  messages,
  loading,
  sendMessage,
  openChat,
} = useVetradocs({
  apiEndpoint: props.apiEndpoint,
  indexPath: props.indexPath,
});

const placeholder = computed(() => 
  messages.value.length > 0 ? 'Continue...' : (props.placeholder || 'Ask a question...')
);
const accentColor = computed(() => props.accentColor || '#f97316');
const position = computed(() => props.position || 'bottom-center');

const inputRef = ref<HTMLTextAreaElement | null>(null);

const positionClass = computed(() => {
  switch (position.value) {
    case 'bottom-right': return 'position-right';
    case 'bottom-left': return 'position-left';
    default: return 'position-center';
  }
});

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    if (input.value.trim()) {
      openChat();
      sendMessage(input.value);
    }
  }
}

function handleFocus() {
  isFocused.value = true;
}

function handleBlur() {
  setTimeout(() => {
    isFocused.value = false;
  }, 200);
}

function focusInput() {
  inputRef.value?.focus();
}

function handleSendClick() {
  if (input.value.trim()) {
    openChat();
    sendMessage(input.value);
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="float">
      <div 
        v-if="!isOpen"
        :class="['vetradocs-floating-bar', positionClass, { expanded: isFocused || input.length > 0 }]"
      >
        <div 
          class="vetradocs-floating-container"
          :class="{ expanded: isFocused || input.length > 0 }"
          @click="focusInput"
        >
          <textarea
            ref="inputRef"
            v-model="input"
            @keydown="handleKeydown"
            @focus="handleFocus"
            @blur="handleBlur"
            :placeholder="placeholder"
            rows="1"
            class="vetradocs-floating-input"
          />

          <!-- Collapsed state: Shortcut hint -->
          <div v-if="!isFocused && input.length === 0" class="vetradocs-hint">
            <span class="vetradocs-shortcut">Ctrl+I</span>
            <div class="vetradocs-hint-icon" :style="{ borderColor: accentColor + '33' }">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </div>
          </div>

          <!-- Expanded state: Send button -->
          <button 
            v-if="isFocused || input.length > 0"
            @click.stop="handleSendClick"
            :disabled="loading || !input.trim()"
            class="vetradocs-floating-send"
            :style="{ backgroundColor: accentColor + '80', borderColor: accentColor + '50' }"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.vetradocs-floating-bar {
  position: fixed;
  bottom: 32px;
  z-index: 998;
  transition: all 0.5s ease;
}

.position-center {
  left: 50%;
  transform: translateX(-50%);
}

.position-right {
  right: 32px;
}

.position-left {
  left: 32px;
}

.vetradocs-floating-bar.expanded.position-center {
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 640px;
  padding: 0 16px;
}

.vetradocs-floating-container {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px;
  background: #000;
  border: 1px solid v-bind(accentColor + '50');
  border-radius: 9999px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 30px rgba(249, 115, 22, 0.1);
  cursor: text;
  transition: all 0.5s ease;
  width: 340px;
  height: 52px;
}

.vetradocs-floating-container.expanded {
  width: 100%;
  max-width: 640px;
  border-radius: 28px;
  padding: 6px 8px;
}

.vetradocs-floating-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  resize: none;
  padding: 8px 20px;
  font-size: 16px;
  color: var(--vp-c-text-1, #f4f4f5);
  font-family: inherit;
  height: 100%;
  white-space: nowrap;
  overflow-x: auto;
  overflow-y: hidden;
}

.vetradocs-floating-input::-webkit-scrollbar {
  display: none;
}

.vetradocs-floating-input::placeholder {
  color: var(--vp-c-text-3, #71717a);
}

.vetradocs-hint {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  pointer-events: none;
}

.vetradocs-shortcut {
  font-size: 10px;
  font-family: monospace;
  color: var(--vp-c-text-3, #52525b);
}

.vetradocs-hint-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(249, 115, 22, 0.1);
  border: 1px solid;
  display: flex;
  align-items: center;
  justify-content: center;
}

.vetradocs-hint-icon svg {
  width: 16px;
  height: 16px;
  color: rgba(249, 115, 22, 0.8);
}

.vetradocs-floating-send {
  flex-shrink: 0;
  padding: 8px;
  margin-right: 4px;
  border: 1px solid;
  border-radius: 50%;
  cursor: pointer;
  color: rgba(249, 115, 22, 0.9);
  transition: all 0.2s;
}

.vetradocs-floating-send:hover:not(:disabled) {
  filter: brightness(1.2);
  transform: scale(1.05);
}

.vetradocs-floating-send:disabled {
  opacity: 0;
  cursor: not-allowed;
}

.vetradocs-floating-send svg {
  width: 20px;
  height: 20px;
}

/* Transition */
.float-enter-active,
.float-leave-active {
  transition: transform 0.5s ease, opacity 0.5s ease;
}

.float-enter-from,
.float-leave-to {
  transform: translateY(150%);
  opacity: 0;
}
</style>
