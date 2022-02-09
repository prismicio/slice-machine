import path from "path";
import type { SliceAsObject } from "@slicemachine/core/src/models";
import type { FieldType } from "@slicemachine/core/src/models/CustomType/fields";

export type Variations = SliceAsObject["variations"];

export type Plugin = {
  slice: (name: string) => { filename: string; data: string };
  story: (
    path: string,
    title: string,
    variations: SliceAsObject["variations"]
  ) => { filename: string; data: string };
  index: (slices: string[]) => { filename: string; data: string };
  snippets?: (widget: FieldType, field: string, useKey?: boolean) => string;
  framework?: string;
  // [key: string]: unknown;
};

export default class PluginContainer {
  plugins: Record<string, Plugin>;
  constructor(paths?: string[]) {
    this.plugins = {};

    this.register = this.register.bind(this);
    this.createSlice = this.createSlice.bind(this);
    this.createStory = this.createStory.bind(this);
    this.createIndex = this.createIndex.bind(this);
    this.createSnippet = this.createSnippet.bind(this);

    if (paths && paths.length) {
      paths.forEach(this.register);
    }
  }

  private _findPluginsWithProp(
    framework: string,
    prop: string
  ): Record<string, Plugin> {
    return Object.entries(this.plugins)
      .filter(([, plugin]) => {
        return (
          Object.prototype.hasOwnProperty.call(plugin, prop) &&
          plugin.framework === framework
        );
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

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const plugin = require(pluginPath);

    this.plugins[pluginPath] = plugin;
  }

  createSlice(
    framework: string,
    sliceName: string
  ): Record<string, { filename: string; data: string }> {
    const slices = this._findPluginsWithProp(framework, "slice");
    return Object.entries(slices).reduce((acc, [name, plugin]) => {
      const result = plugin.slice(sliceName);
      return { ...acc, [name]: result };
    }, {});
  }

  createStory(
    framework: string,
    path: string,
    title: string,
    variations: SliceAsObject["variations"]
  ): Record<string, { filename: string; data: string }> {
    const stories = this._findPluginsWithProp(framework, "story");
    return Object.entries(stories).reduce((acc, [name, plugin]) => {
      const result = plugin.story(path, title, variations);
      return { ...acc, [name]: result };
    }, {});
  }

  createIndex(
    framework: string,
    slices: string[]
  ): Record<string, { filename: string; data: string }> {
    const indices = this._findPluginsWithProp(framework, "index");
    return Object.entries(indices).reduce((acc, [name, plugin]) => {
      const result = plugin.index(slices);
      return { ...acc, [name]: result };
    }, {});
  }

  createSnippet(
    framework: string,
    widget: FieldType,
    field: string,
    useKey = false
  ): Record<string, string> {
    const widgets = this._findPluginsWithProp(framework, "snippets");
    return Object.entries(widgets).reduce((acc, [name, plugin]) => {
      if (!plugin.snippets) return acc;
      const result = plugin.snippets(widget, field, useKey);
      return { ...acc, [name]: result };
    }, {});
  }

  // clean up actions

  // deleteSlice(name: string): string { return name }
  // deleteStory(name: string): string { return name }
}
