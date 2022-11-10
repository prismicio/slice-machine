#!/usr/bin/env node

void (async () => {
	// eslint-disable-next-line
	const mod = await import("../dist/index.cjs");
	// eslint-disable-next-line
	await mod.default();
})();
