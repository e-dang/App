export function dateToSeconds(date: Date) {
  return Math.floor(date.getTime() / 1000);
}
