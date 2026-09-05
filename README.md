# TaskFlow

A modern task management application designed to help individuals and teams stay organized, collaborate effectively, and achieve their goals with a clean, intuitive interface.

## Overview

TaskFlow combines powerful task management features with a polished user experience. Built with Next.js and Firebase, it delivers real-time collaboration, drag-and-drop interactions, and a responsive design that works seamlessly across all devices.

## Features

### Task Management
- Kanban-style board with drag-and-drop support
- Task filtering by status (pending, completed, overdue)
- Sorting by due date, priority, creation date, or alphabetically
- Custom task lists with color coding
- Priority levels and due date tracking

### Team Collaboration
- Create and manage teams
- Invite members via email
- Role-based access (owner, admin, member)
- Real-time synchronization across all team members

### Calendar View
- Visual monthly calendar with task overlay
- Create tasks directly from calendar dates
- Filter tasks by priority within the calendar

### Task Templates
- Pre-built templates for common workflows
- Categories: Project Management, Marketing, Development, Design, Content, Events, Personal, Business, Education
- Create, duplicate, and share templates publicly
- Apply templates to quickly populate task lists

### Customization
- Dark and light theme support
- Profile management with avatar upload
- Notification preferences (email, push, task reminders, team updates)
- Privacy settings for profile and task visibility

### Additional Features
- Responsive design for desktop, tablet, and mobile
- Animated page transitions with Framer Motion
- Landing page with feature showcase
- Form validation with Zod

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 |
| Language | TypeScript |
| UI Library | React 18 |
| Styling | Tailwind CSS |
| Components | Shadcn/UI (Radix UI) |
| Database | Firebase Firestore |
| Authentication | Firebase Auth |
| Animations | Framer Motion |
| Drag and Drop | @hello-pangea/dnd |
| Forms | React Hook Form + Zod |
| Icons | Lucide React |

## Getting Started

### Prerequisites

- Node.js 18+ or npm/pnpm/yarn
- A Firebase project with Firestore and Authentication enabled

### Installation

```bash
# Clone the repository
git clone <repository-url>

# Navigate to project directory
cd Tasks-Management

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
```

### Environment Variables

Create a `.env.local` file in the project root with your Firebase configuration:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Development

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`.

### Production

```bash
pnpm build
pnpm start
```

## Project Structure

```
Tasks-Management/
├── app/
│   ├── dashboard/          # Dashboard pages (tasks, calendar, team, templates, settings)
│   ├── login/              # Login page
│   ├── register/           # Registration page
│   └── page.tsx            # Landing page
├── components/
│   ├── dashboard/          # Dashboard-specific components
│   ├── landing/            # Landing page components
│   └── ui/                 # Reusable Shadcn/UI components
├── hooks/                  # Custom React hooks
├── lib/                    # Firebase config, contexts, utilities
├── styles/                 # Global styles
└── types/                  # TypeScript type definitions
```

## License

This project is private and not currently open for public contribution.
