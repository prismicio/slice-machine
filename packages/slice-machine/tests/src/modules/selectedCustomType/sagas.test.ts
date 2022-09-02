import { testSaga } from "redux-saga-test-plan";
import "@testing-library/jest-dom";

import { pushCustomType, saveCustomType } from "@src/apiClient";
import {
  pushCustomTypeSaga,
  saveCustomTypeSaga,
} from "@src/modules/selectedCustomType/sagas";
import { openToasterCreator, ToasterType } from "@src/modules/toaster";
import {
  pushCustomTypeCreator,
  saveCustomTypeCreator,
  selectCurrentCustomType,
  selectCurrentMockConfig,
} from "@src/modules/selectedCustomType";
import {
  CustomTypeSM,
  CustomTypes,
} from "@slicemachine/core/build/models/CustomType";
import { WidgetTypes } from "@prismicio/types-internal/lib/customtypes/widgets";

import { setupServer } from "msw/node";
import { rest, RestContext } from "msw";

const server = setupServer();
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const makeTrackerSpy = () =>
  jest.fn((_req: any, res: any, ctx: RestContext) => {
    return res(ctx.json({}));
  });

const interceptTracker = (spy: ReturnType<typeof makeTrackerSpy>) =>
  server.use(rest.post("/api/s", spy));

const customTypeModel: CustomTypeSM = {
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
            type: WidgetTypes.RichText,
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
    it("should call the api and dispatch the good actions on success", () => {
      const fakeTracker = makeTrackerSpy();
      interceptTracker(fakeTracker); // warnings happen without this
      const saga = testSaga(saveCustomTypeSaga);

      saga.next().select(selectCurrentCustomType);
      saga.next(customTypeModel).select(selectCurrentMockConfig);
      saga.next({}).call(saveCustomType, customTypeModel, {});

      saga
        .next()
        .put(saveCustomTypeCreator.success({ customType: customTypeModel }));
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
      const fakeTracker = makeTrackerSpy();
      interceptTracker(fakeTracker); // warnings happen without this

      const saga = testSaga(pushCustomTypeSaga);

      saga.next().select(selectCurrentCustomType);
      saga.next(customTypeModel).call(pushCustomType, customTypeModel.id);

      saga
        .next()
        .put(
          pushCustomTypeCreator.success({ customTypeId: customTypeModel.id })
        );
      saga.next().put(
        openToasterCreator({
          message: "Model was correctly saved to Prismic!",
          type: ToasterType.SUCCESS,
        })
      );
      saga.next().isDone();

      // expect(fakeTracker).toHaveBeenCalled()
      // expect(fakeTracker.mock.calls[0][0].body).toEqual({})
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
