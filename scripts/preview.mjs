/**
 * Local preview of the production build.
 *
 * `astro preview` does not work with `@astrojs/vercel`, so this serves the real
 * `.vercel/output` artifact the way Vercel does: walk the generated route
 * table, serve static files from the filesystem first, and hand everything else
 * to the rendered function. That keeps `npm run preview` honest — what you see
 * here is what production runs, middleware and all.
 *
 * Not a full Build Output API implementation: it supports the route shapes
 * Astro's adapter emits (`handle: "filesystem"`, `src` + `dest`, `headers` with
 * `continue`, and `status`).
 */
import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const OUTPUT_DIR = resolve('.vercel/output');
const STATIC_DIR = join(OUTPUT_DIR, 'static');
const FUNCTIONS_DIR = join(OUTPUT_DIR, 'functions');
const PORT = Number(process.env.PORT ?? 4321);
const HOST = process.env.HOST ?? 'localhost';

const CONTENT_TYPES = {
	'.html': 'text/html; charset=utf-8',
	'.css': 'text/css; charset=utf-8',
	'.js': 'text/javascript; charset=utf-8',
	'.mjs': 'text/javascript; charset=utf-8',
	'.json': 'application/json; charset=utf-8',
	'.xml': 'application/xml; charset=utf-8',
	'.txt': 'text/plain; charset=utf-8',
	'.svg': 'image/svg+xml',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.webp': 'image/webp',
	'.avif': 'image/avif',
	'.woff': 'font/woff',
	'.woff2': 'font/woff2',
	'.ico': 'image/x-icon',
};

async function loadConfig() {
	try {
		return JSON.parse(await readFile(join(OUTPUT_DIR, 'config.json'), 'utf8'));
	} catch {
		console.error('No .vercel/output found. Run `npm run build` first.');
		process.exit(1);
	}
}

/** Cache of loaded serverless function handlers, keyed by function name. */
const handlers = new Map();

async function loadHandler(name) {
	if (handlers.has(name)) return handlers.get(name);

	const funcDir = join(FUNCTIONS_DIR, `${name}.func`);
	const config = JSON.parse(await readFile(join(funcDir, '.vc-config.json'), 'utf8'));
	const entry = pathToFileURL(join(funcDir, config.handler)).href;
	const mod = await import(entry);
	const handler = mod.default?.fetch ? mod.default.fetch.bind(mod.default) : mod.default;

	handlers.set(name, handler);
	return handler;
}

/** Resolve a request path to a file on disk, the way a static host would. */
async function resolveStatic(pathname) {
	const clean = decodeURIComponent(pathname).replace(/\/+$/, '') || '/index';
	const candidates = [clean, `${clean}.html`, `${clean}/index.html`];

	for (const candidate of candidates) {
		const filePath = join(STATIC_DIR, candidate);
		if (!filePath.startsWith(STATIC_DIR)) continue; // path traversal guard
		try {
			const stats = await stat(filePath);
			if (stats.isFile()) return filePath;
		} catch {
			// try the next candidate
		}
	}
	return null;
}

function toRequest(req) {
	const url = new URL(req.url, `http://${req.headers.host ?? `${HOST}:${PORT}`}`);
	const hasBody = req.method !== 'GET' && req.method !== 'HEAD';

	return new Request(url, {
		method: req.method,
		headers: req.headers,
		...(hasBody ? { body: req, duplex: 'half' } : {}),
	});
}

async function send(res, response, extraHeaders) {
	for (const [key, value] of response.headers) res.setHeader(key, value);
	for (const [key, value] of Object.entries(extraHeaders)) res.setHeader(key, value);
	res.writeHead(response.status);

	if (!response.body) return res.end();
	const buffer = Buffer.from(await response.arrayBuffer());
	res.end(buffer);
}

const config = await loadConfig();

const server = createServer(async (req, res) => {
	const url = new URL(req.url, `http://${req.headers.host ?? `${HOST}:${PORT}`}`);
	const extraHeaders = {};
	let status;

	try {
		for (const route of config.routes ?? []) {
			if (route.handle === 'filesystem') {
				const filePath = await resolveStatic(url.pathname);
				if (filePath) {
					res.writeHead(200, {
						'Content-Type': CONTENT_TYPES[extname(filePath)] ?? 'application/octet-stream',
						...extraHeaders,
					});
					createReadStream(filePath).pipe(res);
					return;
				}
				continue;
			}

			if (!route.src) continue;
			if (!new RegExp(route.src).test(url.pathname)) continue;

			Object.assign(extraHeaders, route.headers ?? {});
			if (route.status) status = route.status;
			if (route.continue) continue;
			if (!route.dest) continue;

			const handler = await loadHandler(route.dest.replace(/^\//, ''));
			let response = await handler(toRequest(req));
			// A route-level `status` overrides the function's, the way Vercel's
			// catch-all 404 rule does.
			if (status && response.status !== status) {
				response = new Response(response.body, { status, headers: response.headers });
			}
			await send(res, response, extraHeaders);
			return;
		}

		res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
		res.end('Not found');
	} catch (error) {
		console.error(error);
		res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
		res.end('Preview server error');
	}
});

server.listen(PORT, HOST, () => {
	console.log(`Preview of .vercel/output running at http://${HOST}:${PORT}`);
});
