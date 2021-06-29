import { renderHook, act } from '@testing-library/react-hooks'

import { useModelReducer } from '../../src/models/customType/modelReducer'
import { CustomTypeStatus } from '../../lib/models/ui/CustomTypeState'

import jsonModel from './__mockData__/model.json'

const model = { ...jsonModel, tabs: jsonModel.json }

test('it renders model reducer', () => {
  const { result } = renderHook(() => useModelReducer({
    customType: model,
    remoteCustomType: null,
    initialMockConfig: {}
  }))

  const [state] = result.current
  const { current } = state
  expect(current.id).toBe(model.id)
  expect(current.label).toBe(model.label)
  expect(current.status).toBe(model.status)
  expect(current.repeatable).toBe(model.repeatable)
})

test('it sets correct status 1/4', () => {
  const { result } = renderHook(() => useModelReducer({
    customType: model,
    remoteCustomType: null,
    initialMockConfig: {}
  }))

  const [state] = result.current
  expect(state.__status).toBe(CustomTypeStatus.New)
})

test('it sets correct status 2/4', () => {
  const { result } = renderHook(() => useModelReducer({
    customType: model,
    remoteCustomType: model,
    initialMockConfig: {}
  }))

  const [state] = result.current
  expect(state.__status).toBe(CustomTypeStatus.Synced)
})

test('it sets correct status 3/4', () => {
  const { result } = renderHook(() => useModelReducer({
    customType: model,
    remoteCustomType: { ...model, label: `differ-from-${model.label}` },
    initialMockConfig: {}
  }))

  const [state] = result.current
  expect(state.__status).toBe(CustomTypeStatus.Modified)
})

test('it sets correct status 4/4', () => {
  const { result } = renderHook(() => useModelReducer({
    customType: model,
    remoteCustomType: { ...model, tabs: {} },
    initialMockConfig: {}
  }))

  const [state] = result.current
  expect(state.__status).toBe(CustomTypeStatus.Modified)
})
