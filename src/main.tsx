import '@/lib/errorReporter';
import { enableMapSet } from "immer";
enableMapSet();
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import '@/index.css'
import { HomePage } from '@/pages/HomePage'
import { SearchPage } from '@/pages/SearchPage';
import { HostProfile } from '@/pages/HostProfile';
import { BookingsPage } from '@/pages/BookingsPage';
import { MessagesPage } from '@/pages/MessagesPage';
import { HostDashboard } from '@/pages/HostDashboard';
import { DemoPage } from '@/pages/DemoPage';
import { Toaster } from '@/components/ui/sonner';
const queryClient = new QueryClient();
const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/search",
    element: <SearchPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/hosts/:id",
    element: <HostProfile />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/bookings",
    element: <BookingsPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/messages",
    element: <MessagesPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/dashboard",
    element: <HostDashboard />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/demo",
    element: <DemoPage />,
    errorElement: <RouteErrorBoundary />,
  },
]);
// Do not touch this code
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster richColors closeButton />
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
)