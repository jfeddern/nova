# Nova

A modern, responsive web application for managing and exploring application and service catalogs within an organization.

## Overview

The Nova - provides a centralized platform for discovering, understanding, and managing applications and microservices. It offers powerful search, filtering, and visualization capabilities to help teams navigate their technology landscape.

## Features

### Core Functionality
- **Application Catalog Dashboard** - Browse all applications with searchable, sortable table and card views
- **Advanced Search & Filtering** - Filter by department, tags, and search across multiple fields
- **Application Details** - Comprehensive view of application metadata, ownership, and resources
- **Dependency Visualization** - Interactive graph showing service dependencies with click-to-highlight functionality
- **Team Organization** - View applications grouped by owning teams
- **Responsive Design** - Fully responsive interface for desktop, tablet, and mobile devices

### Technical Highlights
- **Modern UI** - Built with Tailwind CSS v4.1 and shadcn/ui components
- **Interactive Graphs** - Sophisticated dependency visualization using react-flow
- **Type Safety** - Full TypeScript implementation
- **Fast Performance** - Client-side filtering and optimized rendering
- **Extensible Architecture** - Designed for future backend API integration
- **Modern Design System** - Glassmorphic effects, smooth animations, and gradient accents
- **OKLCH Color Space** - Using modern color definitions for better perceptual uniformity

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Framework**: Tailwind CSS v4.1 + shadcn/ui
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router v6
- **Visualization**: ReactFlow
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository or navigate to the project directory:
```bash
cd nova
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to:
```
http://localhost:5173
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
