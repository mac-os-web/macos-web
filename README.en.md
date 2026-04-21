# macos-web

[🇯🇵 日本語](./README.md) · [🇰🇷 한국어](./README.ko.md) · [🇺🇸 English](./README.en.md)

A macOS desktop clone that runs in the browser. Built with React 19 + TypeScript + Vite.

## Features

- **Dock** - Launch Finder, Safari, Notes, Terminal, App Store, Mail
- **Window** - Drag, resize, minimize, focus (z-index) management
- **Spotlight** - Search and launch apps
- **MenuBar / Control Center** - Top menu bar and control center
- **Widgets** - Desktop widgets such as clock, weather, calendar
- **Stickies** - Draggable / resizable / recolorable sticky notes (persisted in localStorage)
- **i18n** - Korean / English / Japanese supported
- **Mobile view** - iOS home-screen-style grid below 640px

## Tech Stack

### Core
- react ^19.2.4 / react-dom ^19.2.4
- typescript ~6.0.2
- vite ^8.0.4

### Styling
- tailwindcss ^4.2.2
- @tailwindcss/vite ^4.2.2

### State / Routing
- @tanstack/react-query ^5.99.0
- @tanstack/react-query-persist-client ^5.99.0
- @tanstack/query-async-storage-persister ^5.99.0
- @tanstack/react-router ^1.168.10

### Interaction / UI
- @dnd-kit/core ^6.3.1
- @dnd-kit/sortable ^10.0.0
- @dnd-kit/utilities ^3.2.2
- lucide-react ^1.7.0

### i18n / Utilities
- i18next ^26.0.4
- react-i18next ^17.0.2
- @js-temporal/polyfill ^0.5.1
- axios ^1.15.0

### Terminal / MDX
- @xterm/xterm ^6.0.0
- @xterm/addon-fit ^0.11.0
- @mdx-js/react ^3.1.1
- @mdx-js/rollup ^3.1.1

### Quality / Measurement
- oxlint ^1.59.0
- prettier ^3.8.1 (planned migration to oxformat)
- vitest ^4.1.3
- lighthouse ^13.1.0
- chrome-launcher ^1.2.1

> **Project direction**: One of the goals is to fully adopt the oxc-based ecosystem
> (oxlint / oxformat, etc.) and evaluate how much the Rust-powered toolchain improves
> the frontend DX. Tests are planned with vitest.

## Development

```bash
pnpm install
pnpm dev          # dev server
pnpm build        # production build
pnpm lint         # oxlint
pnpm format       # prettier
pnpm lighthouse   # Lighthouse measurement
```

## Project Structure

```
src/
  components/    # Dock, Window, Spotlight, app windows
  hooks/         # custom hooks (e.g. useStickies)
  contexts/      # React Context
  i18n/          # translation resources
  lib/           # utilities
apps/api/        # Hono-based BFF (planned)
docs/            # planning docs
```

## Performance

Targeting Lighthouse 100. Dock apps are lazy-loaded via `React.lazy` to reduce bundle size.
Lighthouse runs with 4x CPU throttling (`cpuSlowdownMultiplier: 4`).
