import { Hono } from "hono";
import type { Env } from './core-utils';
import { UserEntity, ChatBoardEntity, HostEntity, BookingEntity, ReviewEntity } from "./entities";
import { ok, bad, notFound, isStr } from './core-utils';
import type { Host, HostPreview, PetSize, ServiceType, Review } from "@shared/types";
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  app.get('/api/test', (c) => c.json({ success: true, data: { name: 'DogRoom API' }}));
  // Ensure data is seeded on first request to any of these
  app.use('/api/*', async (c, next) => { 
    await Promise.all([
        UserEntity.ensureSeed(c.env),
        ChatBoardEntity.ensureSeed(c.env),
        HostEntity.ensureSeed(c.env),
        BookingEntity.ensureSeed(c.env),
        ReviewEntity.ensureSeed(c.env)
    ]);
    await next(); 
  });
  // HOSTS
  app.get('/api/hosts', async (c) => {
    const cq = c.req.query('cursor');
    const lq = c.req.query('limit');
    const page = await HostEntity.list(c.env, cq ?? null, lq ? Math.max(1, (Number(lq) | 0)) : 10);
    return ok(c, page);
  });
  app.get('/api/hosts/:id', async (c) => {
    const hostId = c.req.param('id');
    const host = new HostEntity(c.env, hostId);
    if (!await host.exists()) return notFound(c, 'host not found');
    const hostState = await host.getState();
    // Aggregate reviews for this host
    const { items: allReviews } = await ReviewEntity.list(c.env, null, 1000);
    const hostReviews = allReviews.filter(r => r.hostId === hostId);
    const userIds = [...new Set(hostReviews.map(r => r.userId))];
    const users = await Promise.all(userIds.map(id => new UserEntity(c.env, id).getState()));
    const usersById = new Map(users.map(u => [u.id, u]));
    const populatedReviews = hostReviews.map(r => ({ ...r, user: usersById.get(r.userId) }));
    return ok(c, { ...hostState, reviews: populatedReviews });
  });
  app.post('/api/search', async (c) => {
    const { petSize, services } = (await c.req.json()) as { petSize?: PetSize, services?: ServiceType[] };
    const { items: allHosts } = await HostEntity.list(c.env, null, 100); // Get all for demo
    const filtered = allHosts.filter(host => {
      if (petSize && !host.allowedPetSizes.includes(petSize)) return false;
      if (services && services.length > 0 && !services.every(s => host.tags.includes(s))) return false;
      return true;
    });
    const previews: HostPreview[] = filtered.map(host => {
        let score = host.rating * 100 + host.reviewsCount;
        if (services && services.length > 0 && services.every(s => host.tags.includes(s))) {
            score += 50; // Bonus for matching all services
        }
        if (petSize && host.allowedPetSizes.includes(petSize)) {
            score += 25; // Bonus for matching pet size
        }
        const rawLoc = (host as any).location ?? {};
        const latRaw = rawLoc.lat ?? rawLoc.latitude ?? rawLoc.y ?? rawLoc.x;
        const lngRaw = rawLoc.lng ?? rawLoc.longitude ?? rawLoc.x ?? rawLoc.y;
        const latNum = Number(latRaw);
        const lngNum = Number(lngRaw);
        const location = {
          lat: Number.isFinite(latNum) ? latNum : 46.813,
          lng: Number.isFinite(lngNum) ? lngNum : -71.208,
          city: typeof rawLoc.city === 'string' && rawLoc.city.trim() ? rawLoc.city : 'Quebec',
        };
        return {
          id: host.id,
          name: host.name,
          avatar: host.avatar,
          pricePerNight: host.pricePerNight,
          rating: host.rating,
          tags: host.tags,
          location,
          score,
        }
    });
    previews.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    return ok(c, { items: previews.slice(0, 20), next: null });
  });
  // BOOKINGS
  app.get('/api/bookings', async (c) => {
    const userId = c.req.query('userId');
    const hostId = c.req.query('hostId');
    const { items: allBookings } = await BookingEntity.list(c.env, null, 1000);
    let bookings = allBookings;
    if (isStr(userId)) bookings = bookings.filter(b => b.userId === userId);
    if (isStr(hostId)) bookings = bookings.filter(b => b.hostId === hostId);
    const hostIds = [...new Set(bookings.map(b => b.hostId))];
    const userIds = [...new Set(bookings.map(b => b.userId))];
    const hosts = await Promise.all(hostIds.map(id => new HostEntity(c.env, id).getState()));
    const users = await Promise.all(userIds.map(id => new UserEntity(c.env, id).getState()));
    const hostsById = new Map(hosts.map(h => [h.id, h]));
    const usersById = new Map(users.map(u => [u.id, u]));
    const results = bookings.map(booking => ({
      ...booking,
      host: hostsById.get(booking.hostId),
      user: usersById.get(booking.userId),
    }));
    return ok(c, { items: results, next: null });
  });
  app.post('/api/bookings', async (c) => {
    const { hostId, userId, from, to } = (await c.req.json()) as { hostId?: string, userId?: string, from?: number, to?: number };
    if (!isStr(hostId) || !isStr(userId) || !from || !to || from >= to) {
      return bad(c, 'hostId, userId, and a valid date range are required');
    }
    const host = new HostEntity(c.env, hostId);
    if (!await host.exists()) return notFound(c, 'host not found');
    const { items: allBookings } = await BookingEntity.list(c.env, null, 1000);
    const hostBookings = allBookings.filter(b => b.hostId === hostId && (b.status === 'confirmed' || b.status === 'pending'));
    const hasConflict = hostBookings.some(b => (from < b.to && to > b.from));
    if (hasConflict) {
      return bad(c, 'Dates are not available. Please select a different range.');
    }
    const booking = {
      id: crypto.randomUUID(),
      hostId,
      userId,
      from,
      to,
      status: 'pending' as const,
      createdAt: Date.now(),
    };
    await BookingEntity.create(c.env, booking);
    return ok(c, booking);
  });
  app.delete('/api/bookings/:id', async (c) => {
    const bookingId = c.req.param('id');
    const booking = new BookingEntity(c.env, bookingId);
    if (!await booking.exists()) return notFound(c, 'booking not found');
    await booking.mutate(s => ({ ...s, status: 'cancelled' }));
    return ok(c, { id: bookingId, deleted: true });
  });
  app.put('/api/bookings/:id/accept', async (c) => {
    const booking = new BookingEntity(c.env, c.req.param('id'));
    if (!await booking.exists()) return notFound(c);
    await booking.accept();
    return ok(c, await booking.getState());
  });
  app.put('/api/bookings/:id/reject', async (c) => {
    const booking = new BookingEntity(c.env, c.req.param('id'));
    if (!await booking.exists()) return notFound(c);
    await booking.reject();
    return ok(c, await booking.getState());
  });
  // REVIEWS
  app.get('/api/reviews', async (c) => {
    const hostId = c.req.query('hostId');
    if (!isStr(hostId)) return bad(c, 'hostId is required');
    const { items: allReviews } = await ReviewEntity.list(c.env, null, 1000);
    const hostReviews = allReviews.filter(r => r.hostId === hostId);
    return ok(c, { items: hostReviews });
  });
  app.post('/api/reviews', async (c) => {
    const { hostId, userId, rating, comment } = (await c.req.json()) as Partial<Review>;
    if (!isStr(hostId) || !isStr(userId) || !rating || !isStr(comment)) {
        return bad(c, 'hostId, userId, rating, and comment are required');
    }
    const review: Review = { id: crypto.randomUUID(), hostId, userId, rating, comment, ts: Date.now() };
    await ReviewEntity.create(c.env, review);
    return ok(c, review);
  });
  // --- Existing Demo Routes ---
  // USERS
  app.get('/api/users', async (c) => {
    const cq = c.req.query('cursor');
    const lq = c.req.query('limit');
    const page = await UserEntity.list(c.env, cq ?? null, lq ? Math.max(1, (Number(lq) | 0)) : undefined);
    return ok(c, page);
  });
  app.post('/api/users', async (c) => {
    const { name } = (await c.req.json()) as { name?: string };
    if (!name?.trim()) return bad(c, 'name required');
    return ok(c, await UserEntity.create(c.env, { id: crypto.randomUUID(), name: name.trim() }));
  });
  // CHATS
  app.get('/api/chats', async (c) => {
    const cq = c.req.query('cursor');
    const lq = c.req.query('limit');
    const page = await ChatBoardEntity.list(c.env, cq ?? null, lq ? Math.max(1, (Number(lq) | 0)) : undefined);
    return ok(c, page);
  });
  app.post('/api/chats', async (c) => {
    const { title } = (await c.req.json()) as { title?: string };
    if (!title?.trim()) return bad(c, 'title required');
    const created = await ChatBoardEntity.create(c.env, { id: crypto.randomUUID(), title: title.trim(), messages: [] });
    return ok(c, { id: created.id, title: created.title });
  });
  // MESSAGES
  app.get('/api/chats/:chatId/messages', async (c) => {
    const chat = new ChatBoardEntity(c.env, c.req.param('chatId'));
    if (!await chat.exists()) return notFound(c, 'chat not found');
    return ok(c, await chat.listMessages());
  });
  app.post('/api/chats/:chatId/messages', async (c) => {
    const chatId = c.req.param('chatId');
    const { userId, text } = (await c.req.json()) as { userId?: string; text?: string };
    if (!isStr(userId) || !text?.trim()) return bad(c, 'userId and text required');
    const chat = new ChatBoardEntity(c.env, chatId);
    if (!await chat.exists()) return notFound(c, 'chat not found');
    return ok(c, await chat.sendMessage(userId, text.trim()));
  });
}