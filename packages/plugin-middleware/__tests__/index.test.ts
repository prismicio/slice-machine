import path from "path";
import PluginMiddleware from "../src";
import * as Dummy from "../src/dummy-plugin";

describe("@slicemachine/plugin-middleware", () => {
  describe("register", () => {
    it("should register a node-module", () => {
      jest.mock("foo", () => ({ bar: null }), { virtual: true });
      const p = new PluginMiddleware(["foo"]);
      expect(p.plugins.foo).toBeDefined();
      expect("bar" in p.plugins.foo).toBeTruthy();
      // expect(p.plugins.foo.bar).toBeNull();
    });

    it("should register a local module", () => {
      jest.mock(
        path.join(process.cwd(), "fake-plugin"),
        () => ({ bar: null }),
        { virtual: true }
      );

      const name = "fake-plugin";
      const p = new PluginMiddleware([`./${name}`]);

      const localPath = path.join(process.cwd(), name);
      expect(p.plugins[localPath]).toBeDefined();
      expect("bar" in p.plugins[localPath]).toBeTruthy();
      // expect(p.plugins[localPath].bar).toBeNull();
    });
  });

  describe("createSlice", () => {
    it("should call the slice method on plugins", () => {
      jest.spyOn(Dummy, "slice");
      const sliceName = "foo";
      const p = new PluginMiddleware([Dummy.name]);
      const result = p.createSlice(sliceName);
      expect(Dummy.slice).toHaveBeenCalled();
      expect(result[Dummy.name].data).toContain(
        `const ${sliceName} = () => "foobar"`
      );
      expect(result[Dummy.name].data).toContain(`export default ${sliceName}`);
      expect(result[Dummy.name].filename).toEqual("index.js");
    });
  });

  describe("createStory", () => {
    it("should call the story method on the plugins", () => {
      jest.spyOn(Dummy, "story");
      const p = new PluginMiddleware([Dummy.name]);
      const result = p.createStory("some/path", "MySlice", []);
      expect(Dummy.story).toBeCalled();
      expect(result[Dummy.name].filename).toEqual("index.story.js");
      // expect(result[Dummy.name].data).toEqual("")
    });
  });

  describe("craeteIndex", () => {
    it("should call the index method on the plugins", () => {
      jest.spyOn(Dummy, "index");
      const p = new PluginMiddleware([Dummy.name]);
      const result = p.createIndex(["foo", "bar", "baz"]);
      expect(Dummy.index).toBeCalled();
      expect(result[Dummy.name].filename).toEqual("index.js");
      expect(result[Dummy.name].data).toContain(
        'export {default as foo} from "./foo"\n'
      );
      expect(result[Dummy.name].data).toContain(
        'export {default as bar} from "./bar"\n'
      );
      expect(result[Dummy.name].data).toContain(
        'export {default as baz} from "./baz"'
      );
    });
  });
});
