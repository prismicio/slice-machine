import * as plugin from "../src";
import type { Variations } from "@slicemachine/plugin-middleware";

describe("@slicemachine/plugin-react", () => {
  test("#framework", () => {
    expect(plugin.framework).toEqual("react");
  });
  test("#slice", () => {
    const result = plugin.slice("Foo");
    expect(result.data).toContain("const Foo = ({ slice }) => (");
    expect(result.data).toContain("export default Foo");
    expect(result).toMatchSnapshot();
  });

  test("story", () => {
    const variations = [
      {
        id: "default-slice",
        name: "Default slice",
        docURL: "...",
        version: "sktwi1xtmkfgx8626",
        description: "FooSlice",
        primary: {
          title: {
            type: "StructuredText" as const,
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
              placeholder: "A nice description of your feature",
            },
          },
          "": {
            config: {
              label: "",
              constraint: {},
              thumbnails: [],
            },
            type: "Image",
          },
        },
        items: {},
      },
    ] as Variations;
    const result = plugin.story("../slices/foo", "FooBar", variations);
    expect(result.filename).toEqual("index.stories.js");
    expect(result.data).toContain("import MyComponent from '../slices/foo'");

    expect(result.data).toContain("export default { title: 'FooBar' }");

    expect(result.data).toContain(
      `export const _DefaultSlice = () => <MyComponent slice={`
    );

    expect(result.data).toContain(
      `_DefaultSlice.storyName = '${variations[0].name}'`
    );

    expect(result).toMatchSnapshot();
  });
});
