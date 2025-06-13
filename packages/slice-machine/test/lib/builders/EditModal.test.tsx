// @vitest-environment jsdom

import React from "react";
import Modal from "react-modal";
import { describe, expect, test, vi } from "vitest";

import EditModal from "@/legacy/lib/builders/common/EditModal";

import { act, fireEvent, render } from "../../__testutils__";
import { SliceMachineStoreType } from "@/redux/type";

vi.mock("next/router", () => require("next-router-mock"));

const preloadedState: Partial<SliceMachineStoreType> = {
  availableCustomTypes: {
    page: {
      local: {
        id: "page",
        label: "Page",
        format: "page",
        repeatable: true,
        status: true,
        tabs: [
          {
            key: "Main",
            value: [
              {
                key: "uid",
                value: {
                  type: "UID",
                  config: {
                    label: "UID",
                    placeholder: "",
                  },
                },
              },
              {
                key: "title",
                value: {
                  type: "StructuredText",
                  config: {
                    label: "Title",
                    placeholder: "",
                    allowTargetBlank: true,
                    single: "heading1",
                  },
                },
              },
            ],
            sliceZone: {
              key: "slices",
              value: [
                {
                  key: "rich_text",
                  value: {
                    type: "SharedSlice",
                  },
                },
              ],
            },
          },
          {
            key: "SEO & Metadata",
            value: [
              {
                key: "meta_title",
                value: {
                  type: "Text",
                  config: {
                    label: "Meta Title",
                    placeholder:
                      "A title of the page used for social media and search engines",
                  },
                },
              },
              {
                key: "meta_description",
                value: {
                  type: "Text",
                  config: {
                    label: "Meta Description",
                    placeholder: "A brief summary of the page",
                  },
                },
              },
              {
                key: "meta_image",
                value: {
                  type: "Image",
                  config: {
                    label: "Meta Image",
                    constraint: {
                      width: 2400,
                      height: 1260,
                    },
                    thumbnails: [],
                  },
                },
              },
            ],
          },
        ],
      },
    },
  },
};

describe("EditModal", () => {
  const div = document.createElement("div");
  Modal.setAppElement(div);
  div.id = "__next";
  document.body.appendChild(div);

  test("remove an item from a select field", async () => {
    const saveFn = vi.fn();
    const closeFn = vi.fn();
    const field = {
      key: "selecta",
      value: {
        type: "Select",
        config: {
          label: "selecta",
          placeholder: "",
          options: ["1", "2", "3"],
        },
      },
    };
    const data = {
      isOpen: true,
      field: [field.key, field.value],
    };

    const fields = [field];

    render(
      <EditModal
        onSave={saveFn}
        close={closeFn}
        data={data}
        fields={fields}
        zoneType="slice"
      />,
      { preloadedState },
    );

    const removeButton = document.querySelector(
      'input[name="config.options.2"]',
    )?.nextSibling;

    // @ts-expect-error TS(2345) FIXME: Argument of type 'ChildNode | null | undefined' is... Remove this comment to see the full error message
    await act(() => fireEvent.click(removeButton));

    const saveButton = document.querySelector('button[type="submit"]');

    // @ts-expect-error TS(2345) FIXME: Argument of type 'Element | null' is not assignabl... Remove this comment to see the full error message
    await act(() => fireEvent.click(saveButton));

    expect(saveFn).toHaveBeenCalled();

    const saveData = saveFn.mock.calls[0][0];
    const options = saveData.value.config.options;
    expect(options).toEqual(["1", "2"]);
  });

  test("it should not overwrite custom properties", async () => {
    const field = {
      key: "rt_box",
      value: {
        type: "StructuredText",
        config: {
          label: "rt box",
          placeholder: "",
          allowTargetBlank: true,
          labels: ["right-align", "center-align"],
          single:
            "paragraph,preformatted,heading1,heading2,heading3,heading4,heading5,heading6,strong,em,hyperlink,image,embed,list-item,o-list-item,rtl",
        },
      },
    };

    const data = {
      isOpen: true,
      field: [field.key, field.value],
    };

    const fields = [field];

    const saveFn = vi.fn();
    const closeFn = vi.fn();

    render(
      <EditModal
        onSave={saveFn}
        close={closeFn}
        data={data}
        fields={fields}
        zoneType="slice"
      />,
      { preloadedState },
    );

    const labelInput = document.querySelector('input[name="config.label"]');
    const fakeLabel = "rich text";
    await act(() =>
      // @ts-expect-error TS(2345) FIXME: Argument of type 'Element | null' is not assignabl... Remove this comment to see the full error message
      fireEvent.change(labelInput, { target: { value: fakeLabel } }),
    );

    const idInput = document.querySelector('input[name="id"]');
    const fakeId = "some_id";
    await act(() =>
      // @ts-expect-error TS(2345) FIXME: Argument of type 'Element | null' is not assignabl... Remove this comment to see the full error message
      fireEvent.change(idInput, { target: { value: fakeId } }),
    );

    const saveButton = document.querySelector('button[type="submit"]');
    // @ts-expect-error TS(2345) FIXME: Argument of type 'Element | null' is not assignabl... Remove this comment to see the full error message
    await act(() => fireEvent.click(saveButton));

    expect(saveFn).toHaveBeenCalled();
    const saveData = saveFn.mock.calls[0][0];
    expect(saveData.value.config.labels).toEqual([
      "right-align",
      "center-align",
    ]);
  });
});
