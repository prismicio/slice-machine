import type { SliceMock } from "@slicemachine/core/src/models";
import type { FieldType } from "@slicemachine/core/src/models/CustomType/fields";

// for testing the dummy, not needed else where
export const name = module.filename;

export const framework = "dummy";
/* slice template */
export const slice = (name: string): { filename: string; data: string } => ({
  filename: "index.js",
  data: `
const ${name} = () => "foobar"
export default ${name}
`,
});

/* story template */
export const story = (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  path: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  title: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  mock: SliceMock
): { filename: string; data: string } => ({
  filename: "index.story.js",
  data: "some story",
});

/* how slices are indexed in /slices/index */
export const index = (slices: string[]): { filename: string; data: string } => {
  const imports = slices.map(
    (slice) => `export {default as ${slice}} from "./${slice}"`
  );
  const data = imports.join("\n");
  return {
    filename: "index.js",
    data,
  };
};

export const snippets = (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  widget: FieldType,
  field: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  useKey?: boolean
): string => {
  // some map for the widget
  return `<div>${field}</div>`;
};

// TODO: discuss

/* code snippets, could be hard because currently snippets are created client side it could be a dynamically imported library, but then we need to figure out which plugin has the hints */
// or make hints a totally sperate thing?, or get the markdown from the server
// export const snippets = (widget: string) => widget

/* simulator maybe make this a different file */
// export const simulator = () => null

/* slice-zone, should we add the slice-zones in the  */
// export sliceZone
