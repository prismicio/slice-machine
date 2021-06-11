import { findSlices } from '../hooks/useGetStaticProps'

const data = {
  body: 1,
  slices: 2,
  SliceZone: 3
}

test('Should find first SliceZone w/o body key', () => {
  expect(findSlices(data)).toBe(1)
});

test('Should find SliceZone with body key', () => {
  console.log({
    res: findSlices(data, 'SliceZone')
  })
  expect(findSlices(data, 'SliceZone')).toBe(3)
});

test('Should automatically return body', () => {
  expect(findSlices({ body: 4 })).toBe(4)
});

test('Should return empty array if not found', () => {
  expect(findSlices({ body: 4 }, 'AnotherSliceZone')).toEqual([])
});

test('Should not break if data is undefined', () => {
  expect(findSlices()).toEqual([])
});