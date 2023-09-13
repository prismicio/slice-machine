import { MouseEvent, useState } from "react";
import Select from "react-select";
import { Field, Input, Label } from "theme-ui";

import { Icon, Text } from "@prismicio/editor-ui";
import { Variation } from "@models/common/Variation";

import * as styles from "./ConvertLegacySliceModal.css";
import { TabProps } from "./types";

export const TabAsNewVariation: React.FC<TabProps> = ({
  setActiveTab,
  slice,
  sliceName,
  formik,
  localSharedSlices,
}) => {
  const back = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setActiveTab("index");
  };

  const [inferIDFromName, setInferIDFromName] = useState(true);

  return (
    <div className={styles.layout.large}>
      <header className={styles.layout.small}>
        <a className={styles.backButton} href="#" onClick={back}>
          <Icon name="arrowBack" size="extraSmall" />
          <Text>Back</Text>
        </a>
        <div>
          <Text variant="h4">Create a new variation</Text>
          <Text variant="normal">
            Convert {sliceName} as a new variation of an existing slice.
          </Text>
        </div>
      </header>
      <div className={styles.layout.small}>
        <div>
          <Label htmlFor="asNewVariation_slice" sx={{ mb: 2 }}>
            Target Slice
          </Label>
          <Select
            name="asNewVariation_slice"
            options={localSharedSlices.map((slice) => ({
              value: `${slice.from}::${slice.model.id}`,
              label: `${slice.from} > ${slice.model.name} (${slice.model.id})`,
            }))}
            onChange={(option) => {
              if (option) {
                const [libraryID, sliceID] = option.value.split("::");
                void formik.setFieldValue(
                  "asNewVariation_libraryID",
                  libraryID
                );
                void formik.setFieldValue("asNewVariation_sliceID", sliceID);
              }
            }}
            defaultValue={{
              value: `${formik.values.asNewVariation_libraryID}::${formik.values.asNewVariation_sliceID}`,
              label: `${formik.values.asNewVariation_libraryID} > ${localSharedSlices[0]?.model.name} (${formik.values.asNewVariation_sliceID})`,
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
        <div>
          <Label
            htmlFor="variationName"
            sx={{ mb: 2, display: "inline-flex", alignItems: "center", gap: 2 }}
          >
            Variation Name
            {typeof formik.errors.asNewVariation_variationName === "string" ? (
              <Text variant="small" color="tomato10">
                {formik.errors.asNewVariation_variationName}
              </Text>
            ) : null}
          </Label>
          <Field
            autoComplete="off"
            id="variationName"
            name="variationName"
            type="text"
            placeholder={sliceName}
            as={Input}
            maxLength={30}
            value={formik.values.asNewVariation_variationName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              void formik.setFieldValue(
                "asNewVariation_variationName",
                e.currentTarget.value
              );
              if (inferIDFromName) {
                void formik.setFieldValue(
                  "asNewVariation_variationID",
                  Variation.generateId(e.currentTarget.value)
                );
              }
            }}
            data-cy="slice-name-input"
          />
        </div>
        <div>
          <Label
            htmlFor="variationID"
            sx={{ mb: 2, display: "inline-flex", alignItems: "center", gap: 2 }}
          >
            Variation ID
            {typeof formik.errors.asNewVariation_variationID === "string" ? (
              <Text variant="small" color="tomato10">
                {formik.errors.asNewVariation_variationID}
              </Text>
            ) : null}
          </Label>
          <Field
            autoComplete="off"
            id="variationID"
            name="variationID"
            type="text"
            placeholder={Variation.generateId(slice.key)}
            as={Input}
            maxLength={30}
            value={formik.values.asNewVariation_variationID}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setInferIDFromName(false);
              void formik.setFieldValue(
                "asNewVariation_variationID",
                Variation.generateId(e.currentTarget.value)
              );
            }}
            data-cy="slice-name-input"
          />
        </div>
      </div>
    </div>
  );
};
