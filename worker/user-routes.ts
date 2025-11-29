import { Hono } from "hono";
import type { Env } from './core-utils';
import { UserEntity, ChatBoardEntity, HostEntity, BookingEntity } from "./entities";
import { ok, bad, notFound, isStr } from './core-utils';
import type { Host, HostPreview, PetSize } from "@shared/types";
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  app.get('/api/test', (c) => c.json({ success: true, data: { name: 'DogRoom API' }}));
  // Ensure data is seeded on first request to any of these
  app.use('/api/users/*', async (c, next) => { await UserEntity.ensureSeed(c.env); await next(); });
  app.use('/api/chats/*', async (c, next) => { await ChatBoardEntity.ensureSeed(c.env); await next(); });
  app.use('/api/hosts/*', async (c, next) => { await HostEntity.ensureSeed(c.env); await next(); });
  app.use('/api/bookings/*', async (c, next) => { await BookingEntity.ensureSeed(c.env); await next(); });
  // HOSTS
  app.get('/api/hosts', async (c) => {
    const cq = c.req.query('cursor');
    const lq = c.req.query('limit');
    const page = await HostEntity.list(c.env, cq ?? null, lq ? Math.max(1, (Number(lq) | 0)) : 10);
    return ok(c, page);
  });
  app.get('/api/hosts/:id', async (c) => {
    const host = new HostEntity(c.env, c.req.param('id'));
    if (!await host.exists()) return notFound(c, 'host not found');
    return ok(c, await host.getState());
  });
  app.post('/api/search', async (c) => {
    const { petSize, from, to, radiusKm } = (await c.req.json()) as { petSize?: PetSize, from?: number, to?: number, radiusKm?: number };
    const { items: allHosts } = await HostEntity.list(c.env, null, 100); // Get all for demo
    const filtered = allHosts.filter(host => {
      if (petSize && !host.allowedPetSizes.includes(petSize)) return false;
      // NOTE: Availability check is mocked for phase 1
      return true;
    });
    const previews: HostPreview[] = filtered.map(host => ({
      id: host.id,
      name: host.name,
      avatar: host.avatar,
      pricePerNight: host.pricePerNight,
      rating: host.rating,
      tags: host.tags,
      location: host.location,
      score: host.rating * 100 + host.reviewsCount, // Simple scoring
    }));
    previews.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    return ok(c, { items: previews.slice(0, 20), next: null });
  });
  // BOOKINGS
  app.get('/api/bookings', async (c) => {
    const userId = c.req.query('userId');
    if (!isStr(userId)) return bad(c, 'userId is required');
    const { items: allBookings } = await BookingEntity.list(c.env, null, 1000);
    const userBookings = allBookings.filter(b => b.userId === userId);
    const hostIds = [...new Set(userBookings.map(b => b.hostId))];
    const hosts = await Promise.all(hostIds.map(id => new HostEntity(c.env, id).getState()));
    const hostsById = new Map(hosts.map(h => [h.id, h]));
    const results = userBookings.map(booking => ({
      ...booking,
      host: hostsById.get(booking.hostId)
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
    // Mocked conflict check for Phase 1
    const { items: allBookings } = await BookingEntity.list(c.env, null, 1000);
    const hostBookings = allBookings.filter(b => b.hostId === hostId && b.status !== 'cancelled');
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