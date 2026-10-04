# Task C5: Copilot Chat UI Revamp & Session Persistence Architecture

## 1. Objectives & Requirements
- **Smooth Animated Floating Chat:** Redesign the floating AI Copilot window with slide-up transitions, responsive resizing, minimize/maximize controls, and clear chat history capability.
- **Quick Prompt Pills (`QuickPromptPills.tsx`):** Provide instant one-click prompt categories with icons:
  - 📊 *Analyze Trends*: "What is my spending trend over the last 3 months?"
  - 💡 *Suggest Budget*: "Suggest a monthly budget based on my spending history"
  - 🔍 *Detect Anomalies*: "Did I have any unusual or spike expenses recently?"
  - ⚡ *Subscription Check*: "What are my recurring subscriptions and monthly commitments?"
  - 🛒 *Top Merchants*: "Who are my top 5 merchants by total spend?"
- **Rich Structured Response Formatting:** Support markdown-style bullet cards, bold metrics, currency tags (₹), and animated typing indicators with multi-dot bounce.
- **Persistent Conversation Session:** Store all conversation turns in the Prisma `CopilotSession` table so history is maintained across route changes, browser refreshes, and device sessions.
- **Deep-Linking Support:** Detect `?q=...` query parameters (from `InsightsPanel` "Ask Copilot" button) and seamlessly populate and trigger the conversation.

---

## 2. Backend Implementation Spec (`backend/src/copilot/`)

### A. Prisma Data Model
Uses existing `CopilotSession` in `schema.prisma`:
```prisma
model CopilotSession {
  id        String    @id @default(cuid())
  userId    String
  user      User      @relation(fields: [userId], references: [id])
  messages  Json      // Array of { role: 'user' | 'ai', content: string, timestamp: string }
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}
```

### B. Service Methods (`copilot.service.ts`)
- `getSessionHistory(userId: string)`:
  Queries the latest session for the user and returns the message list.
- `saveMessageToSession(userId: string, role: 'user' | 'ai', content: string)`:
  Finds or creates the user's active session, appending `{ role, content, timestamp: new Date().toISOString() }`.
- `clearSessionHistory(userId: string)`:
  Deletes or clears existing session messages for a fresh chat session.
- `askCopilot(userId: string, question: string)`:
  1. Saves the user question to session history.
  2. Dispatches tool calling loop with Gemini / local LLM across all 8 tools.
  3. Saves the final assistant response to session history.
  4. Returns the structured answer.

### C. Controller Endpoints (`copilot.controller.ts`)
- `GET /copilot/history`: Returns `{ messages: Message[] }`.
- `POST /copilot/ask`: Body `{ question: string }`, returns `{ answer: string }`.
- `POST /copilot/clear`: Resets active session.

---

## 3. Frontend Implementation Spec (`frontend/src/components/copilot/`)

### A. `QuickPromptPills.tsx`
- Renders horizontal scrollable pills with icons and hover effects.
- Disabled during active LLM inference.
- Emits `onSelectPrompt(prompt: string)`.

### B. `CopilotFloatingChat.tsx`
- **State Management:**
  - `messages`: Loaded from `/copilot/history` on mount.
  - `loading`: Animated bouncy dots with "Analyzing financial database..." tooltip.
  - `isOpen`: Controlled toggle from Header or bottom-right floating trigger button.
- **Header Actions:**
  - Status indicator (Green pulse "Connected").
  - Clear conversation button (`Trash2`) with confirmation.
  - Close button (`X`).
- **Deep-linking:**
  - Checks `useLocation().search` for `?q=...` or `?copilot=open`.
  - Automatically opens chat and injects query.

---

## 4. Verification & Commit Gate
1. Backend vitest specs (`copilot.service.spec.ts` & `copilot.controller.spec.ts`).
2. Frontend vitest specs (`copilot.spec.ts`).
3. Frontend compilation (`npm run build`).
4. Stage and commit: `feat(copilot): revamp chat UI with quick prompts and persistent session history (Task C5)`.
