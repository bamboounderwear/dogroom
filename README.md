# DogRoom

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/bamboounderwear/dogroom)

DogRoom is an Airbnb-style marketplace that connects dog owners with trusted local sitters (hosts). Owners can search for sitters by date, location, and pet needs, while hosts list their spaces, availability, services (boarding, daycare, walks), photos, prices, and house rules. The platform emphasizes trust through host profiles, reviews, and verifications. Built as a serverless frontend with Cloudflare Workers and a single Durable Object for storage, it delivers a beautiful, playful, mobile-first experience.

## Features

- **Search & Discovery**: Map-based search with filters for dates, pet size, services, price, and distance. Results ranked by proximity, availability, rating, and price.
- **Host Profiles**: Detailed views with photo galleries, bios, availability calendars, rules, reviews, and booking flows.
- **Booking System**: Secure booking creation with availability checks, conflict detection, and owner booking management.
- **Trust & Safety**: Host verifications (mocked in initial phases), reviews, and clear communication tools.
- **Mobile-First UI**: Playful "Kid Playful" design with smooth micro-interactions, responsive layouts, and intuitive navigation.
- **Backend Persistence**: Serverless storage via Cloudflare Durable Objects for hosts, bookings, and interactions.
- **Demo-Ready**: Seeded data, mocked flows, and polished interfaces for immediate deployment and testing.

## Tech Stack

### Frontend
- **React 18**: Core framework with TypeScript for type-safe development.
- **React Router 6**: Client-side routing for seamless navigation.
- **shadcn/ui**: Accessible, customizable UI components built on Radix UI and Tailwind CSS.
- **Tailwind CSS 3**: Utility-first styling with custom themes for the "Kid Playful" design system.
- **Framer Motion 10**: Smooth animations and micro-interactions.
- **Lucide React**: Icon library for intuitive visuals.
- **Sonner 2**: Toast notifications for user feedback.
- **Zustand 5**: Lightweight state management for UI stores.
- **React Day Picker 9**: Calendar components for availability and booking.
- **@tanstack/react-query 5**: Data fetching, caching, and synchronization (optional).
- **Recharts 2**: Charts for host dashboards (optional).
- **React Hook Form 7**: Form handling with validation.
- **Date-fns 2**: Date utilities.
- **React Use 17**: Utility hooks.

### Backend
- **Hono 4**: Fast web framework for Cloudflare Workers.
- **Cloudflare Workers**: Edge runtime for API endpoints.
- **Durable Objects**: Single-instance storage for entities (hosts, bookings) with atomic operations.

### Development Tools
- **Vite 6**: Fast build tool and dev server.
- **Bun**: Package manager and runtime for installation and scripting.
- **TypeScript 5**: Strict typing across frontend and backend.
- **ESLint & Prettier**: Code quality and formatting.

## Quick Start

### Prerequisites
- Node.js 18+ (or Bun 1.0+ for faster setup).
- Cloudflare account (free tier sufficient for development).
- Wrangler CLI: Install via `bun install -g wrangler`.
- Git for version control.

### Installation
1. Clone the repository:
   ```
   git clone <your-repo-url>
   cd dogroom
   ```

2. Install dependencies using Bun:
   ```
   bun install
   ```

3. Generate Cloudflare types (if needed):
   ```
   bun run cf-typegen
   ```

### Development
1. Start the development server:
   ```
   bun run dev
   ```
   The app will be available at `http://localhost:3000` (or the port specified in your environment).

2. In a separate terminal, start the Cloudflare Worker (for API backend):
   ```
   bun run dev:worker
   ```
   This runs the worker locally via Wrangler.

3. Make changes to the code:
   - Frontend: Edit files in `src/`.
   - Backend: Add routes in `worker/user-routes.ts` and entities in `worker/entities.ts`.
   - Shared types: Update `shared/types.ts`.

4. Hot reload is enabled for both frontend and backend. Test API calls via the browser dev tools or tools like Postman.

5. Lint and type-check:
   ```
   bun run lint
   bunx tsc --noEmit
   ```

### Usage Examples
- **Home/Landing Page**: Features a hero section with quick search for location, dates, and pet size. Redirects to search results.
- **Search Page**: Displays a stylized map (SVG-based for demo) with markers and a bottom sheet for host cards. Apply filters via a slide-up sheet.
- **Host Profile**: View details, check calendar availability with `react-day-picker`, and initiate booking via a dialog sheet.
- **Booking Flow**: Create bookings via POST to `/api/bookings`. The system checks for conflicts using Durable Objects.
- **API Integration**: Fetch hosts with `GET /api/hosts` or search with `POST /api/search { filters, location }`. Use the `api` helper in `src/lib/api-client.ts` for frontend calls.

Example API call in code:
```tsx
import { api } from '@/lib/api-client';

const hosts = await api<{ items: Host[]; next: string | null }>('/api/hosts');
```

For seeded demo data, the app auto-populates hosts and bookings on first run via entity seeds.

## Deployment
Deploy to Cloudflare Workers for global edge performance. No servers required.

1. Build the frontend:
   ```
   bun run build
   ```

2. Deploy the Worker (includes assets):
   ```
   bun run deploy
   ```
   This bundles the frontend to `/dist` and deploys the Worker via Wrangler.

3. Access your app:
   - Worker URL: Provided by Wrangler (e.g., `https://dogroom.youraccount.workers.dev`).
   - Custom domain: Configure in Wrangler or Cloudflare dashboard.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/bamboounderwear/dogroom)

### Environment Variables
Set via Wrangler secrets or dashboard:
- No required vars for basic demo; add as needed (e.g., for production analytics).

### CI/CD
Integrate with GitHub Actions:
- Use Wrangler actions for automated deploys on push.
- Example workflow: Build on PR, deploy on main.

## Contributing
1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/amazing-feature`.
3. Commit changes: `git commit -m 'Add amazing feature'`.
4. Push to branch: `git push origin feature/amazing-feature`.
5. Open a Pull Request.

Follow the code style (ESLint enforced) and ensure tests pass. Focus on mobile-first design and zero runtime errors.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.