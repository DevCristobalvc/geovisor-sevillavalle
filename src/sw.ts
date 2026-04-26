/// <reference lib="webworker" />
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { CacheFirst, NetworkFirst } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<{ url: string; revision: string | null } | string>
}

precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

// ─── OSM tile pre-cache for Sevilla bbox zoom 10-14 ─────────────────────────
const PRECACHE_TILE_CACHE = 'osm-tiles-precache-v1'
const BBOX = { minLat: 4.1, maxLat: 4.44, minLng: -76.08, maxLng: -75.78 }

function tileCoords(lat: number, lng: number, z: number): [number, number] {
  const n = 2 ** z
  const x = Math.floor(((lng + 180) / 360) * n)
  const latRad = (lat * Math.PI) / 180
  const y = Math.floor(((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n)
  return [x, y]
}

function buildTileUrls(): string[] {
  const urls: string[] = []
  for (let z = 10; z <= 14; z++) {
    const [xMin, yMin] = tileCoords(BBOX.maxLat, BBOX.minLng, z) // NW
    const [xMax, yMax] = tileCoords(BBOX.minLat, BBOX.maxLng, z) // SE
    for (let x = xMin; x <= xMax; x++) {
      for (let y = yMin; y <= yMax; y++) {
        const s = ['a', 'b', 'c'][(x + y) % 3]
        urls.push(`https://${s}.tile.openstreetmap.org/${z}/${x}/${y}.png`)
      }
    }
  }
  return urls
}

self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(PRECACHE_TILE_CACHE)
      const urls = buildTileUrls()
      // Fetch in small batches to avoid saturating the network on first install
      const BATCH = 10
      for (let i = 0; i < urls.length; i += BATCH) {
        await Promise.allSettled(
          urls.slice(i, i + BATCH).map(url =>
            fetch(url, { mode: 'cors' })
              .then(r => {
                if (r.ok) cache.put(url, r)
              })
              .catch(() => {})
          )
        )
      }
    })()
  )
})

// ─── Runtime caching strategies ─────────────────────────────────────────────

// OSM tiles (covers pre-cached + any tiles outside bbox)
registerRoute(
  ({ url }) => /^https:\/\/[a-c]\.tile\.openstreetmap\.org\//.test(url.href),
  new CacheFirst({
    cacheName: 'osm-tiles',
    plugins: [new ExpirationPlugin({ maxEntries: 3000, maxAgeSeconds: 7 * 24 * 60 * 60 })],
  })
)

// ESRI satellite tiles
registerRoute(
  ({ url }) => /^https:\/\/server\.arcgisonline\.com\//.test(url.href),
  new CacheFirst({
    cacheName: 'esri-tiles',
    plugins: [new ExpirationPlugin({ maxEntries: 1000, maxAgeSeconds: 7 * 24 * 60 * 60 })],
  })
)

// CVC WMS services (network-first, fallback to cache when offline)
registerRoute(
  ({ url }) => /^https:\/\/.*\.cvc\.gov\.co\//.test(url.href),
  new NetworkFirst({
    cacheName: 'wms-cvc',
    plugins: [new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 24 * 60 * 60 })],
  })
)
