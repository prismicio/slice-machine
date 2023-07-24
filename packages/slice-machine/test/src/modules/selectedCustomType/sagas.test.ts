import { describe, it } from "vitest";
import { testSaga } from "redux-saga-test-plan";
import SegmentClient from "analytics-node";

import { saveCustomType } from "@src/apiClient";
import { saveCustomTypeSaga } from "@src/modules/selectedCustomType/sagas";
import { openToasterCreator, ToasterType } from "@src/modules/toaster";
import {
  saveCustomTypeCreator,
  selectCurrentCustomType,
} from "@src/modules/selectedCustomType";
import { CustomTypeSM } from "@lib/models/common/CustomType";

const customTypeModel: CustomTypeSM = {
  id: "about",
  label: "My Cool About Page",
  repeatable: false,
  status: true,
  format: "custom",
  tabs: [
    {
      key: "Main",
      value: [
        {
          key: "title",
          value: {
            type: "StructuredText",
            config: {
              label: "",
              placeholder: "",
              allowTargetBlank: true,
              single:
                "paragraph,preformatted,heading1,heading2,heading3,heading4,heading5,heading6,strong,em,hyperlink,image,embed,list-item,o-list-item,rtl",
            },
          },
        },
      ],
      sliceZone: {
        key: "MainSliceZone",
        value: [],
      },
    },
  ],
};

describe("[Selected Custom type sagas]", () => {
  describe("[saveCustomTypeSaga]", () => {
    it("should call the api and dispatch the good actions on success", async () => {
      const saga = testSaga(saveCustomTypeSaga);

      saga.next().select(selectCurrentCustomType);
      saga.next(customTypeModel).call(saveCustomType, customTypeModel);

      saga
        .next({ errors: [] })
        .put(saveCustomTypeCreator.success({ customType: customTypeModel }));

      saga
        .next()
        .inspect(
          (action: {
            payload: { action: { type: string; payload: { type: string } } };
          }) => {
            expect(action.payload.action.type).toBe("TOASTER/OPEN");
            expect(action.payload.action.payload.type).toBe(
              ToasterType.SUCCESS
            );
          }
        );

      saga.next().isDone();

      // Wait for network request to be performed
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(SegmentClient.prototype.track).toHaveBeenCalledOnce();
    });
    it("should open a error toaster on internal error", () => {
      const saga = testSaga(saveCustomTypeSaga).next();

      saga.throw(new Error()).put(
        openToasterCreator({
          content: "Internal Error: Custom type not saved",
          type: ToasterType.ERROR,
        })
      );
      saga.next().isDone();
    });
  });
});
