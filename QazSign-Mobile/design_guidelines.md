# QazSign Mobile Application - Design Guidelines

## Brand Identity

**Purpose**: QazSign empowers Kazakh Sign Language learning and real-time translation, bridging communication gaps with clarity and confidence.

**Aesthetic Direction**: **Bold Clarity** - High contrast, maximum legibility, straightforward hierarchy. This is assistive technology that must be instantly readable in any lighting condition. Think "educational confidence" - serious purpose, approachable execution.

**Memorable Element**: The split-screen translation interface with oversized, ultra-readable text output creates an unmistakable signature experience. Users will remember the generous typography and instant visual feedback.

## Navigation Architecture

**Root Navigation**: Tab Bar (3 tabs)

1. **Dictionary** - Browse and search KSL gestures
2. **Translate** - Camera-based real-time translation (center tab, primary action)
3. **Learn** - Saved gestures, progress, settings

**Authentication**: No auth required. Include Settings screen with:
- User display name (editable)
- Avatar selection (1 preset avatar generated)
- Language preferences (Kazakh/Russian text)
- High contrast mode toggle
- Offline mode indicator

## Screen-by-Screen Specifications

### 1. Dictionary Screen
**Purpose**: Browse and search KSL dictionary

**Layout**:
- Header: Transparent, large "Dictionary" title, search icon (right)
- Root view: Scrollable list
- Safe area: top = headerHeight + Spacing.xl, bottom = tabBarHeight + Spacing.xl

**Components**:
- Search bar (tappable, opens search overlay)
- Category filters (horizontal scroll pills: All, Alphabet, Greetings, Numbers, Common Phrases)
- Gesture cards (list items):
  - Thumbnail preview (video first frame or illustration)
  - Kazakh word (bold, 18pt)
  - Brief description (regular, 14pt, muted)
  - Tap to open detail view

**Empty State**: "empty-dictionary.png" - illustration when search returns no results

### 2. Translate Screen (Camera Interface)
**Purpose**: Real-time gesture-to-text translation

**Layout**:
- No header (full-screen immersive)
- Root view: NOT scrollable, fixed layout
- Two zones (50/50 vertical split):
  - **Top half**: Live camera preview (full width)
  - **Bottom half**: Translation output (stark white background, high contrast)
- Floating controls overlay
- Safe area: top = insets.top + Spacing.xl, bottom = insets.bottom + Spacing.xl

**Components**:
- Camera preview (letterboxed if needed, never distorted)
- Divider line between zones (2pt, high contrast)
- Translation output area:
  - Recognized text (ULTRA LARGE: 32-40pt, bold, centered vertically)
  - "Recognizing..." state (muted, 16pt)
  - "Tap to start" empty state
- Floating action buttons (bottom, centered row):
  - Record/Stop button (large, 64px circle with shadow)
  - Clear text button (secondary)
  - Copy text button (secondary)

**States**:
- Idle: "Tap camera button to start"
- Recording: Pulsing red indicator on camera button
- Text displayed: Large text with copy/clear options

### 3. Gesture Detail Screen
**Purpose**: Learn a specific gesture in depth

**Layout**:
- Header: Default navigation (back button left, bookmark icon right)
- Root view: Scrollable
- Safe area: top = Spacing.xl, bottom = tabBarHeight + Spacing.xl

**Components**:
- Video player (16:9 aspect, auto-loop)
  - Play/pause overlay
  - Scrubber controls
- Kazakh word (title, 28pt bold)
- Description text (16pt, readable line height)
- "Practice" button (full-width, prominent)
- Related gestures section (horizontal scroll)

### 4. Learn Screen
**Purpose**: Track saved gestures and access settings

**Layout**:
- Header: Transparent, "Learn" title, settings icon (right)
- Root view: Scrollable
- Safe area: top = headerHeight + Spacing.xl, bottom = tabBarHeight + Spacing.xl

**Components**:
- User profile card:
  - Avatar (64px circle)
  - Display name
  - "Edit profile" link
- Saved gestures list (same card style as Dictionary)
- Settings row (system disclosure indicator)

**Empty State**: "empty-saved.png" when no gestures saved

### 5. Settings Screen (Modal Stack)
**Purpose**: App preferences

**Layout**:
- Header: Default navigation ("Settings" title, close button left)
- Root view: Scrollable form
- Safe area: top = Spacing.xl, bottom = insets.bottom + Spacing.xl

**Components**:
- Grouped settings list:
  - Language (Kazakh/Russian)
  - High contrast mode (toggle)
  - Offline mode (read-only indicator)
  - About QazSign
  - Version number (footer)

## Color Palette

**Primary**: #1A73E8 (deep, trustworthy blue - high contrast against white)
**Primary Dark**: #0D47A1 (pressed state)

**Background**: #FFFFFF (pure white for maximum contrast)
**Surface**: #F5F5F5 (subtle gray for cards)

**Text Primary**: #000000 (pure black for accessibility)
**Text Secondary**: #5F6368 (medium gray, still readable)
**Text Muted**: #9AA0A6 (for placeholders only)

**Success**: #34A853 (recognition success indicator)
**Error**: #EA4335 (camera error state)
**Warning**: #FBBC04 (low light warning)

**Camera Overlay**: rgba(0, 0, 0, 0.7) (semi-transparent controls background)

**High Contrast Mode** (toggle):
- Text: Pure black #000000
- Backgrounds: Pure white #FFFFFF
- No grays, no subtle tints

## Typography

**Font**: System font stack (SF Pro for iOS, Roboto for Android) - maximum legibility
**Type Scale**:
- Hero (Translation output): 40pt, Bold
- Title: 28pt, Bold
- Headline: 20pt, Semibold
- Body: 16pt, Regular (1.5 line height)
- Caption: 14pt, Regular
- Label: 12pt, Medium

**Accessibility**: Minimum 14pt for all body text. Respect user's system text size preferences (Dynamic Type on iOS).

## Visual Design

**Touchable Feedback**: All buttons scale to 98% on press (subtle haptic feedback)

**Shadows**: Only for floating camera controls:
- shadowOffset: {width: 0, height: 2}
- shadowOpacity: 0.10
- shadowRadius: 2

**Icons**: Feather icons from @expo/vector-icons (24px standard, 32px for primary actions)

**Border Radius**: 12px for cards, 8px for buttons, 32px for pills/chips

**Spacing Scale**:
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px

## Assets to Generate

1. **icon.png** - App icon: Stylized hand gesture forming "Q" shape in Primary blue on white circle
   **WHERE USED**: Device home screen

2. **splash-icon.png** - Same as icon.png
   **WHERE USED**: Launch screen

3. **empty-dictionary.png** - Illustration of open hands with question mark, minimalist line art
   **WHERE USED**: Dictionary screen when search has no results

4. **empty-saved.png** - Illustration of bookmark with sparkles, gentle and encouraging
   **WHERE USED**: Learn screen when no gestures bookmarked

5. **avatar-default.png** - Simple circular avatar with hand wave gesture silhouette
   **WHERE USED**: Settings and Learn screen user profile

6. **gesture-placeholder.png** - Gray placeholder for gesture thumbnails during loading
   **WHERE USED**: Dictionary list items, gesture cards

All illustrations: Minimal line art style, Primary blue (#1A73E8) on white, 2px stroke weight.