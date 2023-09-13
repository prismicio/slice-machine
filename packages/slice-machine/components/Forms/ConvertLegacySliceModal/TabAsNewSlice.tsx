import { MouseEvent } from "react";
import Select from "react-select";
import { Field, Input, Label } from "theme-ui";

import { Icon, Text } from "@prismicio/editor-ui";
import { pascalize } from "@lib/utils/str";

import * as styles from "./ConvertLegacySliceModal.css";
import { TabProps } from "./types";

export const TabAsNewSlice: React.FC<TabProps> = ({
  setActiveTab,
  slice,
  sliceName,
  formik,
  libraries,
}) => {
  const back = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setActiveTab("index");
  };

  return (
    <div className={styles.layout.large}>
      <header className={styles.layout.small}>
        <a className={styles.backButton} href="#" onClick={back}>
          <Icon name="arrowBack" size="extraSmall" />
          <Text>Back</Text>
        </a>
        <div>
          <Text variant="h4">Create a new slice</Text>
          <Text variant="normal">Convert {sliceName} as a new slice.</Text>
        </div>
      </header>
      {/* Borrowed from `<CreateSliceModal />` */}
      <div className={styles.layout.small}>
        <div>
          <Label
            htmlFor="sliceName"
            sx={{ mb: 2, display: "inline-flex", alignItems: "center", gap: 2 }}
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
              option ? void formik.setFieldValue("from", option.value) : null
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
    </div>
  );
};
