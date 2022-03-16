import { testSaga } from "redux-saga-test-plan";
import "@testing-library/jest-dom";

import { pushCustomType, saveCustomType } from "@src/apiClient";
import {
  pushCustomTypeSaga,
  saveCustomTypeSaga,
} from "@src/modules/customType/sagas";
import { openToasterCreator, ToasterType } from "@src/modules/toaster";
import {
  pushCustomTypeCreator,
  saveCustomTypeCreator,
  selectCurrentCustomType,
  selectCurrentMockConfig,
} from "@src/modules/customType";
import { ArrayTabs, CustomType } from "@models/common/CustomType";

const customTypeModel: CustomType<ArrayTabs> = {
  id: "about",
  label: "My Cool About Page",
  repeatable: false,
  status: true,
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

describe("[Custom type sagas]", () => {
  describe("[saveCustomTypeSaga]", () => {
    it("should call the api and dispatch the good actions on success", () => {
      const saga = testSaga(saveCustomTypeSaga);

      saga.next().select(selectCurrentCustomType);
      saga.next(customTypeModel).select(selectCurrentMockConfig);
      saga
        .next({})
        .call(saveCustomType, CustomType.toObject(customTypeModel), {});

      saga.next().put(saveCustomTypeCreator.success());
      saga.next().put(
        openToasterCreator({
          message: "Model & mocks have been generated successfully!",
          type: ToasterType.SUCCESS,
        })
      );
      saga.next().isDone();
    });
    it("should open a error toaster on internal error", () => {
      const saga = testSaga(saveCustomTypeSaga).next();

      saga.throw(new Error()).put(
        openToasterCreator({
          message: "Internal Error: Custom type not saved",
          type: ToasterType.ERROR,
        })
      );
      saga.next().isDone();
    });
  });
  describe("[pushCustomTypeSaga]", () => {
    it("should call the api and dispatch the good actions on success", () => {
      const saga = testSaga(pushCustomTypeSaga);

      saga.next().select(selectCurrentCustomType);
      saga.next(customTypeModel).call(pushCustomType, customTypeModel.id);

      saga.next().put(pushCustomTypeCreator.success());
      saga.next().put(
        openToasterCreator({
          message: "Model was correctly saved to Prismic!",
          type: ToasterType.SUCCESS,
        })
      );
      saga.next().isDone();
    });
    it("should open a error toaster on internal error", () => {
      const saga = testSaga(saveCustomTypeSaga).next();

      saga.throw(new Error()).put(
        openToasterCreator({
          message: "Internal Error: Custom type not saved",
          type: ToasterType.ERROR,
        })
      );
      saga.next().isDone();
    });
  });
});
