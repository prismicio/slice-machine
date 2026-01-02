#!/usr/bin/env node

// Entry point for the CLI
import("../dist/cli.cjs").then((cli) => cli.runCLI());
