/**
 * @jest-environment jsdom
 */

import { renderHook, act } from "@testing-library/react-hooks";

import equal from "fast-deep-equal";

import { useModelReducer } from "@src/models/customType/modelReducer";
import { CustomType } from "@lib/models/common/CustomType";

import * as widgets from "@lib/models/common/widgets/withGroup";

import jsonModel from "./__mockData__/model.json";

const model = CustomType.fromJsonModel(jsonModel.id, jsonModel);

const init = (initialData) => {
  const data = initialData || {
    customType: model,
    remoteCustomType: model,
    initialMockConfig: {},
  };
  const { result } = renderHook(() => useModelReducer(data));
  const initialTab = result.current[0].current.tabs[0];
  return { result, initialTab };
};

test("it creates a tab", () => {
  const { result } = init();
  const previousTabLen = result.current[0].current.tabs.length;

  const newTabName = "Tab1";
  act(() => {
    result.current[1].createTab(newTabName);
  });
  const tabs = result.current[0].current.tabs;
  expect(tabs.length).toBe(previousTabLen + 1);
  expect(tabs[tabs.length - 1].key).toBe(newTabName);

  /** Don't create a second tab with same key */
  act(() => {
    result.current[1].createTab(newTabName);
  });
  expect(result.current[0].current.tabs.length).toBe(previousTabLen + 1);
});

test("it renames a tab", () => {
  const { result } = init();
  const store = result.current[1];
  const Tab = result.current[0].current.tabs[0];
  const newTabKey = "Tab1";
  act(() => {
    store.tab(Tab.key).update(newTabKey);
  });
  const NewTab = result.current[0].current.tabs[0];

  expect(NewTab.key).toBe(newTabKey);

  const unattr = `some___${newTabKey}`;
  act(() => {
    store.tab(`undef___${Tab.key}`).update(unattr);
  });

  expect(!!result.current[0].current.tabs.find((e) => e.key === unattr)).toBe(
    false
  );
});

test("it resets custom type", () => {
  const { result } = init();

  const newTabName = "Tab1";
  act(() => {
    result.current[1].createTab(newTabName);
  });

  expect(result.current[0].current.tabs.length).not.toEqual(
    result.current[0].initialCustomType.tabs.length
  );

  act(() => {
    result.current[1].reset();
  });

  expect(result.current[0].current.tabs.length).toEqual(
    result.current[0].initialCustomType.tabs.length
  );
});

test("it adds widget", () => {
  const { result, initialTab } = init();

  const { key, value } = initialTab;
  const widgetId = "myWidget";
  act(() => {
    result.current[1]
      .tab(key)
      .addWidget(widgetId, widgets.Boolean.create(widgetId));
  });

  const newValue = result.current[0].current.tabs[0].value;
  expect(newValue.length).toEqual(value.length + 1);
  expect(newValue[newValue.length - 1].key).toEqual(widgetId);
});

test("it adds widget", () => {
  const { result, initialTab } = init();

  const { key, value } = initialTab;
  const widgetId = "myWidget";
  act(() => {
    result.current[1]
      .tab(key)
      .addWidget(widgetId, widgets.Boolean.create(widgetId));
  });

  const newValue = result.current[0].current.tabs[0].value;
  expect(newValue.length).toEqual(value.length + 1);
  expect(newValue[newValue.length - 1].key).toEqual(widgetId);
});

test("it removes widget", () => {
  const { result, initialTab } = init();

  const { key } = initialTab;
  const widget = initialTab.value[0];

  act(() => {
    result.current[1].tab(key).removeWidget(widget.key);
  });

  expect(result.current[0].current.tabs[0].value.length).toEqual(
    initialTab.value.length - 1
  );
});

test("it replaces widget", () => {
  const { result, initialTab } = init();

  const { key } = initialTab;
  const widget = initialTab.value[0];

  const initialStoreTab = result.current[0].current.tabs[0];

  act(() => {
    result.current[1]
      .tab(key)
      .replaceWidget(widget.key, "newKey", widget.value);
  });

  expect(
    equal(result.current[0].current.tabs[0].value, initialTab.value)
  ).toEqual(false);
  expect(
    equal(
      result.current[0].current.tabs[0].value[0].value,
      initialTab.value[0].value
    )
  ).toEqual(true);

  act(() => {
    result.current[1]
      .tab(key)
      .replaceWidget(
        result.current[0].current.tabs[0].value[0].key,
        initialTab.value[0].key,
        initialTab.value[0].value
      );
  });

  expect(equal(initialStoreTab.value, initialTab.value)).toEqual(true);

  const newPlaceholder = `differ-from-${widget.value.config.placeholder}`;
  act(() => {
    result.current[1]
      .tab(key)
      .replaceWidget(
        result.current[0].current.tabs[0].value[0].key,
        result.current[0].current.tabs[0].value[0].key,
        {
          ...widget.value,
          config: {
            ...widget.value.config,
            placeholder: newPlaceholder,
          },
        }
      );
  });

  expect(
    result.current[0].current.tabs[0].value[0].value.config.placeholder
  ).toEqual(newPlaceholder);
});

test("it reorders widgets", () => {
  const { result, initialTab } = init();

  const { key, value } = initialTab;
  const widgetA = initialTab.value[0];
  const widgetB = initialTab.value[1];
  const widgetC = initialTab.value[2];

  act(() => {
    result.current[1].tab(key).reorderWidget(0, 1);
  });

  expect(result.current[0].current.tabs[0].value[0].key).toEqual(widgetB.key);
  expect(result.current[0].current.tabs[0].value[1].key).toEqual(widgetA.key);

  act(() => {
    result.current[1].tab(key).reorderWidget(0, 1);
  });

  expect(result.current[0].current.tabs[0].value[0].key).toEqual(widgetA.key);
  expect(result.current[0].current.tabs[0].value[1].key).toEqual(widgetB.key);

  act(() => {
    result.current[1].tab(key).reorderWidget(0, 2);
  });

  expect(result.current[0].current.tabs[0].value[0].key).toEqual(widgetB.key);
  expect(result.current[0].current.tabs[0].value[1].key).toEqual(widgetC.key);
  expect(result.current[0].current.tabs[0].value[2].key).toEqual(widgetA.key);

  act(() => {
    result.current[1].tab(key).reorderWidget(2, 0);
  });

  expect(result.current[0].current.tabs[0].value[0].key).toEqual(widgetA.key);
  expect(result.current[0].current.tabs[0].value[1].key).toEqual(widgetB.key);
  expect(result.current[0].current.tabs[0].value[2].key).toEqual(widgetC.key);
});

test("it removes sliceZone", () => {
  const { result, initialTab } = init();

  const { key } = initialTab;

  expect(result.current[0].current.tabs[0].sliceZone).not.toEqual(null);

  act(() => {
    result.current[1].tab(key).deleteSliceZone();
  });

  expect(result.current[0].current.tabs[0].sliceZone).toEqual(null);
});

test("it creates sliceZone", () => {
  const { result, initialTab } = init();
  const { key } = initialTab;
  act(() => {
    result.current[1].tab(key).deleteSliceZone();
  });
  act(() => {
    result.current[1].tab(key).createSliceZone();
  });

  expect(result.current[0].current.tabs[0].sliceZone).not.toEqual(null);
  expect(result.current[0].current.tabs[0].sliceZone.value.length).toEqual(0);
  expect(result.current[0].current.tabs[0].sliceZone.key).toEqual("slices");
});

test("it adds and removes slices to/from sliceZone", () => {
  const { result, initialTab } = init();
  const { key } = initialTab;
  act(() => {
    result.current[1].tab(key).deleteSliceZone();
  });
  act(() => {
    result.current[1].tab(key).createSliceZone();
  });

  act(() => {
    result.current[1].tab(key).addSharedSlice("MySlice");
  });

  expect(result.current[0].current.tabs[0].sliceZone.value.length).toEqual(1);
  expect(
    result.current[0].current.tabs[0].sliceZone.value[0].value.type
  ).toEqual("SharedSlice");

  // Slice exists already
  act(() => {
    result.current[1].tab(key).addSharedSlice("MySlice");
  });
  expect(result.current[0].current.tabs[0].sliceZone.value.length).toEqual(1);

  act(() => {
    result.current[1].tab(key).addSharedSlice("MySlice2");
  });
  expect(result.current[0].current.tabs[0].sliceZone.value.length).toEqual(2);

  // Slice does not exist
  act(() => {
    result.current[1].tab(key).removeSharedSlice("MyUndefSlice");
  });
  expect(result.current[0].current.tabs[0].sliceZone.value.length).toEqual(2);

  act(() => {
    result.current[1].tab(key).removeSharedSlice("MySlice");
  });
  expect(result.current[0].current.tabs[0].sliceZone.value.length).toEqual(1);

  const keys = ["Slice1", "Slice2", "Slice3", "Slice4"];
  act(() => {
    result.current[1].tab(key).replaceSharedSlices(keys);
  });
  expect(
    result.current[0].current.tabs[0].sliceZone.value.map((e) => e.key)
  ).toEqual(keys);
});
