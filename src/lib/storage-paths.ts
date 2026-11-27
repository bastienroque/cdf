// Turns public storage URLs into object paths inside one bucket, e.g.
// ".../object/public/restaurant-photos/abc.jpg" -> "abc.jpg".
export function storagePathsFromUrls(bucket: string, urls: string[]): string[] {
  const marker = `/object/public/${bucket}/`;
  return urls
    .map((url) => {
      try {
        const { pathname } = new URL(url);
        const i = pathname.indexOf(marker);
        return i === -1 ? null : decodeURIComponent(pathname.slice(i + marker.length));
      } catch {
        return null;
      }
    })
    .filter((p): p is string => Boolean(p));
}
