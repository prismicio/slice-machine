import { test as base } from "@playwright/test";

// eslint-disable-next-line
type TestFixtures = {};

export const test = base.extend<TestFixtures>({});

export { expect } from "@playwright/test";
