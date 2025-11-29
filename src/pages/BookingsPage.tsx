import React, { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { api } from '@/lib/api-client';
import type { Booking, Host } from '@shared/types';
import { DEMO_USER_ID } from '@shared/mock-data';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { track } from '@/components/analytics';
import { EmptyState } from '@/components/EmptyState';
type BookingWithHost = Booking & { host: Host };
const statusColors: Record<Booking['status'], string> = {
  pending: 'bg-yellow-400 border-yellow-500/20 text-yellow-900',
  confirmed: 'bg-green-500 border-green-600/20 text-green-900',
  cancelled: 'bg-gray-500 border-gray-600/20 text-gray-900',
  rejected: 'bg-red-600 border-red-700/20 text-red-900',
};
export function BookingsPage() {
  const queryClient = useQueryClient();
  useEffect(() => {
    track({ name: 'page_view', params: { page_path: '/bookings' } });
  }, []);
  const { data: bookingsResponse, isLoading, isError } = useQuery({
    queryKey: ['bookings', DEMO_USER_ID],
    queryFn: async () => {
      try {
        return await api<{ items: BookingWithHost[] }>(`/api/bookings?userId=${DEMO_USER_ID}`);
      } catch (error) {
        toast.error('Failed to load bookings.', {
          description: error instanceof Error ? error.message : 'Please try again later.',
        });
        throw error;
      }
    },
    retry: false,
  });
  const cancelMutation = useMutation({
    mutationFn: (bookingId: string) => api(`/api/bookings/${bookingId}`, { method: 'DELETE' }),
    onSuccess: (_, bookingId) => {
      toast.success('Booking cancelled.');
      track({ name: 'booking_cancel_confirm', params: { booking_id: bookingId } });
      queryClient.invalidateQueries({ queryKey: ['bookings', DEMO_USER_ID] });
    },
    onError: (error) => {
      toast.error('Failed to cancel booking', { description: error.message });
    },
  });
  const bookings = bookingsResponse?.items ?? [];
  return (
    <AppLayout container>
      <div className="space-y-8">
        <header>
          <h1 className="text-4xl font-bold font-display">My Bookings</h1>
          <p className="text-muted-foreground mt-2">Here are your upcoming and past stays.</p>
        </header>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 2 }).map((_, i) => <BookingCardSkeleton key={i} />)}
          </div>
        ) : isError ? (
          <EmptyState
            title="Something went wrong"
            description="We couldn't load your bookings. Please try refreshing the page."
          />
        ) : bookings.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1 } },
            }}
          >
            {bookings.map((booking) => (
              <motion.div
                key={booking.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              >
                <Card className="overflow-hidden h-full flex flex-col">
                  <CardHeader className="flex flex-row items-center gap-4 p-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={booking.host.avatar} />
                      <AvatarFallback>{booking.host.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>{booking.host.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{booking.host.location.city}</p>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3 flex-grow">
                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <div>
                        <p className="text-xs text-muted-foreground">From</p>
                        <p className="font-semibold">{format(new Date(booking.from), 'EEE, LLL d')}</p>
                      </div>
                      <div className="text-dogroom-primary">&rarr;</div>
                      <div>
                        <p className="text-xs text-muted-foreground">To</p>
                        <p className="font-semibold">{format(new Date(booking.to), 'EEE, LLL d')}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <Badge className={`capitalize ${statusColors[booking.status]}`}>
                        {booking.status}
                      </Badge>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 bg-muted/50">
                    {(booking.status === 'pending' || booking.status === 'confirmed') && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => track({ name: 'booking_cancel_attempt', params: { booking_id: booking.id } })}
                          >
                            Cancel Booking
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will cancel your booking with {booking.host.name}. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Go Back</AlertDialogCancel>
                            <AlertDialogAction onClick={() => cancelMutation.mutate(booking.id)}>
                              Yes, Cancel
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <EmptyState
            title="No bookings yet"
            description="Ready for an adventure? Find a sitter for your best friend!"
            cta={{ label: "Find a Sitter", to: "/search" }}
          />
        )}
      </div>
    </AppLayout>
  );
}
function BookingCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4 p-4">
        <Skeleton className="w-16 h-16 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-24" />
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        <Skeleton className="h-16 w-full" />
        <div className="flex justify-between">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-6 w-24" />
        </div>
      </CardContent>
      <CardFooter className="p-4 bg-muted/50">
        <Skeleton className="h-9 w-28" />
      </CardFooter>
    </Card>
  );
}