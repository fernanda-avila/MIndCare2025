export default function getUploadUrl(url?: string | null) {
  if (!url) return url;
  try {
    // already absolute
    if (/^https?:\/\//i.test(url)) return url;
    // relative path to uploads (e.g. /uploads/xxx.jpg)
    if (url.startsWith('/uploads')) {
      const api = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
      // if API value contains /api suffix, remove it to get server origin
      const origin = api.replace(/\/api$/i, '').replace(/\/api\/$/i, '');
      if (origin) return `${origin}${url}`;
      return url;
    }
    return url;
  } catch (e) {
    return url;
  }
}
