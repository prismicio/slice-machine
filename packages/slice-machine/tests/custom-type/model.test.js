import equal from 'fast-deep-equal'

import { CustomType, ObjectTabs } from '../../lib/models/common/CustomType'

import jsonModel from './__mockData__/model.json'
import jsonModelWithUid from './__mockData__/modeUid.json'

test('it formats models correctly', () => {
  const model = CustomType.fromJsonModel(jsonModel.id, jsonModel)
  
  const asArray = CustomType.toArray(model)
  const fromArray = CustomType.toObject(asArray)
  const finalModel = CustomType.toJsonModel(fromArray)

  expect(equal(model, fromArray)).toBe(true)
  expect(equal(jsonModel, finalModel)).toBe(true)
})


// UID EXTRACTION
test('it extract the Uid correctly before saving', () => {
  const model = CustomType.fromJsonModel(jsonModelWithUid.id, jsonModelWithUid)

  expect(model.uid).not.toBe(null);
})


// UID IN FIRST TAB
test('it add Back the Uid in the first tab before saving', () => {
  const model = CustomType.fromJsonModel(jsonModelWithUid.id, jsonModelWithUid)
  const asArray = CustomType.toArray(model)
  const fromArray = CustomType.toObject(asArray)
  const finalModel = CustomType.toJsonModel(fromArray)
  const uid = Object.values(finalModel.json.Main).find(f => f.type === "UID")

  expect(uid).not.toBe(undefined);
})

test('it add Back the Uid in the first tab before pushing', () => {
  const model = CustomType.fromJsonModel(jsonModelWithUid.id, jsonModelWithUid)
  const asArray = CustomType.toArray(model)
  const fromArray = CustomType.toObject(asArray)
  const uid = Object.values(fromArray.tabs['Main'].value).find(f => f.type === "UID")

  expect(uid).not.toBe(undefined);
})


// UID API ID CORRECTION
test('it corrects the UID api ID before saving', () => {
  expect(jsonModelWithUid.json.Main['test-UID-fake-id']).not.toBe(undefined);

  const model = CustomType.fromJsonModel(jsonModelWithUid.id, jsonModelWithUid)
  const asArray = CustomType.toArray(model)
  const fromArray = CustomType.toObject(asArray)
  const finalModel = CustomType.toJsonModel(fromArray)

  expect(finalModel.json.Main['uid']).not.toBe(undefined);
})

test('it corrects the UID api ID before pushing', () => {
  expect(jsonModelWithUid.json.Main['test-UID-fake-id']).not.toBe(undefined);

  const model = CustomType.fromJsonModel(jsonModelWithUid.id, jsonModelWithUid)
  const asArray = CustomType.toArray(model)
  const fromArray = CustomType.toObject(asArray)

  expect(fromArray.tabs.Main.value['uid']).not.toBe(undefined);
})


// UID AS FIRST FIELD
test('it puts the UID fields as first field before saving', () => {
  expect(jsonModelWithUid.json.Main['test-UID-fake-id']).not.toBe(undefined);

  const model = CustomType.fromJsonModel(jsonModelWithUid.id, jsonModelWithUid)
  const asArray = CustomType.toArray(model)
  const fromArray = CustomType.toObject(asArray)
  const finalModel = CustomType.toJsonModel(fromArray)
  const firstFieldName = Object.keys(finalModel.json.Main)[0]
  const potentialUid = fromArray.tabs.Main.value[firstFieldName]

  expect(potentialUid.type).toBe('UID');
})

test('it puts the UID fields as first field before pushing', () => {
  expect(jsonModelWithUid.json.Main['test-UID-fake-id']).not.toBe(undefined);

  const model = CustomType.fromJsonModel(jsonModelWithUid.id, jsonModelWithUid)
  const asArray = CustomType.toArray(model)
  const fromArray = CustomType.toObject(asArray)
  const firstFieldName = Object.keys(fromArray.tabs.Main.value)[0]
  const potentialUid = fromArray.tabs.Main.value[firstFieldName]

  expect(potentialUid.type).toBe('UID');
})
