export const percentToPrice = (percent: number, price?: number) =>
  (price ?? 0) * ((percent ?? 0) / 100);
