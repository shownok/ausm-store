import type { DeliveryZone, StoreSettings } from "./types";

/**
 * Delivery charge shown in the cart/checkout. The database function
 * `place_order` recalculates this on the server, so keep both in sync
 * (see supabase/schema.sql).
 */
export function deliveryCharge(
  subtotal: number,
  zone: DeliveryZone,
  settings: StoreSettings,
): number {
  if (settings.free_delivery_over && subtotal >= settings.free_delivery_over) {
    return 0;
  }
  return zone === "inside_dhaka"
    ? settings.delivery_inside_dhaka
    : settings.delivery_outside_dhaka;
}
