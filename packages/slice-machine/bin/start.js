#!/usr/bin/env node

// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
const start = require("../build/scripts/start/index.js").default;
// eslint-disable-next-line @typescript-eslint/no-unsafe-call
void start();
