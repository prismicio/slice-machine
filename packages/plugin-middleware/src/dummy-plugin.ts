import type { SliceMock } from "@slicemachine/core/src/models";

// for testing the dummy, not needed else where
export const name = module.filename;

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
  path: string,
  title: string,
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

// TODO: discuss

/* code snippets, could be hard because currently snippets are created client side */
// export const snippets = (widget: string) => widget

/* simulator maybe make this a different file */
// export const simulator = () => null

/* slice-zone, should we add the slice-zones in the  */
// export sliceZone
