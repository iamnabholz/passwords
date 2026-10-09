import { self as worker } from '$app/service-worker';
import { version } from '$app/env';
import { immutable, assets } from '$app/manifest';

const CACHE_PREFIX = 'passwords-app-';
const CACHE_NAME = `${CACHE_PREFIX}${version}`;

function assetPath(path: string): string {
	return new URL(path, `${worker.location.origin}/`).pathname;
}

const ASSETS = [
	...new Set([
		...immutable.map(({ path }) => assetPath(path)),
		...assets.map(({ path }) => assetPath(path)),
		'/'
	])
];

const ASSET_PATHS = new Set(ASSETS);

worker.addEventListener('install', (event) => {
	event.waitUntil(
		(async () => {
			try {
				const cache = await caches.open(CACHE_NAME);
				await cache.addAll(ASSETS);
			} catch (error) {
				await caches.delete(CACHE_NAME);
				throw error;
			}
		})()
	);

	// Allow an existing app session to finish using its current version.
	// The new worker activates after the old version's tabs/windows close.
});

worker.addEventListener('activate', (event) => {
	event.waitUntil(
		(async () => {
			const cacheNames = await caches.keys();

			await Promise.all(
				cacheNames
					.filter((name) => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME)
					.map((name) => caches.delete(name))
			);
		})()
	);
});

async function serveAsset(request: Request, cachePath: string): Promise<Response> {
	const cache = await caches.open(CACHE_NAME);
	const cached = await cache.match(cachePath);

	if (cached) return cached;

	// Do not store arbitrary network responses in the app cache.
	return fetch(request);
}

worker.addEventListener('fetch', (event) => {
	const { request } = event;

	if (request.method !== 'GET') return;

	const url = new URL(request.url);

	if (url.origin !== worker.location.origin) return;

	if (request.mode === 'navigate') {
		// Only serve the homepage offline. Unknown routes go to the server.
		if (url.pathname === '/') {
			event.respondWith(serveAsset(request, '/'));
		}

		return;
	}

	// Only intercept known app assets, without query-string variations.
	if (url.search || !ASSET_PATHS.has(url.pathname)) return;

	event.respondWith(serveAsset(request, url.pathname));
});
