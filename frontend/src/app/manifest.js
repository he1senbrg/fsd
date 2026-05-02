export const dynamic = 'force-static';

export default function manifest() {
  return {
    name: 'KalaSetu',
    short_name: 'KalaSetu',
    description: 'Bridging Tradition and Opportunity',
    start_url: '/feed',
    display: 'standalone',
    background_color: '#fdfbf7',
    theme_color: '#ffffff',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
