# POC-1 Project Guide

## Project Overview
POC-1 is a React application built with Vite and TypeScript. The design is based on [Figma](https://www.figma.com/design/VhhAJAqTbPDXKGr48Gyvvo/POC-1).

## Tech Stack
- **Framework**: React 18.3.1
- **Build Tool**: Vite 6.3.5
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **Forms**: React Hook Form
- **Charts**: Recharts
- **Theming**: next-themes
- **Animations**: Motion (Framer Motion)

## Project Structure
```
POC-1/
├── src/
│   ├── App.tsx           # Main application component
│   ├── main.tsx          # Application entry point
│   ├── index.css         # Global styles and Tailwind directives
│   ├── components/       # Reusable UI components
│   ├── context/          # React context providers
│   ├── guidelines/       # Design guidelines and documentation
│   ├── lib/              # Utility functions and helpers
│   ├── styles/           # Additional styling files
│   └── types/            # TypeScript type definitions
├── index.html            # HTML entry point
├── vite.config.ts        # Vite configuration
└── package.json          # Project dependencies and scripts
```

## Development Workflow

### Setup
```bash
npm i                     # Install dependencies
npm run dev              # Start development server
npm run build            # Build for production
```

### Key Commands
- `npm run dev` - Starts Vite dev server with HMR
- `npm run build` - Creates production build

## Code Conventions

### Component Structure
- Use functional components with TypeScript
- Leverage Radix UI primitives for accessible UI components
- Use `class-variance-authority` for component variants
- Combine classes with `clsx` and `tailwind-merge`

### Styling
- Tailwind CSS is the primary styling approach
- Global styles are in `src/index.css`
- Use the `cn()` utility (likely in `src/lib/`) for conditional classes

### State Management
- React Context API (see `src/context/`)
- React Hook Form for form state

### File Naming
- React components: PascalCase (e.g., `App.tsx`)
- Utilities/helpers: camelCase
- Types: PascalCase

## UI Component Library
The project uses Radix UI primitives including:
- Accordion, Alert Dialog, Aspect Ratio, Avatar
- Checkbox, Collapsible, Context Menu, Dialog
- Dropdown Menu, Hover Card, Label, Menubar
- Navigation Menu, Popover, Progress, Radio Group
- Scroll Area, Select, Separator, Slider
- Switch, Tabs, Toggle, Tooltip

Additional UI libraries:
- `cmdk` - Command menu
- `embla-carousel-react` - Carousel component
- `input-otp` - OTP input
- `react-day-picker` - Date picker
- `react-resizable-panels` - Resizable panel layouts
- `sonner` - Toast notifications
- `vaul` - Drawer component

## Key Considerations
- This project is built from a Figma design, so maintain visual consistency
- Use Radix UI for accessibility best practices
- Leverage TypeScript for type safety
- Keep components modular and reusable

## Additional Resources
- Figma Design: https://www.figma.com/design/VhhAJAqTbPDXKGr48Gyvvo/POC-1
- Attributions: See `src/Attributions.md`
