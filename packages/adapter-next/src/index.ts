import path from "path";

const rootFile = import.meta.url.slice("file://".length);
globalThis.__dirname = path.dirname(rootFile);

import { plugin } from "./plugin";
export default plugin;

export type { PluginOptions } from "./types";
