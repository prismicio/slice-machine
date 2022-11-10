#!/usr/bin/env node

void (async () => {
  const mod = await import("start-slicemachine/dist/index.js");
  await mod.default();
})();
