# macos-web

[🇯🇵 日本語](./README.md) · [🇰🇷 한국어](./README.ko.md) · [🇺🇸 English](./README.en.md)

웹에서 동작하는 macOS 데스크톱 클론. React 19 + TypeScript + Vite 기반.

## 주요 기능

- **Dock** - Finder, Safari, 메모, 터미널, App Store, Mail 앱 실행
- **Window** - 드래그, 리사이즈, 최소화, 포커스(z-index) 관리
- **Spotlight** - 앱 검색 및 실행
- **MenuBar / Control Center** - 상단 메뉴바와 제어 센터
- **Widgets** - 시계, 날씨, 달력 등 바탕화면 위젯
- **Stickies** - 드래그/리사이즈/색상 변경 가능한 스티커 메모 (localStorage 저장)
- **i18n** - 한국어 / 영어 / 일본어 지원
- **모바일 뷰** - 640px 이하에서 iOS 홈스크린 스타일 그리드

## 기술 스택

### 코어
- react ^19.2.4 / react-dom ^19.2.4
- typescript ~6.0.2
- vite ^8.0.4

### 스타일링
- tailwindcss ^4.2.2
- @tailwindcss/vite ^4.2.2

### 상태 관리 / 라우팅
- @tanstack/react-query ^5.99.0
- @tanstack/react-query-persist-client ^5.99.0
- @tanstack/query-async-storage-persister ^5.99.0
- @tanstack/react-router ^1.168.10

### 인터랙션 / UI
- @dnd-kit/core ^6.3.1
- @dnd-kit/sortable ^10.0.0
- @dnd-kit/utilities ^3.2.2
- lucide-react ^1.7.0

### 국제화 / 유틸
- i18next ^26.0.4
- react-i18next ^17.0.2
- @js-temporal/polyfill ^0.5.1
- axios ^1.15.0

### 터미널 / MDX
- @xterm/xterm ^6.0.0
- @xterm/addon-fit ^0.11.0
- @mdx-js/react ^3.1.1
- @mdx-js/rollup ^3.1.1

### 품질 관리 / 측정
- oxlint ^1.59.0
- prettier ^3.8.1 (※ oxformat으로 마이그레이션 예정)
- vitest ^4.1.3
- lighthouse ^13.1.0
- chrome-launcher ^1.2.1

> **프로젝트 방향성**: oxc 기반 생태계(oxlint / oxformat 등)를 전면 도입해
> Rust 제 툴체인으로 프런트엔드 개발 환경이 얼마나 쾌적해지는지를 검증하는 것도 목표 중 하나.
> 테스트는 vitest로 작성 예정.

## 개발

```bash
pnpm install
pnpm dev          # 개발 서버
pnpm build        # 프로덕션 빌드
pnpm lint         # oxlint
pnpm format       # prettier
pnpm lighthouse   # Lighthouse 측정
```

## 프로젝트 구조

```
src/
  components/    # Dock, Window, Spotlight, 각 앱 윈도우
  hooks/         # useStickies 등 커스텀 훅
  contexts/      # React Context
  i18n/          # 번역 리소스
  lib/           # 유틸
apps/api/        # Hono 기반 BFF (예정)
docs/            # 작업 계획 문서
```

## 성능

Lighthouse 100점 / 번들 사이즈 최적화를 위해 Dock 앱들은 `React.lazy`로 지연 로드.
Lighthouse 측정은 CPU 4배 스로틀링(`cpuSlowdownMultiplier: 4`) 환경에서 실행.
