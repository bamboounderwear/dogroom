import React, { useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { Booking, User } from '@shared/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Check, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { track } from '@/components/analytics';
import { EmptyState } from '@/components/EmptyState';
type BookingWithUser = Booking & { user: User };
// Mock host ID for demo
const MOCK_HOST_ID = 'h1';
export function HostDashboard() {
  const queryClient = useQueryClient();
  useEffect(() => {
    track({ name: 'page_view', params: { page_path: '/dashboard' } });
  }, []);
  const { data: bookingsResponse, isLoading } = useQuery({
    queryKey: ['host-bookings', MOCK_HOST_ID],
    queryFn: () => api<{ items: BookingWithUser[] }>(`/api/bookings?hostId=${MOCK_HOST_ID}`),
  });
  const updateBookingStatus = useMutation({
    mutationFn: ({ bookingId, status }: { bookingId: string; status: 'accept' | 'reject' }) =>
      api(`/api/bookings/${bookingId}/${status}`, { method: 'PUT' }),
    onSuccess: (_, vars) => {
      const statusText = vars.status === 'accept' ? 'accepted' : 'rejected';
      toast.success(`Booking ${statusText}.`);
      track({ name: 'booking_status_update', params: { booking_id: vars.bookingId, status: statusText } });
      queryClient.invalidateQueries({ queryKey: ['host-bookings', MOCK_HOST_ID] });
    },
    onError: (error: Error) => {
      toast.error('Failed to update booking', { description: error.message });
    },
  });
  const pendingBookings = bookingsResponse?.items.filter(b => b.status === 'pending') ?? [];
  const upcomingBookings = bookingsResponse?.items.filter(b => b.status === 'confirmed') ?? [];
  return (
    <AppLayout container>
      <div className="space-y-8">
        <header>
          <h1 className="text-4xl font-bold font-display">Host Dashboard</h1>
          <p className="text-muted-foreground mt-2">Manage your bookings and availability.</p>
        </header>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <main className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Booking Requests</CardTitle>
                <CardDescription>You have {pendingBookings.length} new booking requests.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <BookingRequestSkeleton />
                ) : pendingBookings.length > 0 ? (
                  <motion.div
                    variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
                    initial="hidden"
                    animate="visible"
                    className="space-y-4"
                  >
                    {pendingBookings.map(booking => (
                      <motion.div
                        key={booking.id}
                        variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={booking.user?.avatar} />
                            <AvatarFallback>{booking.user?.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">{booking.user?.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(booking.from), 'LLL d')} - {format(new Date(booking.to), 'LLL d, yyyy')}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <motion.div whileTap={{ scale: 0.95 }}>
                            <Button size="icon" variant="outline" className="text-green-600 hover:bg-green-100" onClick={() => updateBookingStatus.mutate({ bookingId: booking.id, status: 'accept' })}>
                              <Check className="w-4 h-4" />
                            </Button>
                          </motion.div>
                          <motion.div whileTap={{ scale: 0.95 }}>
                            <Button size="icon" variant="outline" className="text-red-600 hover:bg-red-100" onClick={() => updateBookingStatus.mutate({ bookingId: booking.id, status: 'reject' })}>
                              <X className="w-4 h-4" />
                            </Button>
                          </motion.div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <EmptyState title="No new requests" description="You're all caught up!"/>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Stays</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <BookingRequestSkeleton />
                ) : upcomingBookings.length > 0 ? (
                  upcomingBookings.map(booking => (
                     <div key={booking.id} className="flex items-center justify-between p-3 rounded-lg">
                        <div className="flex items-center gap-3">
                            <Avatar>
                                <AvatarImage src={booking.user?.avatar} />
                                <AvatarFallback>{booking.user?.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold">{booking.user?.name}</p>
                                <p className="text-sm text-muted-foreground">
                                    {format(new Date(booking.from), 'LLL d')} - {format(new Date(booking.to), 'LLL d, yyyy')}
                                </p>
                            </div>
                        </div>
                        <Badge variant="secondary">Confirmed</Badge>
                     </div>
                  ))
                ) : (
                  <EmptyState title="No upcoming stays" description="Your calendar is clear for now."/>
                )}
              </CardContent>
            </Card>
          </main>
          <aside className="lg:col-span-1 space-y-6">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Manage Availability</CardTitle>
                <CardDescription>Select dates you are unavailable.</CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar mode="multiple" className="p-0" />
              </CardContent>
              <CardFooter>
                <Button className="w-full">Update Availability</Button>
              </CardFooter>
            </Card>
          </aside>
        </div>
      </div>
    </AppLayout>
  );
}
function BookingRequestSkeleton() {
    return (
        <div className="flex items-center justify-between p-3">
            <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                </div>
            </div>
            <div className="flex gap-2">
                <Skeleton className="w-8 h-8" />
                <Skeleton className="w-8 h-8" />
            </div>
        </div>
    )
}