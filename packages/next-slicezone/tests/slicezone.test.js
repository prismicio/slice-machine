/**
 * @jest-environment jsdom
 */

import React from 'react'
import '@testing-library/jest-dom/extend-expect'
import { render, screen } from '@testing-library/react'


import SliceZone from '../src'

const Slice = ({ slice }) => (
  <h2>
    { slice.slice_type}
  </h2>
)

const SliceWithProps = ({ customProp }) => (
  <h2>
    { customProp }
  </h2>
)

test('loads and displays page info', async () => {
  render(<SliceZone slices={[]} />)
  expect(screen.getByRole('heading')).toHaveTextContent('Your SliceZone is empty.')
})

test('missing prop in slice triggers message', async () => {
  render(<SliceZone slices={[{}]} />)
  expect(screen.getByRole('heading')).toHaveTextContent('Property "slice" not found or not formatted properly')
})

test('renders example slice', async () => {
  render(<SliceZone slices={[{ slice_type: 'MySlice' }]} resolver={() => Slice }/>)
  expect(screen.getByRole('heading')).toHaveTextContent('MySlice')
})

test('renders slice props', async () => {
  render(<SliceZone slices={[{ slice_type: 'MySlice' }]} sliceProps={{customProp: 'My custom prop'}} resolver={() => SliceWithProps }/>)
  expect(screen.getByRole('heading')).toHaveTextContent('My custom prop')
})

test('renders slice props (as function)', async () => {
  render(<SliceZone slices={[{ slice_type: 'MySlice' }]} sliceProps={() => ({customProp: 'My custom prop'})} resolver={() => SliceWithProps }/>)
  expect(screen.getByRole('heading')).toHaveTextContent('My custom prop')
})
