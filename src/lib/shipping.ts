
export type DeliveryZone = "LAGOS" | "ABUJA";

export type ShippingQuote = {
  zone: DeliveryZone;
  fee: number;
  currency: "NGN";
};

const SHIPPING_RATES: Record<DeliveryZone, number> = {
  LAGOS: 5000,
  ABUJA: 10000,
};

export function getShippingQuote(
  state: string
): ShippingQuote | null {
  const normalizedState = state.trim().toLowerCase();

  if (normalizedState === "lagos") {
    return {
      zone: "LAGOS",
      fee: SHIPPING_RATES.LAGOS,
      currency: "NGN",
    };
  }

  if (
    normalizedState === "abuja" ||
    normalizedState === "fct" ||
    normalizedState === "federal capital territory"
  ) {
    return {
      zone: "ABUJA",
      fee: SHIPPING_RATES.ABUJA,
      currency: "NGN",
    };
  }

  return null;
}
