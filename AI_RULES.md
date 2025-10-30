# AI Assistant Rules and Guidelines

This document outlines the tech stack and coding guidelines for the AI assistant to ensure consistency, maintainability, and best practices in the project.

## Tech Stack

- **React:** A JavaScript library for building user interfaces.
- **TypeScript:** A superset of JavaScript that adds static typing.
- **Tailwind CSS:** A utility-first CSS framework for styling.
- **shadcn/ui:** A collection of accessible and reusable UI components built with Radix UI and Tailwind CSS.
- **React Router:** A standard library for routing in React applications.
- **Lucide React:** A library of beautiful, consistent icons.
- **Vite:** A fast build tool and development server for modern web projects.
- **Radix UI:** A set of unstyled, accessible UI primitives.

## Coding Guidelines

- **Component-Based Architecture:**
  - Create reusable components for UI elements.
  - Each component should have a single, well-defined purpose.
  - Keep components small (100 lines of code or less) and focused.
  - Create a new file for every new component or hook, no matter how small.
  - Never add new components to existing files, even if they seem related.

- **Styling with Tailwind CSS:**
  - Use Tailwind CSS classes for all styling.
  - Ensure responsive designs by using Tailwind's responsive modifiers (e.g., `md:`, `lg:`).
  - Avoid custom CSS unless absolutely necessary; prefer Tailwind's utility classes.

- **UI Components with shadcn/ui:**
  - Utilize pre-built components from the shadcn/ui library whenever possible.
  - Customize shadcn/ui components using Tailwind CSS classes.
  - Do not modify the original shadcn/ui component files. If customization beyond Tailwind is needed, create a new component that uses the shadcn/ui component internally.

- **Routing with React Router:**
  - Use React Router for navigation between different pages and sections of the application.
  - Define routes in `src/App.tsx`.
  - Use the `<Link>` component for navigation.

- **Icons with Lucide React:**
  - Use icons from the `lucide-react` library for a consistent look and feel.
  - Import icons directly from `lucide-react`.

- **State Management:**
  - Use React's built-in `useState` hook for managing component state.
  - For more complex state management, consider using `useReducer` or a third-party library like Zustand.

- **Data Fetching:**
  - Use `@tanstack/react-query` for data fetching, caching, and state management.

- **Error Handling:**
  - Do not use try/catch blocks unless specifically requested by the user.
  - Allow errors to bubble up for centralized handling.

- **Naming Conventions:**
  - Use descriptive names for components, variables, and functions.
  - Follow a consistent naming convention throughout the project.
  - Directory names MUST be all lower-case (src/pages, src/components, etc.). File names may use mixed-case if you like.

- **File Structure:**
  - Keep source code in the `src` folder.
  - Put pages into `src/pages/`.
  - Put components into `src/components/`.
  - The main page (default page) is `src/pages/Index.tsx`.

- **Imports:**
  - First-party imports (modules that live in this project):
    - Only import files/modules that have already been described to you.
    - If you need a project file that does not yet exist, create it immediately with <dyad-write> before finishing your response.
  - Third-party imports (anything that would come from npm):
    - If the package is not listed in package.json, install it with <dyad-add-dependency>.
  - Do not leave any import unresolved.

- **Code Formatting:**
  - Use consistent code formatting (e.g., Prettier) to ensure readability.
  - Keep lines of code to a reasonable length (e.g., 80-120 characters).

- **Comments:**
  - Add comments to explain complex logic or non-obvious code.
  - Keep comments concise and up-to-date.

- **Do not overengineer:**
  - Focus on the user's request and make the minimum amount of changes needed.
  - Don't do more than what the user asks for.

- **Testing:**
  - Write unit tests for components and functions to ensure they work as expected.
  - Use testing libraries like Jest and React Testing Library.

- **Directory names MUST be all lower-case (src/pages, src/components, etc.). File names may use mixed-case if you like.**