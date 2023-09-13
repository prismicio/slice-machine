import { useMemo } from "react";
import clsx from "clsx";

import { Icon, Separator, Text } from "@prismicio/editor-ui";
import { CompositeSlice } from "@prismicio/types-internal/lib/customtypes";
import { VariationSM } from "@models/common/Slice";

import * as styles from "./ConvertLegacySliceModal.css";
import { TabProps } from "./types";

const getFieldMappingFingerprint = (
  slice: CompositeSlice | VariationSM
): {
  primary: string;
  items: string;
} => {
  const primary: Record<string, string> = {};
  const items: Record<string, string> = {};

  if ("type" in slice && slice.type === "Slice") {
    for (const key in slice["non-repeat"]) {
      primary[key] = slice["non-repeat"][key].type;
    }
    for (const key in slice.repeat) {
      items[key] = slice.repeat[key].type;
    }
  } else if ("id" in slice) {
    for (const { key, value } of slice.primary ?? []) {
      primary[key] = value.type;
    }
    for (const { key, value } of slice.items ?? []) {
      items[key] = value.type;
    }
  }

  return {
    primary: JSON.stringify(
      Object.keys(primary)
        .sort()
        .map((key) => [key, primary[key]])
    ),
    items: JSON.stringify(
      Object.keys(items)
        .sort()
        .map((key) => [key, items[key]])
    ),
  };
};

export const TabIndex: React.FC<TabProps> = ({
  slice,
  sliceName,
  setActiveTab,
  localSharedSlices,
  formik,
}) => {
  type IdenticalSlice = {
    libraryID: string;
    sliceID: string;
    variationID: string;
    path: string;
  };
  const identicalSlices = useMemo<IdenticalSlice[]>(() => {
    const results: IdenticalSlice[] = [];

    if (slice.value.type !== "Slice") {
      return results;
    }

    const sliceFields = getFieldMappingFingerprint(slice.value);

    for (const sharedSlice of localSharedSlices) {
      for (const variation of sharedSlice.model.variations) {
        const variationFields = getFieldMappingFingerprint(variation);

        if (
          sliceFields.primary === variationFields.primary &&
          sliceFields.items === variationFields.items
        ) {
          results.push({
            libraryID: sharedSlice.from,
            sliceID: sharedSlice.model.id,
            variationID: variation.id,
            path: `${sharedSlice.from}::${sharedSlice.model.id}::${variation.id}`,
          });
        }
      }
    }

    return results;
  }, [slice, localSharedSlices]);

  return (
    <div className={styles.layout.large}>
      <div className={styles.layout.small}>
        <div
          className={styles.card}
          onClick={() => setActiveTab("as_new_slice")}
        >
          <header>
            <Text variant="h4">Create a new slice</Text>
            <Text variant="normal">Convert {sliceName} as a new slice.</Text>
          </header>
          <Icon name="arrowForward" size="medium" />
        </div>
        <div
          className={clsx(styles.card, {
            [styles.cardDisable]: localSharedSlices.length === 0,
          })}
          onClick={() =>
            localSharedSlices.length > 0 && setActiveTab("as_new_variation")
          }
        >
          <header>
            <Text variant="h4">Create a new variation</Text>
            <Text variant="normal">
              Convert {sliceName} as a new variation of an existing slice.
            </Text>
          </header>
          <Icon name="arrowForward" size="medium" />
        </div>
      </div>
      <Separator decorative={true} />
      <div className={styles.layout.small}>
        <header className={styles.padInline}>
          <Text variant="h4">Merge with identical</Text>
          <Text variant="normal">
            Convert {sliceName} by merging it with an identical slice variation.
          </Text>
        </header>
        <div className={styles.layout.small}>
          {identicalSlices.length ? (
            identicalSlices.map((identicalSlice) => (
              <div
                className={clsx(styles.card, {
                  [styles.cardSelected]:
                    formik.values.mergeWithIdentical_path ===
                    identicalSlice.path,
                })}
                onClick={() =>
                  void formik.setFieldValue(
                    "mergeWithIdentical_path",
                    identicalSlice.path
                  )
                }
              >
                <Text
                  variant="normal"
                  color={
                    formik.values.mergeWithIdentical_path ===
                    identicalSlice.path
                      ? "grey1"
                      : "grey12"
                  }
                >
                  {identicalSlice.libraryID} {">"} {identicalSlice.sliceID}{" "}
                  {">"} {identicalSlice.variationID}
                </Text>
              </div>
            ))
          ) : (
            <Text variant="normal" className={styles.padInline}>
              No idential slices found.
            </Text>
          )}
        </div>
      </div>
    </div>
  );
};
