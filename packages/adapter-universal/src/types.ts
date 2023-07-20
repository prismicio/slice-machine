import type * as fs from "node:fs/promises";

export type PluginOptions = never;

export type BufferEncoding = Extract<Parameters<typeof fs.readFile>[1], string>;
