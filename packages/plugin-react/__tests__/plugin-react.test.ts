import { expect, test } from "@jest/globals";
import * as plugin from "../src";
import type { Variations } from "@slicemachine/plugin-middleware";
import { FieldType } from "@slicemachine/plugin-middleware";

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

  test("#story", () => {
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

  describe("#index", () => {
    test("it creates an index.js file", () => {
      const result = plugin.index(["Foo", "Bar", "Baz"]);
      expect(result.filename).toEqual("index.js");
      expect(result.data).toContain("export { default as Foo } from './Foo'");
      expect(result.data).toMatchSnapshot();
    });
  });

  describe("#snippets", () => {
    const SupportedFields = Object.values(FieldType).filter(
      (type) => type !== FieldType.Group && type !== FieldType.IntegrationFields
    );

    const suported = SupportedFields.map((field, i) => [
      field,
      `slices[${i}].data`,
    ]);

    test.each(suported)(
      "supported type %s should be truthy",
      (type, fieldText) => {
        const result = plugin.snippets({ type, fieldText });
        expect(result).toBeTruthy();
        expect(result).toMatchSnapshot();
      }
    );

    test.each(suported.map((d) => [...d, true, false]))(
      "snippet %s with useKey",
      (type, fieldText, useKey, isRepeatable) => {
        const result = plugin.snippets({
          type,
          fieldText,
          useKey,
          isRepeatable,
        });
        expect(result).toBeTruthy();
        expect(result).toMatchSnapshot();
      }
    );

    const UnsupprtedFields = Object.values(FieldType).filter(
      (type) => SupportedFields.includes(type) === false
    );

    const unsupported = UnsupprtedFields.map((field, i) => [
      field,
      `slice[${i}].data`,
    ]);

    test.each(unsupported)(
      "unsuported types %s should be falsy",
      (type, fieldText) => {
        expect(plugin.snippets({ type, fieldText })).toBeFalsy();
      }
    );

    test("repeatable slices", () => {
      const result = plugin.snippets({
        type: FieldType.Text,
        fieldText: "slices",
        useKey: false,
        isRepeatable: true,
      });

      expect(result).toEqual(
        '{ slice?.items?.map((item, i) => <span key="slices-${i}">{ slices }</span>) }'
      );
    });
  });
});
