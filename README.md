# Wanderly — A Trip Day Planner App

Wanderly is a React Native mobile application built with Expo, designed for travelers to explore points of interest, build a personalized day itinerary, and view a summary of their plan. This project was developed as part of a mobile developer challenge with a strong focus on UI/UX, engineering quality, and product thinking.

<p align="center">
  <img src="https://user-images.githubusercontent.com/1259782/260389590-22344a63-630f-41f3-85f3-3c8a1b1c8a0a.png" alt="Wanderly App Screens" width="800"/>
</p>

## Features

- **Explore & Filter:** Browse a curated list of places with real-time search and filtering by category and tags.
- **Itinerary Builder:** Add places to a personal plan and see them arranged in a timeline.
- **Drag-and-Drop Reordering:** Easily reorder stops in your itinerary to customize your day.
- **Dynamic Timeline:** The app automatically calculates start/end times for each stop and warns of potential scheduling conflicts (e.g., visiting a place outside its opening hours).
- **Trip Summary:** View key metrics like total stops, duration, and estimated cost.
- **Polished UI/UX:** A clean, modern interface with smooth animations, haptic feedback, and thoughtful handling of loading and empty states.

---

## Setup and Running the App

### Prerequisites
- Node.js v20+
- npm v10+
- [Expo Go](https://expo.dev/go) app on your iOS or Android device (or a local simulator setup).

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd wanderly
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

### Running the App

1.  **Start the Metro server:**
    ```bash
    npx expo start
    ```

2.  **Open the app:**
    -   Scan the QR code with the Expo Go app on your device.
    -   Or, press `i` to run on an iOS simulator or `a` to run on an Android emulator.

For a clean start, you can clear the cache:
```bash
npx expo start -c
```

---

## Architecture Overview

The project is structured to promote a clean separation of concerns, scalability, and maintainability.

```
/
├── app/            # Routing and screens (Expo Router)
├── assets/         # Static assets (images, fonts)
├── components/     # Reusable React components
│   ├── ui/         # Generic UI elements (future)
│   └── wanderly/   # App-specific components
├── constants/      # Theme, colors, and app-wide constants
├── data/           # Mock data and Zod validation schema
├── hooks/          # Custom React hooks
├── lib/            # Core business logic and utility functions
├── store/          # Global state management (Zustand)
└── types/          # TypeScript type definitions
```

-   **Routing:** Handled by **Expo Router** using a file-based system in the `app/` directory. This keeps navigation logic declarative and co-located with the screen components.
-   **Component Structure:** Components are split between generic (`ui/`) and domain-specific (`wanderly/`) to encourage reusability while keeping the project organized.
-   **Business Logic:** Pure utility functions (e.g., time calculations, data formatting) are kept in the `lib/` directory, completely decoupled from the UI.
-   **Type Safety:** **TypeScript** is used throughout the project, with centralized type definitions in `types/wanderly.ts` to ensure consistency. Data integrity is further enforced by a **Zod** schema (`data/mock-data.schema.ts`) that validates the mock data at runtime.

---

## State Management: Why Zustand?

For this project, **Zustand** was chosen for global state management.

-   **Simplicity and Minimal Boilerplate:** Zustand provides a simple, hook-based API that is easy to understand and use. It avoids the extensive boilerplate often associated with other state management libraries, which was ideal for a project with a tight deadline.
-   **Lightweight:** It has a very small bundle size and is highly performant, which is crucial for a smooth mobile experience.
-   **Decoupled from UI:** The store is defined as a non-React object. This allows helper functions in `lib/` to access the state without needing to be a React component or hook, promoting better separation of concerns.
-   **Persistence:** The built-in `persist` middleware made it trivial to save the user's plan to `AsyncStorage`, ensuring their itinerary is not lost between sessions.

The state is defined in `store/plan-store.ts`, and selectors are co-located in `store/plan-selectors.ts` for optimized, memoized access to derived state.

---

## Tradeoffs and Decisions

Given the 10-hour time constraint, several strategic tradeoffs were made to prioritize UI/UX quality and core functionality over completeness.

-   **In-Memory State First:** The primary focus was on building the UI and interactions with in-memory state. Persistence was added later via Zustand's middleware, which was a quick and effective solution. No complex database or backend was built, as per the challenge requirements.
-   **Mock Data & No Backend:** The challenge explicitly provided mock data. This allowed 100% of the development time to be focused on the frontend experience rather than on building and deploying a backend API.
-   **Focus on Core Features:** The highest priority was given to the "happy path" user flow: browsing, adding to a plan, reordering the plan, and seeing the summary. Features like "Save for later" or a real map integration were deemed "Nice to Have" and were not implemented to ensure the core experience was polished.
-   **Expo Go Over Bare Workflow:** Using the Expo managed workflow significantly sped up the development process by simplifying the build process, environment setup, and access to native device features.

---

## If I Had More Time...

-   **Real Map Integration:** Instead of a static map image, I would integrate a real maps SDK (like `react-native-maps`) to show the route and allow for more interactive exploration on the finalize screen.
-   **Backend and User Accounts:** I would build a proper backend to store user plans, enabling synchronization across devices and sharing plans with other users.
-   **Comprehensive Testing:** While the project includes linting and type-checking, I would add a suite of unit tests for the business logic in `lib/` and component snapshot tests to prevent regressions.
-   **Animation Enhancements:** I would spend more time refining micro-interactions and adding more delightful animations, such as staggered list item entries or more complex gesture-based interactions.

---

## Known Issues & Limitations

-   **No True Offline Mode:** The app relies on persisted state from the last session. It does not have a robust offline mode that would sync with a remote server upon reconnection.
-   **Limited Accessibility:** While basic accessibility properties are used, the app has not been fully audited for screen reader support or dynamic type sizing, particularly for the drag-and-drop functionality.
-   **No Tablet-Specific Layout:** The UI is optimized for phones and does not have a responsive layout for tablet devices.
