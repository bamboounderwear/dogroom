/**
 * Mock Client-Side Analytics Utility
 *
 * This provides a simple event tracking function that logs to the console.
 * It's designed to be easily replaced with a real analytics service integration
 * (e.g., Cloudflare Web Analytics, Google Analytics) without changing the call sites.
 */
type AnalyticsEvent =
  | { name: 'page_view'; params: { page_path: string; load_time_ms?: number } }
  | { name: 'search_filter_apply'; params: { filters: Record<string, any> } }
  | { name: 'host_select'; params: { host_id: string; source: 'map' | 'list' } }
  | { name: 'booking_request'; params: { host_id: string; nights: number; total_cost: number } }
  | { name: 'booking_cancel_attempt'; params: { booking_id: string } }
  | { name: 'booking_cancel_confirm'; params: { booking_id: string } }
  | { name: 'message_sent'; params: { chat_id: string } }
  | { name: 'booking_status_update'; params: { booking_id: string; status: 'accepted' | 'rejected' } }
  | { name: 'app_load'; params: { load_time_ms: number } };
let eventQueue: AnalyticsEvent[] = [];
let debounceTimer: NodeJS.Timeout | null = null;
const sendEvents = () => {
  if (eventQueue.length > 0) {
    console.log(`[Analytics] Batch sending ${eventQueue.length} events:`, eventQueue);
    // In a real app, you'd send this batch to your analytics backend.
    eventQueue = [];
  }
};
/**
 * Tracks an analytics event. For this demo, it batches events and logs to the console.
 * @param event The event to track, consisting of a name and parameters.
 */
export const track = (event: AnalyticsEvent) => {
  eventQueue.push({ ...event, params: { ...event.params, timestamp: Date.now() } });
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
  debounceTimer = setTimeout(sendEvents, 200);
};
// Track initial app load time
const startTime = performance.now();
window.addEventListener('load', () => {
  const loadTime = performance.now() - startTime;
  track({ name: 'app_load', params: { load_time_ms: Math.round(loadTime) } });
});
/**
 * A simple hook to provide the track function to components.
 * This is mostly for consistency and future-proofing.
 */
export const useAnalytics = () => {
  return { track };
};