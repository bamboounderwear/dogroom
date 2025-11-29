import React from 'react';
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
import { PawPrint } from 'lucide-react';
type BookingWithHost = Booking & { host: Host };
const statusColors: Record<Booking['status'], string> = {
  pending: 'bg-yellow-400',
  confirmed: 'bg-green-500',
  cancelled: 'bg-red-500',
};
export function BookingsPage() {
  const queryClient = useQueryClient();
  const { data: bookingsResponse, isLoading } = useQuery({
    queryKey: ['bookings', DEMO_USER_ID],
    queryFn: () => api<{ items: BookingWithHost[] }>(`/api/bookings?userId=${DEMO_USER_ID}`),
  });
  const cancelMutation = useMutation({
    mutationFn: (bookingId: string) => api(`/api/bookings/${bookingId}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast.success('Booking cancelled.');
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
        ) : bookings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bookings.map((booking) => (
              <Card key={booking.id} className="overflow-hidden">
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
                <CardContent className="p-4 space-y-3">
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
                    <Badge className="capitalize flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${statusColors[booking.status]}`} />
                      {booking.status}
                    </Badge>
                  </div>
                </CardContent>
                <CardFooter className="p-4 bg-muted/50">
                  {booking.status !== 'cancelled' && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">Cancel Booking</Button>
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
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border-2 border-dashed rounded-lg">
            <PawPrint className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-xl font-semibold">No bookings yet</h3>
            <p className="mt-2 text-muted-foreground">Ready for an adventure? Find a sitter for your best friend!</p>
            <Button asChild className="mt-6">
              <a href="/search">Find a Sitter</a>
            </Button>
          </div>
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