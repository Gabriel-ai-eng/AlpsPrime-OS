/**
 * Pro plan pricing — fixed at R$ 49,90/month.
 */
const BASE_PRICE = 49.90;

export function getProPricing() {
  return {
    isPromo: false,
    price: BASE_PRICE,
    originalPrice: null,
    promoLabel: null,
  };
}