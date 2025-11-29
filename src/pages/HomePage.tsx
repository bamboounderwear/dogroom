import React from 'react';
import { PawPrint, MapPin, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AppLayout } from '@/components/layout/AppLayout';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { HostPreview } from '@shared/types';
import { HostCard, HostCardSkeleton } from '@/components/HostCard';
import { DEMO_USER_ID } from '@shared/mock-data';
import { motion, AnimatePresence } from 'framer-motion';
import { EmptyState } from '@/components/EmptyState';
function PawIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="4" r="2" />
        <circle cx="18" cy="8" r="2" />
        <circle cx="20" cy="16" r="2" />
        <path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-7 0V15a5 5 0 0 1 5-5z" />
        <path d="M6 14.32V15a3.5 3.5 0 0 0 7 0v-2.5" />
        <path d="M14.5 18.5a3.5 3.5 0 0 0 7 0v-3.5" />
      </svg>
    )
  }
export function HomePage() {
  const navigate = useNavigate();
  const [location, setLocation] = React.useState('Quebec');
  const { data: hostsResponse, isLoading, isError } = useQuery({
    queryKey: ['hosts', 'featured'],
    queryFn: () => api<{ items: HostPreview[] }>('/api/hosts?limit=4'),
  });
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/search?location=${encodeURIComponent(location)}`);
  };
  const hosts = hostsResponse?.items ?? [];
  return (
    <AppLayout container={false}>
      <header className="relative bg-blue-50 dark:bg-dogroom-ink/30 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative z-10 py-20 md:py-32 lg:py-40">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-display font-bold text-dogroom-ink dark:text-white text-balance">
                Find the perfect dog sitter, <br />
                <span className="text-dogroom-primary">right next door.</span>
              </h1>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                Connect with trusted, local dog lovers who can't wait to host your best friend.
              </p>
              <form
                onSubmit={handleSearch}
                className="mt-8 max-w-xl mx-auto bg-white dark:bg-background shadow-lg rounded-full p-2 flex items-center gap-2 border"
              >
                <MapPin className="w-5 h-5 text-muted-foreground ml-4" />
                <Input
                  type="text"
                  placeholder="Enter a city, e.g., Quebec"
                  className="border-none focus-visible:ring-0 focus-visible:ring-offset-0 flex-1 !p-0"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
                <Button type="submit" size="icon" className="rounded-full w-12 h-12 bg-dogroom-primary hover:bg-dogroom-primary/90">
                  <Search className="w-6 h-6" />
                </Button>
              </form>
            </div>
          </div>
        </div>
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.2 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 z-0"
          >
            <PawIcon className="absolute -left-16 -top-16 w-64 h-64 text-dogroom-primary/30 transform-gpu rotate-12 animate-float" />
            <PawIcon className="absolute -right-20 bottom-0 w-80 h-80 text-dogroom-accent/30 transform-gpu -rotate-12 animate-float [animation-delay:-1.5s]" />
          </motion.div>
        </AnimatePresence>
      </header>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-16 md:py-24">
          <div className="text-center space-y-3">
            <h2 className="text-3xl md:text-4xl font-bold font-display">Top Rated Hosts</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Meet some of our most loved and trusted dog sitters in your area.
            </p>
          </div>
          <div className="mt-12">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                {Array.from({ length: 4 }).map((_, i) => <HostCardSkeleton key={i} />)}
              </div>
            ) : isError || hosts.length === 0 ? (
              <EmptyState
                title="No Hosts Found"
                description="We couldn't find any hosts right now. Please check back later!"
              />
            ) : (
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
                initial="hidden"
                animate="visible"
                variants={{
                  visible: { transition: { staggerChildren: 0.1 } },
                }}
              >
                {hosts.map((host) => (
                  <motion.div
                    key={host.id}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 },
                    }}
                  >
                    <HostCard host={host} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
          <div className="mt-12 text-center">
            <Button size="lg" asChild className="bg-dogroom-accent hover:bg-dogroom-accent/90 text-dogroom-ink font-bold">
              <Link to="/search">Explore All Sitters</Link>
            </Button>
          </div>
        </div>
      </div>
      <footer className="bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-muted-foreground text-sm">
          <p>&copy; {new Date().getFullYear()} DogRoom. Built with ❤️ at Cloudflare.</p>
          <div className="mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded-md inline-block text-xs">
            <p className="font-semibold">Demo Info:</p>
            <p>You are logged in as Alex Doe. User ID: <code className="font-mono bg-yellow-200 px-1 rounded">{DEMO_USER_ID}</code></p>
          </div>
        </div>
      </footer>
    </AppLayout>
  );
}