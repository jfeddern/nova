# Nova Frontend

A modern, responsive web application for managing and exploring application portfolios, technology stacks, and security posture across your organization.

## Overview

Nova provides a centralized platform for discovering, understanding, and managing applications and microservices. It offers powerful search, filtering, and visualization capabilities combined with comprehensive security and SBOM (Software Bill of Materials) tracking to help teams navigate their technology landscape.

## Features

### Application Management
- **Application Catalog** - Browse all applications with searchable, sortable table and card views
- **Advanced Search & Filtering** - Filter by department, tags, environment, and search across multiple fields
- **Application Details** - Comprehensive view including:
  - Overview with metadata, ownership, and contact information
  - Interactive dependency graphs showing service relationships
  - Custom links and datastores
  - Multi-tab interface for organized information

### Security & Tech Stack
- **Unified Security Dashboard** - Combined portfolio overview of vulnerabilities and technology inventory
- **Vulnerability Tracking** - Monitor CVEs across all applications with severity-based filtering
  - Critical, High, Medium, and Low vulnerability counts
  - Per-application vulnerability details
  - Searchable vulnerability database
- **SBOM Management** - Software Bill of Materials tracking for each application
  - Runtime and framework inventory (Java, Python, Node.js, Go, .NET)
  - Dependency tracking with version information
  - EOL (End-of-Life) detection for runtimes
  - Component-level vulnerability mapping
- **Tech Stack Analysis** - Portfolio-wide technology distribution
  - Runtime version tracking with EOL badges
  - Framework usage across applications
  - Searchable dependency lists
  - Critical dependency identification
- **Cross-Application Insights** - Identify shared dependencies and security risks affecting multiple applications

### Team Organization
- **Team Management** - View and manage teams with application ownership
- **Team Details** - See all applications owned by each team
- **Contact Information** - Email and Teams channel integration

### Platform Inventory
- **Platform Tools Catalog** - Track shared infrastructure and platform services
- **Tool Details** - Comprehensive view of platform components

### Known Issues Management
- **Issue Tracking** - Track known problems and technical debt per application
- **Team-specific Issues** - Filter and manage issues by owning team
- **Status Management** - Track issue resolution progress

### User Experience
- **Dark/Light Theme** - Toggle between themes with persistent preferences
- **AI Chat Assistant** - Interactive help and guidance (UI implemented)
- **Responsive Design** - Fully responsive interface for desktop, tablet, and mobile
- **Fast Navigation** - Client-side routing with optimized code splitting
- **Loading States** - Skeleton screens and loading indicators
- **Modern UI** - Glassmorphic effects, smooth animations, and gradient accents

## Tech Stack

### Core Technologies
- **Framework**: React 18.3 with TypeScript
- **Build Tool**: Vite 7.1 with code splitting optimization
- **UI Framework**: Tailwind CSS 4.1
- **Component Library**: shadcn/ui with Radix UI primitives
- **State Management**: TanStack Query (React Query) v5
- **Routing**: React Router v6
- **Theme Management**: Custom React Context with localStorage persistence

### Key Libraries
- **Visualization**:
  - ReactFlow 11 - Interactive dependency graphs
  - Recharts 3.3 - Charts and analytics
- **Icons**: Lucide React
- **Utilities**:
  - clsx & tailwind-merge - Conditional styling
  - zustand - Lightweight state management

### Development Tools
- **Language**: TypeScript 5.3
- **Linting**: ESLint 9 with TypeScript support
- **Code Quality**: Prettier 3.2
- **Type Checking**: TypeScript strict mode

## Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable components
│   │   ├── applications/    # Application-specific components
│   │   │   ├── ApplicationGrid.tsx
│   │   │   ├── ApplicationTable.tsx
│   │   │   ├── DependencyGraph.tsx
│   │   │   └── FilterPanel.tsx
│   │   ├── chat/           # AI chat components
│   │   ├── KnownIssues/    # Known issues components
│   │   ├── layout/         # Layout components (NavBar, Layout)
│   │   ├── techstack/      # Tech Stack/SBOM components
│   │   │   ├── TechStackSummary.tsx
│   │   │   ├── RuntimeOverview.tsx
│   │   │   ├── FrameworksOverview.tsx
│   │   │   ├── DependencyTable.tsx
│   │   │   ├── TopIssuesList.tsx
│   │   │   └── SbomTimeline.tsx
│   │   ├── ui/             # shadcn/ui components
│   │   └── vulnerabilities/ # Vulnerability components
│   ├── contexts/           # React contexts
│   │   ├── ThemeContext.tsx
│   │   └── ChatContext.tsx
│   ├── data/               # Mock data (JSON files)
│   │   ├── applications.json
│   │   ├── techstack.json
│   │   ├── vulnerabilities.json
│   │   └── ...
│   ├── lib/                # Utility functions
│   │   └── utils.ts
│   ├── pages/              # Page components (lazy-loaded)
│   │   ├── About.tsx
│   │   ├── ApplicationDetails.tsx
│   │   ├── ApplicationForm.tsx
│   │   ├── Dashboard.tsx
│   │   ├── PlatformInventory.tsx
│   │   ├── Security.tsx    # Unified Security & Tech Stack page
│   │   ├── TeamDetails.tsx
│   │   ├── Teams.tsx
│   │   └── TechStack.tsx   # Tech Stack tab component
│   ├── services/           # API service layer
│   │   ├── applicationService.ts
│   │   ├── techLandscapeService.ts  # Portfolio aggregation
│   │   ├── techstackService.ts      # Per-app SBOM data
│   │   ├── vulnerabilityService.ts
│   │   ├── teamService.ts
│   │   └── ...
│   ├── types/              # TypeScript type definitions
│   │   ├── application.ts
│   │   ├── techstack.ts
│   │   ├── vulnerability.ts
│   │   └── ...
│   ├── App.tsx             # Main app component with routing
│   └── main.tsx            # Application entry point
├── public/                 # Static assets
├── index.html              # HTML entry point
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite configuration
└── tailwind.config.js      # Tailwind CSS configuration
```

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm (comes with Node.js)

### Installation

1. Navigate to the frontend directory:
```bash
cd nova/frontend
```

2. Install dependencies:
```bash
npm install
```

### Development

Start the development server with hot module replacement:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

Build the application with TypeScript compilation and optimization:
```bash
npm run build
```

The optimized build will be created in the `dist/` directory with:
- Code splitting for optimal loading performance
- Minified and compressed assets
- Tree-shaken dependencies
- Source maps for debugging

### Preview Production Build

Preview the production build locally:
```bash
npm run preview
```

### Linting

Run ESLint to check code quality:
```bash
npm run lint
```

## Development Guidelines

### Component Organization
- **Feature-based structure**: Components are grouped by feature (applications, techstack, vulnerabilities)
- **Shared UI components**: Reusable UI primitives in `components/ui/`
- **Page components**: Top-level route components in `pages/`
- **Lazy loading**: Heavy components and pages use React.lazy() for code splitting

### State Management
- **Server state**: TanStack Query for data fetching, caching, and synchronization
- **UI state**: React useState/useReducer for local component state
- **Global state**: React Context for theme and chat state
- **URL state**: React Router for navigation state

### Styling
- **Tailwind CSS**: Utility-first styling with custom configuration
- **Dark mode**: CSS variables for theme switching
- **Responsive**: Mobile-first approach with breakpoint utilities
- **Components**: shadcn/ui components with Tailwind styling

### TypeScript
- **Strict mode**: Full type safety with strict TypeScript configuration
- **Type definitions**: Centralized in `src/types/`
- **Interface naming**: Clear, descriptive names without Hungarian notation
- **Type imports**: Use `import type` for type-only imports

### Performance Optimization
- **Code splitting**: Route-based and component-based lazy loading
- **Memoization**: useMemo/useCallback for expensive computations
- **Query caching**: React Query automatic caching and background updates
- **Bundle size**: Main bundle ~326 kB, all chunks under 500 kB

## Data Model

The application uses mock JSON data stored in `src/data/`. Key data structures include:

### Application
```typescript
interface Application {
  id: string
  name: string
  brief: string
  description: string
  department: string
  environment: 'production' | 'staging' | 'development'
  owner: {
    team: string
    contact_email: string
    teams_channel?: string
  }
  tags: string[]
  dependencies: string[]  // Application IDs
  datastores: Datastore[]
  links: {
    repository: string
    documentation: string
    monitoring: string
  }
  customLinks?: CustomLink[]
}
```

### Tech Stack (SBOM)
```typescript
interface TechStackData {
  appId: string
  summary: {
    health: 'ok' | 'warning' | 'critical'
    criticalCount: number
    warningCount: number
  }
  runtimes: Runtime[]
  frameworks: Framework[]
  topIssues: TopIssue[]
  components: ComponentPage
  timeline: TimelineEntry[]
}
```

### Vulnerability
```typescript
interface Vulnerability {
  id: string
  application_id: string
  cve_id: string
  title: string
  description: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  status: 'open' | 'in_progress' | 'resolved'
  affected_component: string
  discovered_date: string
}
```

## Deployment

The application is configured for GitHub Pages deployment with basename `/nova/`. To deploy:

1. Build the application:
```bash
npm run build
```

2. Deploy the `dist/` directory to your hosting platform

For GitHub Pages, the repository includes a GitHub Actions workflow for automatic deployment.

## Future Enhancements

### Planned Features
- Backend API integration (currently using mock data)
- Real-time SBOM scanning and updates
- Advanced vulnerability remediation workflows
- Custom reporting and dashboards
- SSO/Authentication integration
- Webhook notifications for security events
- Export capabilities (PDF, CSV)

### Technical Improvements
- End-to-end testing with Playwright/Cypress
- Unit testing with Vitest and React Testing Library
- Storybook for component documentation
- Performance monitoring and analytics

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

When contributing to the frontend:

1. Follow the existing code structure and naming conventions
2. Ensure TypeScript types are properly defined
3. Test responsive behavior on multiple screen sizes
4. Run `npm run lint` before committing
5. Use meaningful commit messages

## License

[Add your license information here]

## Support

For questions or issues, please refer to the main project documentation or contact the development team.
