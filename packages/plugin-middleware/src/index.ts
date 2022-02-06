import path from "path";
import type { SliceMock } from "@slicemachine/core/src/models";
import { string } from "fp-ts";

type Plugin = {
  slice: (name: string) => { filename: string; data: string };
  story: (
    path: string,
    title: string,
    mock: SliceMock
  ) => { filename: string; data: string };
  index: (slices: string[]) => { filename: string; data: string };
  // snippets: (name: string) => string;
  [key: string]: unknown;
};

export default class PluginContainer {
  plugins: Record<string, Plugin>;
  constructor(paths?: string[]) {
    this.plugins = {};

    this.register = this.register.bind(this);
    this.createSlice = this.createSlice.bind(this);
    this.createStory = this.createStory.bind(this);
    this.createIndex = this.createIndex.bind(this);

    if (paths && paths.length) {
      paths.forEach(this.register);
    }
  }

  private _findPluginsWithProp(prop: string): Record<string, Plugin> {
    return Object.entries(this.plugins)
      .filter(([_, plugin]) => {
        return Object.prototype.hasOwnProperty.call(plugin, prop);
      })
      .reduce((acc, [name, plugin]) => ({ ...acc, [name]: plugin }), {});
  }

  register(name: string) {
    const pluginPath = name.startsWith(".")
      ? path.resolve(
          process.cwd(),
          path.join.apply(null, name.split(path.posix.sep))
        )
      : name;

    const plugin = require(pluginPath);

    this.plugins[pluginPath] = plugin;
  }

  createSlice(
    sliceName: string
  ): Record<string, { filename: string; data: string }> {
    const slices = this._findPluginsWithProp("slice");
    return Object.entries(slices).reduce((acc, [name, plugin]) => {
      const result = plugin.slice(sliceName);
      return { ...acc, [name]: result };
    }, {});
  }

  createStory(
    path: string,
    title: string,
    mock: SliceMock
  ): Record<string, { filename: string; data: string }> {
    const stories = this._findPluginsWithProp("story");
    return Object.entries(stories).reduce((acc, [name, plugin]) => {
      const result = plugin.story(path, title, mock);
      return { ...acc, [name]: result };
    }, {});
  }

  createIndex(
    stories: string[]
  ): Record<string, { filename: string; data: string }> {
    const indices = this._findPluginsWithProp("index");
    return Object.entries(indices).reduce((acc, [name, plugin]) => {
      const result = plugin.index(stories);
      return { ...acc, [name]: result };
    }, {});
  }
}
