Frontend Architecture - Ohtani's Way

1. High-Level Overview

The frontend is a Single Page Application (SPA) built with React and Vite. It functions as a Progressive Web App (PWA) to provide an installable, app-like experience on mobile devices.

The core challenge is managing the 81-cell state (9x9 grid) and the complex data dependencies (Center-to-Outer synchronization) while maintaining 60fps animations.

2. Tech Stack

Framework: React 18+

Build Tool: Vite

Language: TypeScript

Styling: TailwindCSS

UI Components: shadcn/ui (Radix UI primitives)

State Management: Zustand (Global Store)

Server State: TanStack Query (React Query)

Animation: Framer Motion (Layout transitions)

PWA: vite-plugin-pwa

3. Directory Structure

src/
├── components/
│   ├── ui/             # shadcn primitives (Button, Input, etc.)
│   ├── grid/           # Grid-specific components
│   │   ├── MandalaChart.tsx    # Wrapper
│   │   ├── CentralGrid.tsx     # The 3x3 core
│   │   ├── OuterGrid.tsx       # The surrounding 3x3s
│   │   └── Cell.tsx            # Individual editable cell
│   ├── layout/         # Layout wrappers (Sidebar, Header)
│   └── shared/         # Reusable components (Loading, Error)
├── hooks/              # Custom hooks
│   ├── useGridSync.ts  # Logic for Center->Outer sync
│   └── useAutoSave.ts  # Debounce logic
├── lib/                # Utilities
│   ├── api.ts          # Axios instance
│   └── utils.ts        # CN helper, formatters
├── pages/              # Route views
├── store/              # Zustand stores
│   ├── useGridStore.ts # The monolithic grid state
│   └── useAuthStore.ts # User session
└── types/              # TS Interfaces


4. State Management Strategy (Zustand)

4.1 The Grid Store (useGridStore)

We avoid useState for the grid because passing props down 3 levels causes excessive re-renders. Zustand allows us to select specific slices of state.

Store Interface:

interface GridState {
  data: GridData; // Full JSON object
  activeZoom: 'center' | 'top' | 'top-right' | ... | null; // For UI zoom view
  isDirty: boolean; // Has changed since last save?
  
  // Actions
  updateCell: (path: string, value: string) => void;
  setZoom: (section: string | null) => void;
}


4.2 The "Mandala Sync" Logic

The Harada method requires that when a user types in the CentralGrid, the corresponding OuterGrid title updates automatically.

Implementation: Inside updateCell, we check the path.

Logic:

updateCell: (path, value) => {
  set((state) => {
    // 1. Update the target cell
    const newData = deepUpdate(state.data, path, value);

    // 2. Check for Sync Trigger
    // If path is inside 'centralBlock.items', find index
    // Update corresponding 'outerBlocks.[key].center'

    return { data: newData, isDirty: true };
  });
}


5. UI/UX & The "Drill-Down"

On mobile, we cannot show 81 cells.

View State: The user is either in Overview Mode (Seeing just the center 3x3) or Focus Mode (Seeing one of the outer 3x3s).

Framer Motion: Used to animate the transition between modes using layoutId. When a user clicks a cell in Overview, it expands to fill the screen (Focus Mode).

6. Performance Optimization

Debounced Save: useAutoSave hook watches state.data. If isDirty is true, it waits 1500ms of inactivity before calling the API PATCH endpoint.

Optimistic Updates: The UI updates instantly. The API call happens in the background. If the API fails, we revert the state and show a toast error.

Memoization: React.memo is used on Cell.tsx to prevent all 81 cells from re-rendering when only one changes.

7. PWA Configuration

Strategies: NetworkFirst for API calls, StaleWhileRevalidate for assets.

Offline: Changes made offline are stored in localStorage or IndexedDB and synced when navigator.onLine becomes true.