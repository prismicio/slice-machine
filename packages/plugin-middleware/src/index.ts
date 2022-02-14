import path from "path";
import { SliceAsObject } from "@slicemachine/core/src/models";
import type { FieldType } from "@slicemachine/core/src/models/CustomType/fields";
import snakeCase from "lodash.snakecase";
import fs from "fs";

export { FieldType } from "@slicemachine/core/src/models/CustomType/fields";

export type Variations = SliceAsObject["variations"];

export type FilenameAndData<T = string | SliceAsObject> = {
  filename: string;
  data: T;
};

export type Plugin = {
  framework?: string;
  slice?: (name: string) => FilenameAndData<string>[] | FilenameAndData<string>;
  story?: (
    path: string,
    sliceName: string,
    variations: Variations
  ) => FilenameAndData<string>[] | FilenameAndData<string>;
  index?: (
    slices: string[]
  ) => FilenameAndData<string>[] | FilenameAndData<string>;
  snippets?: (widget: FieldType, field: string, useKey?: boolean) => string;
  model?: (sliceName: string) => FilenameAndData<SliceAsObject>;
  // [key: string]: unknown;
};

export default class PluginContainer {
  plugins: Record<string, Plugin>;
  cwd: string;
  constructor(pluginsToLoad: string[] = [], cwd: string = process.cwd()) {
    this.plugins = {};
    this.cwd = cwd;

    this.register = this.register.bind(this);
    this.createSlice = this.createSlice.bind(this);
    this.createStory = this.createStory.bind(this);
    this.createIndex = this.createIndex.bind(this);
    this.createSnippet = this.createSnippet.bind(this);

    if (pluginsToLoad && pluginsToLoad.length) {
      pluginsToLoad.forEach((plugin) => this.register(plugin, cwd));
    }
  }

  private _findPluginsWithProp(
    prop: string,
    framework?: string
  ): Array<Plugin> {
    return Object.values(this.plugins).filter((plugin) => {
      const hasProp = Object.prototype.hasOwnProperty.call(plugin, prop);
      return framework ? hasProp && plugin.framework === framework : hasProp;
    });
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

  register(name: string, cwd: string) {
    // intresting
    // https://github.com/eslint/eslintrc/blob/8761efbb1b263f63bcc34a3765ce092c7494b251/lib/shared/relative-module-resolver.js#L21
    // THIS LOOKS intresting. it returns a custom require function https://nodejs.org/api/module.html#modulecreaterequirefilename
    // const root = process.env.PWD || process.cwd(); // TODO: this could be a parameter in the constructor, we need to know from where slice-machine is being run
    const modulesDir = path.join(cwd, "node_modules");
    const modulesPath = path.isAbsolute(name)
      ? name
      : name.startsWith(".")
      ? path.resolve(cwd, path.join.apply(null, name.split(path.posix.sep)))
      : path.join(modulesDir, name);

    const fileStat = fs.lstatSync(modulesPath);
    const isLink = fileStat.isSymbolicLink();
    const realPath = isLink
      ? path.resolve(path.join(modulesDir, "foo"), fs.readlinkSync(modulesPath))
      : modulesPath;
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const plugin = require(realPath);

    this.plugins[name] = plugin;
  }

  // TODO: remove the framework argument, and return an object or array of files and data
  createSlice(sliceName: string): FilenameAndData<string>[] {
    const slices = this._findPluginsWithProp("slice");

    return slices.reduce((acc: FilenameAndData<string>[], plugin) => {
      if (!plugin.slice) return acc;
      const result = plugin.slice(sliceName);
      if (Array.isArray(result)) return [...acc, ...result];
      return [...acc, result];
    }, []);
  }

  createStory(
    pathToComponent: string,
    sliceName: string,
    variations: SliceAsObject["variations"]
  ): FilenameAndData<string>[] {
    const stories = this._findPluginsWithProp("story");

    return stories.reduce((acc: FilenameAndData<string>[], plugin) => {
      if (!plugin.story) return acc;

      const result = plugin.story(pathToComponent, sliceName, variations);

      if (Array.isArray(result)) return [...acc, ...result];
      return [...acc, result];
    }, []);
  }

  createIndex(
    framework: string | undefined,
    slices: string[]
  ): FilenameAndData<string>[] {
    const indices = this._findPluginsWithProp("index");
    return indices.reduce((acc: FilenameAndData<string>[], plugin) => {
      if (!plugin.index) return acc;

      const result = plugin.index(slices);

      if (Array.isArray(result)) return [...acc, ...result];
      return [...acc, result];
    }, []);
  }

  createSnippet(
    framework: string,
    widget: FieldType,
    field: string,
    useKey = false
  ): string {
    const widgets = this._findPluginsWithProp("snippets", framework);
    return widgets.reduce((acc, plugin) => {
      if (!plugin.snippets) return acc;
      return plugin.snippets(widget, field, useKey);
    }, "");
  }

  createModel(sliceName: string): { filename: string; data: SliceAsObject } {
    const models = this._findPluginsWithProp("model");

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
