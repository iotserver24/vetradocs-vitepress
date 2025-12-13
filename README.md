# Vetradocs VitePress Plugin

AI-powered documentation chat for VitePress. Built by **iotserver24**.

[![npm version](https://img.shields.io/npm/v/vetradocs-vitepress.svg)](https://www.npmjs.com/package/vetradocs-vitepress)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🧠 **Context-Aware AI Chat**: Ask questions and get answers from your docs
- ⚡ **Client-Side Search**: Powered by Orama - zero latency, no database needed
- 💬 **Premium UI**: Floating bar + sliding sidebar with smooth animations
- 🎨 **Customizable**: Change colors, position, and behavior
- 📦 **Easy Integration**: Just a few lines of code

## Installation

```bash
npm install vetradocs-vitepress
```

## Quick Start

### 1. Add to your VitePress theme

Create or edit `.vitepress/theme/index.ts`:

```ts
import DefaultTheme from 'vitepress/theme';
import { VetradocsChat, VetradocsFloatingBar } from 'vetradocs-vitepress/theme';

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // Register the components globally
    app.component('VetradocsChat', VetradocsChat);
    app.component('VetradocsFloatingBar', VetradocsFloatingBar);
  },
};
```

### 2. Add to your layout

Create `.vitepress/theme/Layout.vue`:

```vue
<script setup>
import DefaultTheme from 'vitepress/theme';
import { VetradocsChat, VetradocsFloatingBar } from 'vetradocs-vitepress/theme';

const { Layout } = DefaultTheme;
</script>

<template>
  <Layout>
    <template #layout-bottom>
      <VetradocsFloatingBar 
        api-endpoint="/api/chat"
        accent-color="#f97316"
      />
      <VetradocsChat 
        api-endpoint="/api/chat"
        title="AI Assistant"
        accent-color="#f97316"
      />
    </template>
  </Layout>
</template>
```

Update `.vitepress/theme/index.ts`:

```ts
import Layout from './Layout.vue';

export default {
  Layout,
  // ... rest of config
};
```

### 3. Build the search index

```bash
npx vetradocs-build --docs ./docs --output ./docs/public/search-index.json
```

Add this to your `package.json` scripts:

```json
{
  "scripts": {
    "docs:build-index": "vetradocs-build --docs ./docs --output ./docs/public/search-index.json",
    "docs:build": "npm run docs:build-index && vitepress build docs"
  }
}
```

### 4. Set up the API endpoint

The plugin needs a backend to handle AI requests. You can use any of these:

#### Option A: Vercel Edge Function

Create `api/chat.ts`:

```ts
import { ChatOpenAI } from '@langchain/openai';

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  const { messages, context } = await req.json();
  
  const model = new ChatOpenAI({
    modelName: process.env.LLM_MODEL || 'gpt-3.5-turbo',
    configuration: {
      baseURL: process.env.LLM_BASE_URL,
      apiKey: process.env.LLM_API_KEY,
    },
    streaming: true,
  });

  // ... implement your chat logic
}
```

#### Option B: Use with the main Vetradocs project

If you're using the full [Vetradocs](https://github.com/iotserver24/vetradocs) project, the API is already built-in.

## Configuration

### VetradocsFloatingBar Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `apiEndpoint` | `string` | `/api/chat` | Chat API endpoint |
| `indexPath` | `string` | `/search-index.json` | Path to search index |
| `placeholder` | `string` | `Ask a question...` | Input placeholder |
| `accentColor` | `string` | `#f97316` | Primary color |
| `position` | `string` | `bottom-center` | `bottom-center`, `bottom-right`, `bottom-left` |

### VetradocsChat Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `apiEndpoint` | `string` | `/api/chat` | Chat API endpoint |
| `indexPath` | `string` | `/search-index.json` | Path to search index |
| `title` | `string` | `AI Assistant` | Sidebar title |
| `accentColor` | `string` | `#f97316` | Primary color |

## Composable API

For custom implementations:

```ts
import { useVetradocs } from 'vetradocs-vitepress';

const {
  isOpen,       // Ref<boolean> - Chat open state
  messages,     // Ref<Message[]> - Chat history
  input,        // Ref<string> - Current input
  loading,      // Ref<boolean> - Loading state
  sendMessage,  // (text: string) => Promise<void>
  clearChat,    // () => void
  toggleChat,   // () => void
  searchDocs,   // (query: string) => Promise<SearchResult[]>
} = useVetradocs({
  apiEndpoint: '/api/chat',
  indexPath: '/search-index.json',
});
```

## CLI Options

```bash
npx vetradocs-build [options]

Options:
  --docs <path>     Path to docs directory (default: ./docs)
  --output <path>   Output path for index (default: ./docs/public/search-index.json)
```

## License

MIT © [iotserver24](https://github.com/iotserver24)
