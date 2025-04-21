export function getNearestFloor(number?: number) {
  return Math.floor((number || 0) * 100) / 100;
}
