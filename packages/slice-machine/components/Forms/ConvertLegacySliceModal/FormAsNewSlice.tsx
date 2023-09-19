import { useSelector } from "react-redux";
import { Field, Input, Label } from "theme-ui";
import { Text } from "@prismicio/editor-ui";
import Select from "react-select";

import { SliceMachineStoreType } from "@src/redux/type";
import { getRemoteSlices } from "@src/modules/slices";
import ModalFormCard from "@components/ModalFormCard";
import { pascalize } from "@lib/utils/str";

import { validateSliceModalValues as validateAsNewSliceValues } from "../formsValidator";
import * as styles from "./ConvertLegacySliceModal.css";
import { FormProps } from "./types";

export const FormAsNewSlice: React.FC<FormProps> = ({
  isOpen,
  close,
  onSubmit,
  isLoading,
  slice,
  libraries,
}) => {
  const { remoteSlices } = useSelector((store: SliceMachineStoreType) => ({
    remoteSlices: getRemoteSlices(store),
  }));

  return (
    <ModalFormCard
      dataCy="convert-legacy-slice-modal-as-new-slice"
      isOpen={isOpen}
      widthInPx="530px"
      formId="convert-legacy-slice-modal-as-new-slice"
      buttonLabel={"Convert"}
      close={close}
      onSubmit={(values) => {
        onSubmit({ libraryID: values.from, sliceID: values.sliceName });
      }}
      isLoading={isLoading}
      initialValues={{
        sliceName: pascalize(slice.key),
        from: libraries[0]?.name,
      }}
      validate={(values) => {
        return validateAsNewSliceValues(values, libraries, remoteSlices);
      }}
      content={{
        title: `Convert to new slice`,
      }}
    >
      {(formik) => {
        return (
          <div className={styles.layout.small}>
            <div>
              <Label
                htmlFor="sliceName"
                sx={{
                  mb: 2,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                Slice Name
                {typeof formik.errors.sliceName === "string" ? (
                  <Text variant="small" color="tomato10">
                    {formik.errors.sliceName}
                  </Text>
                ) : null}
              </Label>
              <Field
                autoComplete="off"
                id="sliceName"
                name="sliceName"
                type="text"
                placeholder={`Pascalised Slice API ID (e.g. ${pascalize(
                  slice.key
                )})`}
                as={Input}
                maxLength={30}
                value={formik.values.sliceName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  void formik.setFieldValue("sliceName", e.currentTarget.value)
                }
                data-cy="slice-name-input"
              />
            </div>
            <div>
              <Label htmlFor="slice" sx={{ mb: 2 }}>
                Target Library
              </Label>
              <Select
                name="slice"
                options={libraries.map((v) => ({
                  value: v.name,
                  label: v.name,
                }))}
                onChange={(option) =>
                  option
                    ? void formik.setFieldValue("from", option.value)
                    : null
                }
                defaultValue={{
                  value: formik.values.from,
                  label: formik.values.from,
                }}
                styles={{
                  option: (provided) => ({
                    ...provided,
                    // Color of item text (Dark/Shade-01)
                    color: "#161618",
                  }),
                }}
                theme={(theme) => {
                  return {
                    ...theme,
                    colors: {
                      ...theme.colors,
                      // Background of selected item (Gray/Shade-05)
                      primary: "#E9E8EA",
                    },
                  };
                }}
                menuPortalTarget={document.body}
              />
            </div>
          </div>
        );
      }}
    </ModalFormCard>
  );
};
