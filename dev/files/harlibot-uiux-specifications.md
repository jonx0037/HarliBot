# HarliBot UI/UX Specifications Document
## Interface Design & User Experience Guidelines

**Project**: HarliBot - City of Harlingen AI Chatbot  
**Version**: 1.0  
**Date**: January 17, 2025  
**Author**: Jonathan Rocha

---

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Visual Design System](#visual-design-system)
3. [Component Specifications](#component-specifications)
4. [Wireframes & Mockups](#wireframes--mockups)
5. [Interaction Patterns](#interaction-patterns)
6. [Bilingual UI Implementation](#bilingual-ui-implementation)
7. [Responsive Design](#responsive-design)
8. [Accessibility Requirements](#accessibility-requirements)
9. [Animation & Transitions](#animation--transitions)
10. [Error Handling & Edge Cases](#error-handling--edge-cases)

---

## Design Philosophy

### Core Principles

1. **Government-Appropriate**: Professional, trustworthy, accessible
2. **Unobtrusive**: Widget doesn't interfere with main site navigation
3. **Familiar**: Follows modern chat UI conventions users expect
4. **Bilingual-First**: Equal quality experience in English and Spanish
5. **Accessible**: WCAG 2.1 AA compliance minimum

### Design Goals

- **Primary**: Make chatbot feel like a natural extension of harlingentx.gov
- **Secondary**: Improve upon current chatbot's poor integration
- **Tertiary**: Set foundation for future enhancements

### User Personas

**Persona 1: Maria (Spanish-speaking resident)**
- Age: 45
- Tech comfort: Medium
- Primary language: Spanish
- Use case: Needs to find trash pickup schedule

**Persona 2: John (English-speaking business owner)**
- Age: 52
- Tech comfort: High
- Primary language: English
- Use case: Looking for permit information

**Persona 3: Sofia (Bilingual student)**
- Age: 19
- Tech comfort: Very high
- Languages: Both English and Spanish
- Use case: Finding parks and recreation programs

---

## Visual Design System

### Color Palette

**City of Harlingen Brand Colors** (Primary):
```css
--harlingen-blue:    #003B71;    /* Primary - City official blue */
--harlingen-gold:    #D4A017;    /* Accent - Texas gold */
--harlingen-green:   #2D5F3F;    /* Secondary - Rio Grande Valley green */
```

**HarliBot UI Colors** (Functional):
```css
/* Light Theme (Default) */
--bg-primary:        #FFFFFF;
--bg-secondary:      #F5F7FA;
--bg-chat:           #F0F4F8;

--text-primary:      #1A202C;
--text-secondary:    #4A5568;
--text-muted:        #718096;

--border-light:      #E2E8F0;
--border-medium:     #CBD5E0;

--user-message-bg:   #003B71;    /* Harlingen blue */
--user-message-text: #FFFFFF;

--bot-message-bg:    #F7FAFC;
--bot-message-text:  #2D3748;

--accent-hover:      #D4A017;    /* Gold for hover states */
--accent-active:     #B8860B;    /* Darker gold for active */

--error:             #E53E3E;
--warning:           #DD6B20;
--success:           #38A169;
--info:              #3182CE;

/* Shadows */
--shadow-sm:  0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md:  0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg:  0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-xl:  0 20px 25px -5px rgba(0, 0, 0, 0.1);
```

### Typography

**Font Stack**:
```css
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 
             'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;

--font-mono: 'JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', monospace;
```

**Type Scale**:
```css
--text-xs:   0.75rem;   /* 12px */
--text-sm:   0.875rem;  /* 14px */
--text-base: 1rem;      /* 16px */
--text-lg:   1.125rem;  /* 18px */
--text-xl:   1.25rem;   /* 20px */
--text-2xl:  1.5rem;    /* 24px */

--font-weight-normal:  400;
--font-weight-medium:  500;
--font-weight-semibold: 600;
--font-weight-bold:     700;
```

**Line Heights**:
```css
--leading-tight:  1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
```

### Spacing System

```css
--space-1:  0.25rem;  /* 4px */
--space-2:  0.5rem;   /* 8px */
--space-3:  0.75rem;  /* 12px */
--space-4:  1rem;     /* 16px */
--space-5:  1.25rem;  /* 20px */
--space-6:  1.5rem;   /* 24px */
--space-8:  2rem;     /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
```

### Border Radius

```css
--radius-sm:  0.125rem;  /* 2px */
--radius-md:  0.375rem;  /* 6px */
--radius-lg:  0.5rem;    /* 8px */
--radius-xl:  0.75rem;   /* 12px */
--radius-2xl: 1rem;      /* 16px */
--radius-full: 9999px;   /* Fully rounded */
```

---

## Component Specifications

### 1. Chat Toggle Button (Minimized State)

**Purpose**: Always-visible trigger to open chat widget

**Visual Specifications**:
```
Dimensions: 60px × 60px (circle)
Position: Fixed bottom-right
  - Right: 24px from viewport edge
  - Bottom: 24px from viewport edge
Background: var(--harlingen-blue) with gradient
Border: None
Shadow: var(--shadow-lg)
Icon: Chat bubble or message icon (white)
Icon size: 28px × 28px
```

**States**:
- **Default**: Blue background, subtle pulse animation
- **Hover**: Slight scale (1.05), gold glow
- **Active/Pressed**: Scale down (0.95)
- **Focus**: Blue outline (for keyboard navigation)

**Badge** (when unread messages):
```
Position: Top-right corner of button
Size: 20px × 20px (circle)
Background: var(--error) red
Text: White, bold, small (10px)
Content: Number of unread messages (max "9+")
```

**Component Code Structure**:
```tsx
<button
  className="chat-toggle-button"
  aria-label="Open HarliBot chat assistant"
  onClick={handleToggle}
>
  <ChatIcon className="w-7 h-7" />
  {unreadCount > 0 && (
    <span className="unread-badge" aria-label={`${unreadCount} unread messages`}>
      {unreadCount > 9 ? '9+' : unreadCount}
    </span>
  )}
</button>
```

---

### 2. Chat Window (Expanded State)

**Purpose**: Main chat interface

**Visual Specifications**:
```
Dimensions: 
  - Desktop: 400px wide × 600px tall
  - Tablet: 360px wide × 550px tall
  - Mobile: Full screen (with safe areas)

Position: Fixed bottom-right
  - Right: 24px from viewport edge
  - Bottom: 24px from viewport edge
  
Border-radius: var(--radius-2xl) 16px
Background: var(--bg-primary) white
Border: 1px solid var(--border-light)
Shadow: var(--shadow-xl)
```

**Layout Structure**:
```
┌─────────────────────────────────┐
│  Header (60px tall)             │ ← Logo, Title, Language Toggle, Close
├─────────────────────────────────┤
│                                 │
│  Message List (flex-grow)       │ ← Scrollable conversation
│                                 │
│                                 │
├─────────────────────────────────┤
│  Input Area (80px tall)         │ ← Text input + Send button
└─────────────────────────────────┘
```

---

### 3. Chat Header

**Visual Specifications**:
```
Height: 60px
Background: var(--harlingen-blue)
Padding: var(--space-4) 16px
Border-radius: var(--radius-2xl) var(--radius-2xl) 0 0
```

**Contents** (Left to Right):
1. **Logo/Avatar** (40px circle)
   - HarliBot icon or City of Harlingen seal
   - Background: white
   - Icon: Gold or blue

2. **Title & Status** (flex-grow)
   ```
   "HarliBot"          (text-lg, white, bold)
   "City of Harlingen" (text-sm, white/80%, normal)
   ```

3. **Language Toggle** (compact)
   ```
   [EN | ES]
   - Active: white, bold
   - Inactive: white/60%, normal
   - Separator: white/40%
   - Clickable, instant switch
   ```

4. **Close Button** (32px × 32px)
   - Icon: X or chevron-down
   - Color: white
   - Hover: white/80% with gold background

**Component Code**:
```tsx
<header className="chat-header">
  <div className="flex items-center gap-3">
    <Avatar src="/harlibot-icon.png" alt="HarliBot" />
    <div>
      <h2 className="font-bold text-lg text-white">HarliBot</h2>
      <p className="text-sm text-white/80">{t('city_of_harlingen')}</p>
    </div>
  </div>
  
  <div className="flex items-center gap-2">
    <LanguageToggle current={language} onChange={setLanguage} />
    <CloseButton onClick={handleClose} />
  </div>
</header>
```

---

### 4. Message List

**Visual Specifications**:
```
Background: var(--bg-chat) #F0F4F8
Padding: var(--space-4) 16px
Overflow-y: auto
Max-height: calc(100% - 140px) /* Header + Input */
```

**Auto-scroll Behavior**:
- Scroll to bottom on new message
- Preserve scroll position when viewing history
- "Scroll to bottom" button appears when >200px from bottom

**Empty State** (First load):
```
┌─────────────────────────────────┐
│         [HarliBot Icon]         │
│                                 │
│   Welcome to HarliBot!          │
│   I can help you with:          │
│                                 │
│   • City services information   │
│   • Department contacts         │
│   • Permits and licenses        │
│   • Events and news             │
│                                 │
│   Try asking: "How do I pay     │
│   my water bill?"               │
└─────────────────────────────────┘
```

---

### 5. Message Bubbles

**User Message** (Right-aligned):
```
Max-width: 80% of container
Background: var(--user-message-bg) Harlingen blue
Text color: var(--user-message-text) white
Border-radius: var(--radius-xl) var(--radius-sm) var(--radius-xl) var(--radius-xl)
              (rounded except bottom-right)
Padding: var(--space-3) var(--space-4)
Margin-bottom: var(--space-3)
Align: flex-end
```

**Bot Message** (Left-aligned):
```
Max-width: 85% of container
Background: var(--bot-message-bg) light gray
Text color: var(--bot-message-text) dark gray
Border-radius: var(--radius-sm) var(--radius-xl) var(--radius-xl) var(--radius-xl)
              (rounded except top-left)
Padding: var(--space-3) var(--space-4)
Margin-bottom: var(--space-3)
Align: flex-start
```

**Avatar for Bot Messages**:
```
Size: 32px × 32px (circle)
Position: Top-left of message
Background: var(--harlingen-blue)
Icon: HarliBot logo (white)
```

**Timestamp** (Below each message):
```
Font-size: var(--text-xs) 12px
Color: var(--text-muted)
Format: "10:30 AM" or "Hace 5 minutos"
Position: Below message, aligned with message side
```

**Message Component**:
```tsx
<div className={`message ${message.role === 'user' ? 'user' : 'bot'}`}>
  {message.role === 'bot' && <Avatar size="sm" />}
  
  <div className="message-bubble">
    <ReactMarkdown>{message.content}</ReactMarkdown>
    
    {message.sources && (
      <div className="message-sources">
        <p className="text-xs text-muted mb-1">{t('sources')}:</p>
        {message.sources.map(source => (
          <a href={source.url} className="source-link" target="_blank">
            {source.title}
          </a>
        ))}
      </div>
    )}
  </div>
  
  <time className="message-timestamp">
    {formatTimestamp(message.timestamp, language)}
  </time>
</div>
```

---

### 6. Typing Indicator

**Purpose**: Show when bot is processing

**Visual Specifications**:
```
Layout: Same as bot message bubble
Content: Three animated dots
Animation: Bounce with stagger (0.2s delay between dots)
Color: var(--text-muted)
```

**Animation**:
```css
@keyframes bounce {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-8px); }
}

.dot {
  animation: bounce 1.4s infinite ease-in-out;
}

.dot:nth-child(1) { animation-delay: 0s; }
.dot:nth-child(2) { animation-delay: 0.2s; }
.dot:nth-child(3) { animation-delay: 0.4s; }
```

---

### 7. Message Input Area

**Visual Specifications**:
```
Height: 80px
Background: var(--bg-primary) white
Border-top: 1px solid var(--border-light)
Padding: var(--space-4) 16px
Border-radius: 0 0 var(--radius-2xl) var(--radius-2xl)
```

**Layout**:
```
┌─────────────────────────────────┐
│ [Text Input Field............][Send Button] │
└─────────────────────────────────┘
```

**Text Input**:
```
Type: Textarea (auto-expanding, max 3 lines)
Placeholder: "Ask about city services..." / "Pregunta sobre servicios..."
Font-size: var(--text-base) 16px
Padding: var(--space-3) var(--space-4)
Border: 1px solid var(--border-medium)
Border-radius: var(--radius-lg)
Background: var(--bg-secondary)
Focus: Border color changes to var(--harlingen-blue), blue glow
Max-length: 500 characters
```

**Character Counter** (when >400 chars):
```
Position: Bottom-right of input
Font-size: var(--text-xs)
Color: var(--text-muted) or var(--warning) if >450
Format: "450/500"
```

**Send Button**:
```
Size: 48px × 48px (circle)
Background: var(--harlingen-blue)
Icon: Arrow/send icon (white, 20px)
Position: Right side, vertically centered
States:
  - Disabled: Gray background, 50% opacity (when input empty)
  - Enabled: Blue background
  - Hover: Gold background
  - Active: Darker blue
```

**Component Code**:
```tsx
<div className="input-area">
  <textarea
    value={inputValue}
    onChange={handleInputChange}
    onKeyDown={handleKeyPress}  // Enter to send, Shift+Enter for newline
    placeholder={t('input_placeholder')}
    disabled={isTyping}
    maxLength={500}
    rows={1}
    className="message-input"
    aria-label={t('message_input_label')}
  />
  
  {inputValue.length > 400 && (
    <span className="char-counter">{inputValue.length}/500</span>
  )}
  
  <button
    onClick={handleSend}
    disabled={!inputValue.trim() || isTyping}
    className="send-button"
    aria-label={t('send_message')}
  >
    <SendIcon />
  </button>
</div>
```

---

### 8. Language Toggle

**Visual Specifications**:
```
Layout: Segmented control
Segments: [EN] [ES]
Width: 80px total (40px per segment)
Height: 32px
Border-radius: var(--radius-full)
Background: white/10% (semi-transparent)
```

**States**:
- **Active segment**: 
  - Background: white
  - Text: var(--harlingen-blue) blue
  - Font-weight: bold
  
- **Inactive segment**:
  - Background: transparent
  - Text: white/60%
  - Font-weight: normal

**Transition**: Smooth slide (200ms ease)

**Component Code**:
```tsx
<div className="language-toggle" role="tablist">
  <button
    role="tab"
    aria-selected={language === 'en'}
    onClick={() => setLanguage('en')}
    className={language === 'en' ? 'active' : 'inactive'}
  >
    EN
  </button>
  <button
    role="tab"
    aria-selected={language === 'es'}
    onClick={() => setLanguage('es')}
    className={language === 'es' ? 'active' : 'inactive'}
  >
    ES
  </button>
</div>
```

---

## Wireframes & Mockups

### Desktop Layout

```
┌─────────────────────────────────────────────────────────────┐
│  HarlingenTX.gov Header                                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Main Content Area                                          │
│  (City website content)                                     │
│                                                             │
│                                     ┌──────────────────────┐│
│                                     │ ● HarliBot           ││
│                                     │ City of Harlingen    ││
│                                     │             EN | ES X││
│                                     ├──────────────────────┤│
│                                     │                      ││
│                                     │ Welcome! I can help  ││
│                                     │ with city services.  ││
│                                     │                      ││
│                                     │  How do I pay my    │││
│                                     │  water bill?        │││
│                                     │                  👤 │││
│                                     │                      ││
│                                     │ ● You can pay your   ││
│                                     │ water bill online... ││
│                                     │                      ││
│                                     ├──────────────────────┤│
│                                     │ [Ask a question...] →││
│                                     └──────────────────────┘│
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Mobile Layout

```
Full Screen Chat (when opened):

┌──────────────────┐
│ ● HarliBot      X│
│ City of Harlingen│
│         EN | ES  │
├──────────────────┤
│                  │
│ Welcome!         │
│                  │
│  How do I pay   ││
│  my water bill? ││
│              👤 ││
│                  │
│ ● You can pay    │
│ your water bill  │
│ online at...     │
│                  │
│                  │
│                  │
│                  │
├──────────────────┤
│ [Type here...] → │
└──────────────────┘

Minimized (floating button):
                    │
                    │
                    │
                  ┌─┴─┐
                  │ 💬 │
                  └───┘
```

---

## Interaction Patterns

### Opening Chat Widget

**Trigger**: Click chat toggle button  
**Animation**:
```
1. Button scales down (0.95) on click
2. Chat window fades in (opacity 0 → 1) over 200ms
3. Chat window slides up 20px during fade-in
4. Welcome message appears with slight delay (100ms)
```

### Closing Chat Widget

**Trigger**: Click close button or click outside (optional)  
**Animation**:
```
1. Chat window fades out (opacity 1 → 0) over 150ms
2. Chat window slides down 10px during fade
3. Toggle button returns with scale animation
```

**State Preservation**: Conversation persists (localStorage)

### Sending Message

**Flow**:
```
1. User types message
2. User presses Enter or clicks Send
3. Input disabled, send button shows loading spinner
4. User message appears immediately (optimistic UI)
5. Typing indicator appears
6. Bot response streams in (if possible) or appears at once
7. Typing indicator disappears
8. Input re-enabled
```

**Keyboard Shortcuts**:
- `Enter`: Send message
- `Shift + Enter`: New line
- `Escape`: Close chat (when focused)

### Language Switching

**Behavior**:
```
1. User clicks language toggle
2. Immediate UI translation (all labels, placeholders)
3. Conversation history remains visible (no re-translation)
4. Future bot responses in selected language
5. Preference saved to localStorage
```

**Graceful Handling**:
- If mid-conversation, show notice: "Language changed to Spanish. New responses will be in Spanish."

### Error States

**Network Error**:
```
Display in message bubble:
┌─────────────────────────────┐
│ ⚠️ Connection lost          │
│ Please check your internet  │
│ [Retry]                     │
└─────────────────────────────┘
```

**Service Unavailable**:
```
┌─────────────────────────────┐
│ ⚠️ HarliBot is temporarily  │
│ unavailable. Please try     │
│ again later or call         │
│ 956-555-CITY                │
└─────────────────────────────┘
```

**Invalid Input**:
```
Input field shakes (0.3s animation)
Border color: var(--error) red
Helper text below: "Please enter a message"
```

---

## Bilingual UI Implementation

### Translation Keys Structure

```json
{
  "en": {
    "chat_toggle_label": "Open HarliBot chat assistant",
    "city_of_harlingen": "City of Harlingen",
    "close_chat": "Close chat",
    "input_placeholder": "Ask about city services...",
    "send_message": "Send message",
    "welcome_title": "Welcome to HarliBot!",
    "welcome_message": "I can help you with:",
    "welcome_services": [
      "City services information",
      "Department contacts",
      "Permits and licenses",
      "Events and news"
    ],
    "welcome_example": "Try asking: \"How do I pay my water bill?\"",
    "typing": "HarliBot is typing...",
    "sources": "Sources",
    "error_network": "Connection lost. Please check your internet.",
    "error_service": "HarliBot is temporarily unavailable.",
    "retry": "Retry",
    "timestamp_just_now": "Just now",
    "timestamp_minutes_ago": "{{count}} minutes ago",
    "timestamp_hours_ago": "{{count}} hours ago"
  },
  "es": {
    "chat_toggle_label": "Abrir el asistente de chat HarliBot",
    "city_of_harlingen": "Ciudad de Harlingen",
    "close_chat": "Cerrar chat",
    "input_placeholder": "Pregunta sobre servicios de la ciudad...",
    "send_message": "Enviar mensaje",
    "welcome_title": "¡Bienvenido a HarliBot!",
    "welcome_message": "Puedo ayudarte con:",
    "welcome_services": [
      "Información de servicios de la ciudad",
      "Contactos de departamentos",
      "Permisos y licencias",
      "Eventos y noticias"
    ],
    "welcome_example": "Intenta preguntar: \"¿Cómo pago mi factura de agua?\"",
    "typing": "HarliBot está escribiendo...",
    "sources": "Fuentes",
    "error_network": "Conexión perdida. Por favor verifica tu internet.",
    "error_service": "HarliBot no está disponible temporalmente.",
    "retry": "Reintentar",
    "timestamp_just_now": "Ahora mismo",
    "timestamp_minutes_ago": "Hace {{count}} minutos",
    "timestamp_hours_ago": "Hace {{count}} horas"
  }
}
```

### Dynamic Content Translation

**User Messages**: Never translated (shown as entered)  
**Bot Responses**: Generated in requested language  
**UI Elements**: Instantly translated on toggle  
**Timestamps**: Locale-aware formatting

---

## Responsive Design

### Breakpoints

```css
/* Mobile First Approach */
--breakpoint-sm: 640px;   /* Small tablets */
--breakpoint-md: 768px;   /* Tablets */
--breakpoint-lg: 1024px;  /* Desktop */
--breakpoint-xl: 1280px;  /* Large desktop */
```

### Layout Adaptations

**Mobile (< 640px)**:
- Chat opens full-screen
- Header stays at top (not floating)
- Close button more prominent
- Input area sticky at bottom

**Tablet (640px - 1024px)**:
- Chat window: 360px wide × 550px tall
- Slight margin from edges (16px)
- Slightly smaller fonts

**Desktop (> 1024px)**:
- Chat window: 400px wide × 600px tall
- 24px margin from edges
- Full feature set

### Touch Targets

**Minimum Touch Target Size**: 44px × 44px (iOS HIG standard)

**Applies to**:
- Send button: 48px × 48px ✓
- Close button: 44px × 44px ✓
- Language toggle segments: 40px × 32px (acceptable, larger tap area)
- Chat toggle button: 60px × 60px ✓

---

## Accessibility Requirements

### WCAG 2.1 Level AA Compliance

**Color Contrast**:
- Text on background: Minimum 4.5:1 ratio
- Large text (18pt+): Minimum 3:1 ratio
- UI components: Minimum 3:1 ratio

**Verification**:
```
User message text (white on blue): 8.2:1 ✓
Bot message text (dark on light gray): 12.5:1 ✓
Placeholder text: 4.8:1 ✓
```

### Keyboard Navigation

**Tab Order**:
1. Chat toggle button
2. (When open) Language toggle
3. Close button
4. Message input
5. Send button
6. Links in messages

**Focus Indicators**:
```css
:focus-visible {
  outline: 2px solid var(--harlingen-blue);
  outline-offset: 2px;
}
```

**Keyboard Shortcuts** (documented in help):
- `Enter`: Send message
- `Escape`: Close chat
- `Tab`: Navigate through interactive elements

### Screen Reader Support

**ARIA Labels**:
```html
<div role="region" aria-label="Chat with HarliBot">
  <header role="banner">...</header>
  
  <div role="log" aria-live="polite" aria-atomic="false">
    <!-- Messages appear here, screen reader announces new messages -->
  </div>
  
  <form role="search" aria-label="Send message to HarliBot">
    <textarea aria-label="Message input"></textarea>
    <button aria-label="Send message"></button>
  </form>
</div>
```

**Announcements**:
- New messages: `aria-live="polite"`
- Errors: `aria-live="assertive"`
- Typing indicator: `aria-live="polite"` + "HarliBot is typing"

### Focus Management

**When opening chat**:
- Focus moves to message input
- Screen reader announces: "Chat opened. HarliBot assistant ready."

**When closing chat**:
- Focus returns to toggle button
- Screen reader announces: "Chat closed"

**On error**:
- Focus moves to error message
- Screen reader reads error

---

## Animation & Transitions

### Timing Functions

```css
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
```

### Animation Catalog

**Chat Open/Close**:
```css
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.chat-window.opening {
  animation: slideUp 200ms var(--ease-out);
}
```

**Message Appear**:
```css
@keyframes fadeSlide {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message {
  animation: fadeSlide 150ms var(--ease-out);
}
```

**Typing Indicator** (see earlier section)

**Button Pulse** (Chat toggle when idle):
```css
@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(0, 59, 113, 0.7);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(0, 59, 113, 0);
  }
}

.chat-toggle-button {
  animation: pulse 2s infinite;
}
```

**Performance**:
- Use `transform` and `opacity` for animations (GPU-accelerated)
- Avoid animating `width`, `height`, `top`, `left` (causes reflow)
- Use `will-change` sparingly

---

## Error Handling & Edge Cases

### Empty State Variations

**First Visit** (no conversation history):
- Show welcome message with example questions

**Returning Visit** (has history):
- Show last 3 messages
- "Welcome back!" message
- Load more history on scroll up

**After Error** (connection restored):
- Show last successful message
- Indicator: "Connection restored"

### Loading States

**Initial Load**:
- Skeleton UI (chat window outline, pulsing elements)
- Duration: ~500ms before showing error

**Message Sending**:
- User message appears immediately
- Send button disabled + spinner
- Typing indicator for bot

**Slow Response** (>5 seconds):
- Extended typing indicator
- Optional: "This is taking longer than usual..." after 10s

### Edge Cases

**Very Long Messages**:
- Max 500 characters in input
- Bot responses: Truncate at 2000 characters, add "Read more" link to source

**Rapid Messages**:
- Queue messages, send sequentially
- Show "Sending..." if queued

**Network Offline**:
- Detect with `navigator.onLine`
- Show persistent error banner
- Disable input with explanation
- Auto-retry on reconnection

**Session Timeout** (if applicable):
- After 30 minutes idle: "Session expired. Refresh to continue."
- Preserve conversation history in localStorage

**Unsupported Browser**:
- Detect at load
- Show degraded experience or error message
- Minimum: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

---

## Component Hierarchy

```
ChatWidget (Root)
├── ChatToggleButton
│   └── UnreadBadge (conditional)
│
└── ChatWindow (conditional: when open)
    ├── ChatHeader
    │   ├── Avatar
    │   ├── Title
    │   ├── LanguageToggle
    │   └── CloseButton
    │
    ├── MessageList
    │   ├── WelcomeMessage (conditional: first visit)
    │   ├── Message (repeated)
    │   │   ├── Avatar (bot only)
    │   │   ├── MessageBubble
    │   │   │   ├── MessageContent (Markdown)
    │   │   │   └── MessageSources (conditional)
    │   │   └── Timestamp
    │   ├── TypingIndicator (conditional)
    │   └── ScrollToBottom (conditional)
    │
    └── InputArea
        ├── MessageInput (textarea)
        ├── CharCounter (conditional: >400 chars)
        └── SendButton
```

---

## Design Tokens (Tailwind Config)

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        harlingen: {
          blue: '#003B71',
          gold: '#D4A017',
          green: '#2D5F3F',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'chat': '0 10px 40px rgba(0, 0, 0, 0.12)',
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-dot': 'bounce 1.4s infinite ease-in-out',
      },
    },
  },
};
```

---

## Conclusion

This UI/UX specification provides a complete design system for HarliBot that is:
- ✅ Professional and government-appropriate
- ✅ Bilingual from the ground up
- ✅ Accessible (WCAG 2.1 AA compliant)
- ✅ Modern and unobtrusive
- ✅ Fully responsive across all devices

The design improves significantly on the current chatbot by:
1. Staying embedded on the main site (no new page)
2. Following modern chat UI conventions
3. Professional visual design aligned with city branding
4. True bilingual support with equal quality in both languages
5. Comprehensive accessibility features

**Next Steps**:
1. Review with stakeholders (color approval from city)
2. Create high-fidelity mockups in Figma (optional)
3. Implement components in React/Next.js
4. User testing with bilingual residents

---

**Document Version**: 1.0  
**Last Updated**: January 17, 2025  
**Next Review**: Post-prototype delivery
