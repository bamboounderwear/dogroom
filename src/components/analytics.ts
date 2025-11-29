/**
 * Mock Client-Side Analytics Utility
 *
 * This provides a simple event tracking function that logs to the console.
 * It's designed to be easily replaced with a real analytics service integration
 * (e.g., Cloudflare Web Analytics, Google Analytics) without changing the call sites.
 */
type AnalyticsEvent =
  | { name: 'page_view'; params: { page_path: string } }
  | { name: 'search_filter_apply'; params: { filters: Record<string, any> } }
  | { name: 'host_select'; params: { host_id: string; source: 'map' | 'list' } }
  | { name: 'booking_request'; params: { host_id: string; nights: number; total_cost: number } }
  | { name: 'booking_cancel_attempt'; params: { booking_id: string } }
  | { name: 'booking_cancel_confirm'; params: { booking_id: string } };
/**
 * Tracks an analytics event. For this demo, it just logs to the console.
 * @param event The event to track, consisting of a name and parameters.
 */
export const track = (event: AnalyticsEvent) => {
  // In a real-world application, this is where you would integrate with your analytics provider.
  // For example:
  // if (window.dataLayer) {
  //   window.dataLayer.push({ event: event.name, ...event.params });
  // }
  // Or for Cloudflare Web Analytics:
  // if (window.cfw) {
  //   window.cfw('event', event.name, { params: event.params });
  // }
  console.log(`[Analytics] Event tracked: "${event.name}"`, { params: event.params });
};
/**
 * A simple hook to provide the track function to components.
 * This is mostly for consistency and future-proofing.
 */
export const useAnalytics = () => {
  return { track };
};