import { findSlices } from "../hooks/useGetStaticProps";

const doc = {
  data: {
    body: [1, 2],
    slices: [1, 2, 3],
    SliceZone: [3, 4, 5],
  },
};

test("Should find first SliceZone w/o body key", () => {
  expect(findSlices(doc)).toEqual(doc.data.body);
});

test("Should find SliceZone with body key", () => {
  expect(findSlices(doc, "SliceZone")).toEqual(doc.data.SliceZone);
});

test("Should automatically return body", () => {
  const body = [9];
  expect(findSlices({ data: { body } })).toBe(body);
});

test("Should return empty array if not found", () => {
  expect(findSlices(doc, "AnotherSliceZone")).toEqual([]);
});

test("Should not break if doc is undefined", () => {
  expect(findSlices()).toEqual([]);
});
