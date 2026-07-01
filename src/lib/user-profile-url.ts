export function getUserProfileHref(userId: string) {
  return `/user?id=${encodeURIComponent(userId)}`;
}
