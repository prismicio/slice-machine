#!/usr/bin/env node

void (async () => {
  const mod = await import("../dist/index.cjs");
  await mod.default();
})();
