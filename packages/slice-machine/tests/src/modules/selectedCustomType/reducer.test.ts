import "@testing-library/jest-dom";
import { CustomTypes } from "@slicemachine/core/build/models/CustomType/index";
import jsonModel from "./__mockData__/model.json";
import { CustomType } from "@prismicio/types-internal/lib/customtypes/CustomType";
import {
  addFieldCreator,
  createSliceZoneCreator,
  createTabCreator,
  selectedCustomTypeReducer,
  deleteFieldCreator,
  initCustomTypeStoreCreator,
  reorderFieldCreator,
  replaceFieldCreator,
  replaceSharedSliceCreator,
  updateTabCreator,
} from "@src/modules/selectedCustomType";
import { SelectedCustomTypeStoreType } from "@src/modules/selectedCustomType/types";
import * as widgets from "@models/common/widgets/withGroup";
import equal from "fast-deep-equal";

const customTypeAsArray = CustomTypes.toSM(jsonModel as unknown as CustomType);

const dummyCustomTypesState: SelectedCustomTypeStoreType = {
  model: customTypeAsArray,
  remoteModel: null,
  mockConfig: {},
  initialMockConfig: {},
};

describe("[Selected Custom type module]", () => {
  describe("[Reducer]", () => {
    it("should return the initial state if no action", () => {
      expect(selectedCustomTypeReducer(dummyCustomTypesState, {})).toEqual(
        dummyCustomTypesState
      );
    });

    it("should return the initial state if no matching action", () => {
      expect(
        selectedCustomTypeReducer(dummyCustomTypesState, { type: "NO.MATCH" })
      ).toEqual(dummyCustomTypesState);
    });

    it("should update the custom type state given CUSTOM_TYPE/INIT action", () => {
      expect(
        selectedCustomTypeReducer(
          dummyCustomTypesState,
          initCustomTypeStoreCreator({
            model: customTypeAsArray,
            remoteModel: null,
            mockConfig: {},
          })
        )
      ).toEqual({
        model: customTypeAsArray,
        remoteModel: null,
        mockConfig: {},
        initialMockConfig: {},
      });
    });
    it("should update the custom type state given CUSTOM_TYPE/CREATE_TAB action", () => {
      const newTabId = "Tab1";
      const previousTabLength = dummyCustomTypesState.model.tabs.length;
      const newState = selectedCustomTypeReducer(
        dummyCustomTypesState,
        createTabCreator({
          tabId: newTabId,
        })
      );
      const tabs = newState.model.tabs;
      expect(tabs.length).toEqual(previousTabLength + 1);
      expect(tabs[tabs.length - 1].key).toBe(newTabId);

      /** Don't create a second tab with same key */
      const newState2 = selectedCustomTypeReducer(
        dummyCustomTypesState,
        createTabCreator({
          tabId: newTabId,
        })
      );
      const tabs2 = newState2.model.tabs;
      expect(tabs2.length).toBe(tabs.length);
    });
    it("should update the custom type state given CUSTOM_TYPE/UPDATE_TAB action if the tab is found", () => {
      const newTabId = "Tab1";
      const initialTab = dummyCustomTypesState.model.tabs[0];
      const newState = selectedCustomTypeReducer(
        dummyCustomTypesState,
        updateTabCreator({
          newTabId,
          tabId: initialTab.key,
        })
      );
      const tabs = newState.model.tabs[0];
      expect(tabs.key).toBe(newTabId);
    });
    it("should not update the custom type state given CUSTOM_TYPE/UPDATE_TAB action if the tab is not found", () => {
      const newTabId = "Tab1";
      const initialTab = dummyCustomTypesState.model.tabs[0];
      const unknownTabId = `some___${initialTab.key}`;
      const newState = selectedCustomTypeReducer(
        dummyCustomTypesState,
        updateTabCreator({
          newTabId,
          tabId: unknownTabId,
        })
      );

      const tabs = newState.model.tabs[0];
      expect(tabs.key).toBe(initialTab.key);

      expect(!!newState.model.tabs.find((e) => e.key === unknownTabId)).toBe(
        false
      );
    });
    it("should add a field into a custom type given CUSTOM_TYPE/ADD_FIELD action", () => {
      const fieldId = "fieldId";
      const initialTab = dummyCustomTypesState.model.tabs[0];
      const newState = selectedCustomTypeReducer(
        dummyCustomTypesState,
        addFieldCreator({
          tabId: initialTab.key,
          fieldId,
          field: widgets.Boolean.create(fieldId),
        })
      );

      const tabValue = newState.model.tabs[0].value;
      expect(tabValue.length).toEqual(initialTab.value.length + 1);
      expect(tabValue[tabValue.length - 1].key).toEqual(fieldId);
    });
    it("should remove a field into a custom type given CUSTOM_TYPE/DELETE_FIELD action", () => {
      const initialTab = dummyCustomTypesState.model.tabs[0];
      const newState = selectedCustomTypeReducer(
        dummyCustomTypesState,
        deleteFieldCreator({
          tabId: initialTab.key,
          fieldId: initialTab.value[0].key,
        })
      );

      expect(newState.model.tabs[0].value.length).toEqual(
        initialTab.value.length - 1
      );
    });
    it("should reorder fields into a custom type given CUSTOM_TYPE/REORDER_FIELD action", () => {
      const initialTab = dummyCustomTypesState.model.tabs[0];
      const fieldIdA = initialTab.value[0].key;
      const fieldIdB = initialTab.value[1].key;
      const fieldIdC = initialTab.value[2].key;
      const newState = selectedCustomTypeReducer(
        dummyCustomTypesState,
        reorderFieldCreator({
          tabId: initialTab.key,
          start: 0,
          end: 1,
        })
      );

      expect(newState.model.tabs[0].value[0].key).toEqual(fieldIdB);
      expect(newState.model.tabs[0].value[1].key).toEqual(fieldIdA);

      const newState2 = selectedCustomTypeReducer(
        newState,
        reorderFieldCreator({
          tabId: initialTab.key,
          start: 0,
          end: 1,
        })
      );

      expect(newState2.model.tabs[0].value[0].key).toEqual(fieldIdA);
      expect(newState2.model.tabs[0].value[1].key).toEqual(fieldIdB);

      const newState3 = selectedCustomTypeReducer(
        newState2,
        reorderFieldCreator({
          tabId: initialTab.key,
          start: 0,
          end: 2,
        })
      );

      expect(newState3.model.tabs[0].value[0].key).toEqual(fieldIdB);
      expect(newState3.model.tabs[0].value[1].key).toEqual(fieldIdC);
      expect(newState3.model.tabs[0].value[2].key).toEqual(fieldIdA);

      const newState4 = selectedCustomTypeReducer(
        newState3,
        reorderFieldCreator({
          tabId: initialTab.key,
          start: 2,
          end: 0,
        })
      );

      expect(newState4.model.tabs[0].value[0].key).toEqual(fieldIdA);
      expect(newState4.model.tabs[0].value[1].key).toEqual(fieldIdB);
      expect(newState4.model.tabs[0].value[2].key).toEqual(fieldIdC);
    });
  });
  it("should create a empty slicezone into a custom type given CUSTOM_TYPE/CREATE_SLICE_ZONE action", () => {
    const initialTab = dummyCustomTypesState.model.tabs[0];
    const newState = selectedCustomTypeReducer(
      dummyCustomTypesState,
      createSliceZoneCreator({
        tabId: initialTab.key,
      })
    );

    const newTabState = newState.model.tabs[0];
    expect(newTabState.sliceZone).not.toEqual(null);
    expect(newTabState.sliceZone.value.length).toEqual(0);
    expect(newTabState.sliceZone.key).toEqual("slices");
  });
  it("should place slices inside a slicezone given CUSTOM_TYPE/REPLACE_SHARED_SLICE action", () => {
    const initialTab = dummyCustomTypesState.model.tabs[0];
    const newState = selectedCustomTypeReducer(
      dummyCustomTypesState,
      createSliceZoneCreator({
        tabId: initialTab.key,
      })
    );

    const keys = ["Slice1", "Slice2", "Slice3", "Slice4"];

    const newState2 = selectedCustomTypeReducer(
      newState,
      replaceSharedSliceCreator({
        tabId: initialTab.key,
        sliceKeys: keys,
        preserve: [],
      })
    );

    expect(newState2.model.tabs[0].sliceZone.value.map((e) => e.key)).toEqual(
      keys
    );
  });
  it("should update the field id into a custom type given CUSTOM_TYPE/REPLACE_FIELD action", () => {
    const initialTab = dummyCustomTypesState.model.tabs[0];
    const field = initialTab.value[0];

    const newState = selectedCustomTypeReducer(
      dummyCustomTypesState,
      replaceFieldCreator({
        tabId: initialTab.key,
        previousFieldId: field.key,
        newFieldId: "newKey",
        value: field.value,
      })
    );

    expect(equal(newState.model.tabs[0].value, initialTab.value)).toEqual(
      false
    );
    expect(equal(newState.model.tabs[0].value[0].value, field.value)).toEqual(
      true
    );
  });
  it("should not update the field into a custom type given CUSTOM_TYPE/REPLACE_FIELD action if the field is the same", () => {
    const initialTab = dummyCustomTypesState.model.tabs[0];
    const field = initialTab.value[0];

    const newState = selectedCustomTypeReducer(
      dummyCustomTypesState,
      replaceFieldCreator({
        tabId: initialTab.key,
        previousFieldId: field.key,
        newFieldId: field.key,
        value: field.value,
      })
    );

    expect(equal(newState.model.tabs[0].value, initialTab.value)).toEqual(true);
  });
  it("should update the field content into a custom type given CUSTOM_TYPE/REPLACE_FIELD action", () => {
    const initialTab = dummyCustomTypesState.model.tabs[0];
    const field = initialTab.value[0];
    const newPlaceholder = `differ-from-${field.value.config.placeholder}`;

    const newState = selectedCustomTypeReducer(
      dummyCustomTypesState,
      replaceFieldCreator({
        tabId: initialTab.key,
        previousFieldId: field.key,
        newFieldId: field.key,
        value: {
          ...field.value,
          config: {
            ...field.value.config,
            placeholder: newPlaceholder,
          },
        },
      })
    );

    expect(newState.model.tabs[0].value[0].value.config.placeholder).toEqual(
      newPlaceholder
    );
  });
});
