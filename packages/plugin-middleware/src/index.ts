import path from "path";
import { SliceAsObject } from "@slicemachine/core/src/models";
import type { FieldType } from "@slicemachine/core/src/models/CustomType/fields";
import snakeCase from "lodash.snakecase";
import fs from "fs";

export type Variations = SliceAsObject["variations"];

export type Plugin = {
  slice?: (name: string) => { filename: string; data: string };
  story?: (
    path: string,
    title: string,
    variations: SliceAsObject["variations"]
  ) => { filename: string; data: string };
  index?: (slices: string[]) => { filename: string; data: string };
  snippets?: (widget: FieldType, field: string, useKey?: boolean) => string;
  framework?: string;
  model?: (sliceName: string) => { filename: string; data: SliceAsObject };
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
    framework: string | undefined,
    prop: string
  ): Record<string, Plugin> {
    if (framework === undefined) return this.plugins;

    return Object.entries(this.plugins)
      .filter(([, plugin]) => {
        return (
          Object.prototype.hasOwnProperty.call(plugin, prop) &&
          plugin.framework === framework
        );
      })
      .reduce((acc, [name, plugin]) => ({ ...acc, [name]: plugin }), {});
  }

  private _defaultModel(name: string): {
    filename: string;
    data: SliceAsObject;
  } {
    const filename = "model.json";
    const dataObj = {
      id: snakeCase(name),
      type: "SharedSlice",
      name: "MySlice",
      description: "MySlice",
      variations: [
        {
          id: "default-slice",
          name: "Default slice",
          docURL: "...",
          version: "sktwi1xtmkfgx8626",
          description: "MySlice",
          primary: {
            title: {
              type: "StructuredText",
              config: {
                single: "heading1",
                label: "Title",
                placeholder: "This is where it all begins...",
              },
            },
            description: {
              type: "StructuredText",
              config: {
                single: "paragraph",
                label: "Description",
                placeholder: "A nice description of your product",
              },
            },
          },
        },
      ],
    } as SliceAsObject;

    return { filename, data: dataObj };
  }

  register(name: string) {
    const root = process.env.PWD || process.cwd();
    const modulesDir = path.join(root, "node_modules");
    const modulesPath = name.startsWith(".")
      ? path.resolve(root, path.join.apply(null, name.split(path.posix.sep)))
      : path.join(modulesDir, name);

    const fileStat = fs.lstatSync(modulesPath);
    const isLink = fileStat.isSymbolicLink();
    const link = fs.readlinkSync(modulesPath);
    const pathToModule = path.resolve(path.join(modulesDir, "foo"), link);
    const realPath = isLink ? pathToModule : modulesPath;
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const plugin = require(realPath);

    this.plugins[realPath] = plugin;
  }

  // TODO: remove the framework argument, and return an object or array of files and data
  createSlice(
    framework: string | undefined,
    sliceName: string
  ): Record<string, { filename: string; data: string }> {
    const slices = this._findPluginsWithProp(framework, "slice");

    return Object.entries(slices).reduce((acc, [name, plugin]) => {
      if (!plugin.slice) return acc;

      const result = plugin.slice(sliceName);
      return { ...acc, [name]: result };
    }, {});
  }

  createStory(
    framework: string | undefined,
    pathToComponent: string,
    sliceName: string,
    variations: SliceAsObject["variations"]
  ): Record<string, { filename: string; data: string }> {
    const stories = this._findPluginsWithProp(framework, "story");

    return Object.entries(stories).reduce((acc, [name, plugin]) => {
      if (!plugin.story) return acc;

      const result = plugin.story(pathToComponent, name, variations);
      return { ...acc, [name]: result };
    }, {});
  }

  createIndex(
    framework: string | undefined,
    slices: string[]
  ): Record<string, { filename: string; data: string }> {
    const indices = this._findPluginsWithProp(framework, "index");
    return Object.entries(indices).reduce((acc, [name, plugin]) => {
      if (!plugin.index) return acc;

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

  createModel(
    framework: string | undefined,
    sliceName: string
  ): { filename: string; data: SliceAsObject } {
    const models = this._findPluginsWithProp(framework, "model");

    return Object.values(models).reduce((acc, plugin) => {
      if (!plugin.model) return acc;
      const result = plugin.model(sliceName);
      return result;
    }, this._defaultModel(sliceName));
  }

  // clean up actions

  // deleteSlice(name: string): string { return name }
  // deleteStory(name: string): string { return name }
}
