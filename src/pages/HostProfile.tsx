import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { api } from '@/lib/api-client';
import type { Host, ServiceType, Review } from '@shared/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetDescription } from '@/components/ui/sheet';
import { toast } from 'sonner';
import { Star, Home, Sun, Footprints, ShieldCheck, ListChecks, MessageSquare } from 'lucide-react';
import { DEMO_USER_ID } from '@shared/mock-data';
import { DateRange } from 'react-day-picker';
import { format, differenceInCalendarDays } from 'date-fns';
import { ReviewCard } from '@/components/ReviewCard';
import { track } from '@/components/analytics';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { motion } from 'framer-motion';
const serviceIcons: Record<ServiceType, React.ReactNode> = {
  boarding: <Home className="w-4 h-4 mr-2" />,
  daycare: <Sun className="w-4 h-4 mr-2" />,
  walking: <Footprints className="w-4 h-4 mr-2" />
};
export function HostProfile() {
  const { id } = useParams<{id: string;}>();
  const queryClient = useQueryClient();
  const [isBookingSheetOpen, setBookingSheetOpen] = useState(false);
  const [selectedDates, setSelectedDates] = useState<DateRange | undefined>();
  const { data: host, isLoading, isError } = useQuery({
    queryKey: ['host', id],
    queryFn: () => api<Host>(`/api/hosts/${id}`),
    enabled: !!id
  });
  const { data: reviewsData, fetchNextPage, hasNextPage, isFetchingNextPage } = useQuery({
    queryKey: ['reviews', id],
    queryFn: ({ pageParam = null }) => api<{ items: Review[], next: string | null }>(`/api/reviews?hostId=${id}&cursor=${pageParam}`),
    getNextPageParam: (lastPage) => lastPage.next,
    initialPageParam: null,
    enabled: !!id,
  });
  const allReviews = reviewsData?.pages.flatMap(page => page.items) ?? host?.reviews ?? [];
  const bookingMutation = useMutation({
    mutationFn: (newBooking: {hostId: string;userId: string;from: number;to: number;}) =>
    api('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(newBooking)
    }),
    onSuccess: (_, variables) => {
      const nights = differenceInCalendarDays(variables.to, variables.from);
      const totalCost = nights * (host?.pricePerNight ?? 0);
      toast.success('Booking request sent!', {
        description: 'The host will confirm your request shortly.'
      });
      track({ name: 'booking_request', params: { host_id: variables.hostId, nights, total_cost: totalCost } });
      setBookingSheetOpen(false);
      setSelectedDates(undefined);
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
    onError: (error) => {
      toast.error('Booking failed', {
        description: error.message
      });
    }
  });
  const handleBookNow = () => {
    if (!selectedDates?.from || !selectedDates?.to) {
      toast.warning('Please select a date range.');
      return;
    }
    if (differenceInCalendarDays(selectedDates.to, selectedDates.from) < 1) {
        toast.warning('Booking must be for at least one night.');
        return;
    }
    if (!id) return;
    bookingMutation.mutate({
      hostId: id,
      userId: DEMO_USER_ID,
      from: selectedDates.from.getTime(),
      to: selectedDates.to.getTime()
    });
  };
  if (isLoading) return <HostProfileSkeleton />;
  if (isError || !host) return <div className="text-center py-20">Host not found.</div>;
  const nights = selectedDates?.from && selectedDates?.to ?
    differenceInCalendarDays(selectedDates.to, selectedDates.from) : 0;
  const totalCost = nights * host.pricePerNight;
  return (
    <AppLayout container>
      <div className="space-y-12">
        <header className="space-y-4">
          <Carousel className="w-full">
            <CarouselContent>
              {host.gallery.map((img, i) => (
                <CarouselItem key={i}>
                  <div className="aspect-video rounded-2xl overflow-hidden bg-muted">
                    <img src={img} alt={`Gallery view ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
          </Carousel>
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div>
              <h1 className="text-4xl font-bold font-display">{host.name}</h1>
              <div className="flex items-center gap-4 text-muted-foreground mt-2">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-dogroom-accent fill-current" />
                  <span className="font-semibold text-foreground">{host.rating.toFixed(1)}</span>
                  <span>({allReviews.length} reviews)</span>
                </div>
                {host.verified &&
                <div className="flex items-center gap-1">
                    <ShieldCheck className="w-5 h-5 text-green-500" />
                    <span>Verified Sitter</span>
                  </div>
                }
              </div>
            </div>
            <div className="flex-shrink-0 flex items-center gap-3">
              <Avatar className="w-16 h-16">
                <AvatarImage src={host.avatar} />
                <AvatarFallback>{host.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">About {host.name.split("'")[0]}</h2>
              <p className="text-muted-foreground leading-relaxed">{host.bio}</p>
            </section>
            <section>
              <h2 className="text-2xl font-semibold mb-4">Services Offered</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {host.tags.map((tag) =>
                <motion.div whileHover={{ scale: 1.05 }} key={tag} className="flex items-center p-4 border rounded-lg">
                    {serviceIcons[tag]}
                    <span className="capitalize font-medium">{tag}</span>
                  </motion.div>
                )}
              </div>
            </section>
            <section>
              <h2 className="text-2xl font-semibold mb-4">House Rules</h2>
              <ul className="space-y-2 text-muted-foreground">
                {host.houseRules.map((rule, i) =>
                <li key={i} className="flex items-start">
                    <ListChecks className="w-5 h-5 mr-3 mt-1 text-dogroom-primary flex-shrink-0" />
                    <span>{rule}</span>
                  </li>
                )}
              </ul>
            </section>
            <section>
              <h2 className="text-2xl font-semibold mb-4">Reviews ({allReviews.length})</h2>
              <div className="space-y-4">
                {allReviews.length > 0 ? (
                    allReviews.map(review => <ReviewCard key={review.id} review={review} />)
                ) : (
                    <p className="text-muted-foreground">No reviews yet.</p>
                )}
                {hasNextPage && (
                  <Button onClick={() => fetchNextPage()} disabled={isFetchingNextPage} className="w-full">
                    {isFetchingNextPage ? 'Loading more...' : 'Load More Reviews'}
                  </Button>
                )}
              </div>
            </section>
          </div>
          <aside className="lg:col-span-1">
            <Card className="sticky top-8 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">
                  <span className="font-bold">${host.pricePerNight}</span>
                  <span className="text-base font-normal text-muted-foreground"> / night</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="range"
                  selected={selectedDates}
                  onSelect={setSelectedDates}
                  numberOfMonths={1}
                  disabled={{ before: new Date() }} />
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <Button size="lg" className="w-full" onClick={() => setBookingSheetOpen(true)}>
                  Book Now
                </Button>
                <Button size="lg" variant="outline" className="w-full">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Message Host
                </Button>
              </CardFooter>
            </Card>
          </aside>
        </div>
      </div>
      <Sheet open={isBookingSheetOpen} onOpenChange={setBookingSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Confirm your booking</SheetTitle>
            <SheetDescription>Review the details before sending your request.</SheetDescription>
          </SheetHeader>
          <div className="py-8 space-y-6">
            <div>
              <h3 className="font-semibold">{host.name}</h3>
              <p className="text-sm text-muted-foreground">{host.location.city}</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              {selectedDates?.from && selectedDates?.to ?
              <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{format(selectedDates.from, 'LLL dd, y')}</p>
                    <p className="text-sm text-muted-foreground">Check-in</p>
                  </div>
                  <div className="text-center">&rarr;</div>
                  <div>
                    <p className="font-medium">{format(selectedDates.to, 'LLL dd, y')}</p>
                    <p className="text-sm text-muted-foreground">Check-out</p>
                  </div>
                </div> :
              <p className="text-muted-foreground">Please select dates on the calendar first.</p>
              }
            </div>
            {nights > 0 &&
            <div className="space-y-2 border-t pt-4">
                <div className="flex justify-between">
                  <span>${host.pricePerNight} x {nights} nights</span>
                  <span>${totalCost}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${totalCost}</span>
                </div>
              </div>
            }
          </div>
          <SheetFooter>
            <Button
              size="lg"
              className="w-full"
              onClick={handleBookNow}
              disabled={!selectedDates?.from || !selectedDates?.to || nights < 1 || bookingMutation.isPending}>
              {bookingMutation.isPending ? 'Requesting...' : 'Request to Book'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </AppLayout>);
}
function HostProfileSkeleton() {
  return (
    <AppLayout container>
      <div className="space-y-12">
        <header className="space-y-4">
          <Skeleton className="w-full aspect-video rounded-2xl" />
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <Skeleton className="h-10 w-72" />
              <Skeleton className="h-6 w-48" />
            </div>
            <Skeleton className="w-16 h-16 rounded-full" />
          </div>
        </header>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-4">
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-3/4" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-8 w-48" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-12" />
                <Skeleton className="h-12" />
              </div>
            </div>
          </div>
          <aside>
            <Skeleton className="h-96 w-full rounded-2xl" />
          </aside>
        </div>
      </div>
    </AppLayout>);
}