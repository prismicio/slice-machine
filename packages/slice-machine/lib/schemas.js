import * as yup from "yup";

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
export const slice = yup
  .object()
  .shape({
    extension: yup.string().required(),
    fileName: yup.string().required(),
    from: yup.string().required(),
    hasMock: yup.boolean().required(),
    hasModel: yup.boolean().required(),
    isDirectory: yup.boolean().required(),
    migrated: yup.boolean().required(),
    mock: yup.object().shape({}),
    // slice_type: yup.string().required(),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    model: yup
      .object()
      .shape({
        variations: yup.array().required(),
      })
      .required(),
    pathToSlice: yup.string().required(),
    hasPreview: yup.boolean().required(),
    previewUrl: yup.string(),
    sliceName: yup.string().required(),
  })
  .required();

/** This is not running at the moment */
export const libraries = yup
  .array()
  .min(1)
  .of(
    yup.array().test({
      name: "example text",
      message: "${path} is not right",
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      test: function (value) {
        return true;
      },
    })
  );
