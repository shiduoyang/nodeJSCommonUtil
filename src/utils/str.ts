export function checkIsTimeString(str: string) {
  // YYYY-MM-DD HH:mm:ss
  return /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(str);
}