# SnaggedIt Lite

SnaggedIt Lite is a web application for documenting, tracking, and resolving issues during home construction and renovation projects.

## Features

- User authentication (sign up, sign in, sign out)
- Mobile-first, responsive UI
- Integration with Supabase for data storage and authentication
- Accessible design following WCAG 2.2 AA standards

## Tech Stack

- Next.js 14 (React framework)
- TypeScript
- Tailwind CSS
- Supabase (Authentication, Database, Storage)
- React Hook Form with Zod validation

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn
- Supabase account and project

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file based on `.env.local.example` and add your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

4. Set up your Supabase database:
   - Create a `profiles` table with the schema as defined in `src/types/supabase.ts`
   - Set up Row Level Security (RLS) policies for the tables

### Running the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `src/app`: Next.js app router pages and layouts
- `src/components`: Reusable React components
- `src/lib`: Utility libraries and Supabase client configuration
- `src/types`: TypeScript type definitions
- `src/hooks`: Custom React hooks
- `src/utils`: Utility functions

## Deployment

This project can be deployed to any platform that supports Next.js applications, such as Vercel, Netlify, or a custom server.

## License

[MIT](LICENSE)
