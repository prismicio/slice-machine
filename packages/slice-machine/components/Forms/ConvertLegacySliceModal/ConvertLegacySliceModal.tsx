import { useMemo, useState } from "react";
import { useSelector } from "react-redux";

import { AnimatedElement } from "@prismicio/editor-ui";
import ModalFormCard from "@components/ModalFormCard";
import { getLibraries, getRemoteSlices } from "@src/modules/slices";
import { SliceMachineStoreType } from "@src/redux/type";
import { pascalize } from "@lib/utils/str";
import { Variation } from "@models/common/Variation";
import { LibraryUI } from "@models/common/LibraryUI";
import { managerClient } from "@src/managerClient";
import { getState, telemetry } from "@src/apiClient";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";

import { validateSliceModalValues as validateAsNewSliceValues } from "../formsValidator";

import { TabIndex } from "./TabIndex";
import { TabAsNewSlice } from "./TabAsNewSlice";
import { TabAsNewVariation } from "./TabAsNewVariation";
import {
  ConvertLegacySliceModalProps,
  TabProps,
  FormValues,
  Tab,
} from "./types";

const validateAsNewVariationValues = (
  values: FormValues,
  libraries: LibraryUI[]
): Partial<Record<keyof FormValues, string>> => {
  const errors: Partial<Record<keyof FormValues, string>> = {};

  if (!values.asNewVariation_libraryID) {
    errors.asNewVariation_libraryID = "Cannot be empty.";
  }
  const library = libraries.find(
    (library) => library.path === values.asNewVariation_libraryID
  );
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  if (!errors.asNewVariation_variationID && !library) {
    errors.asNewVariation_variationID = "Does not exists.";
  }

  if (!values.asNewVariation_sliceID) {
    errors.asNewVariation_libraryID = "Cannot be empty.";
  }
  const slice = library?.components.find(
    (component) => component.model.id === values.asNewVariation_sliceID
  );
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  if (!errors.asNewVariation_sliceID && !slice) {
    errors.asNewVariation_sliceID = "Does not exists.";
  }

  if (!values.asNewVariation_variationName) {
    errors.asNewVariation_libraryID = "Cannot be empty.";
  }

  if (!values.asNewVariation_variationID) {
    errors.asNewVariation_libraryID = "Cannot be empty.";
  } else {
    const variationIDs =
      slice?.model.variations.map((variation) => variation.id) ?? [];

    if (variationIDs.includes(values.asNewVariation_variationID)) {
      errors.asNewVariation_variationID =
        "Slice variation ID is already taken.";
    }
  }

  return errors;
};

export const ConvertLegacySliceModal: React.FC<
  ConvertLegacySliceModalProps
> = ({ isOpen, close, slice, slices, path }) => {
  const { refreshState, replaceCustomTypeSharedSlice } =
    useSliceMachineActions();

  const [isLoading, setIsLoading] = useState(false);

  const { remoteSlices, libraries: allLibraries } = useSelector(
    (store: SliceMachineStoreType) => ({
      remoteSlices: getRemoteSlices(store),
      libraries: getLibraries(store),
    })
  );

  const sliceName = useMemo(() => {
    return slice.value.type === "Slice"
      ? slice.value.fieldset ?? slice.key
      : slice.key;
  }, [slice]);
  const libraries = useMemo(() => {
    return allLibraries.filter((library) => library.isLocal);
  }, [allLibraries]);
  const localSharedSlices = useMemo(() => {
    return libraries.map((library) => library.components).flat();
  }, [libraries]);

  const convertLegacySliceAndTrack = (formValues: FormValues) => {
    setIsLoading(true);
    void (async () => {
      let libraryID: string;
      let sliceID: string;
      let variationName = "Default";
      let variationID = "default";

      switch (formValues.tab) {
        case "as_new_slice":
          libraryID = formValues.from;
          sliceID = formValues.sliceName;
          break;

        case "as_new_variation":
          libraryID = formValues.asNewVariation_libraryID;
          sliceID = formValues.asNewVariation_sliceID;
          variationName = formValues.asNewVariation_variationName;
          variationID = formValues.asNewVariation_variationID;
          break;

        case "index":
        default:
          const [_libraryID, _sliceID, _variationID] =
            formValues.mergeWithIdentical_path.split("::");
          libraryID = _libraryID;
          sliceID = _sliceID;
          variationID = _variationID;
          break;
      }

      void telemetry.track({
        event: "legacy-slice:converted",
        id: sliceID,
        variation: variationID,
        library: libraryID,
        conversionType:
          formValues.tab === "index" || !formValues.tab
            ? "merge_with_identical"
            : formValues.tab,
      });

      const { errors } =
        await managerClient.slices.convertLegacySliceToSharedSlice({
          model: slice.value,
          src: {
            ...path,
            sliceID: slice.key,
          },
          dest: {
            libraryID,
            sliceID,
            variationName,
            variationID,
          },
        });

      if (errors.length) {
        console.error(
          `Errors happened when converting slice \`${sliceName}\``,
          errors
        );
      }

      // TODO(DT-1453): Remove the need of the global getState
      const serverState = await getState();
      // Update Redux store
      refreshState(serverState);

      setIsLoading(false);
      close();
      replaceCustomTypeSharedSlice(
        path.tabID,
        [
          ...slices
            .map((slice) => {
              if (
                "model" in slice.payload &&
                slice.payload.model.id !== sliceID
              ) {
                return slice.payload.model.id;
              }
              return "";
            })
            .filter(Boolean),
          sliceID,
        ],
        slices
          .map((_slice) => {
            if ("key" in _slice.payload && _slice.payload.key !== slice.key) {
              return _slice.payload.key;
            }
            return "";
          })
          .filter(Boolean)
      );
    })();
  };

  return (
    <ModalFormCard
      dataCy="convert-legacy-slice-modal"
      isOpen={isOpen}
      widthInPx="530px"
      formId="convert-legacy-slice-modal"
      buttonLabel={"Convert"}
      close={close}
      onSubmit={convertLegacySliceAndTrack}
      isLoading={isLoading}
      initialValues={{
        sliceName: pascalize(slice.key),
        from: libraries[0]?.name,
        asNewVariation_libraryID: localSharedSlices[0]?.from,
        asNewVariation_sliceID: localSharedSlices[0]?.model.id,
        asNewVariation_variationID: Variation.generateId(slice.key),
        asNewVariation_variationName: sliceName,
        mergeWithIdentical_path: "",
      }}
      validate={(values) => {
        switch (values.tab) {
          case "as_new_slice":
            return validateAsNewSliceValues(values, libraries, remoteSlices);

          case "as_new_variation":
            return validateAsNewVariationValues(values, libraries);

          case "index":
          default:
            if (!values.mergeWithIdentical_path) {
              return { mergeWithIdentical_path: "Cannot be empty." };
            }
            return;
        }
      }}
      content={{
        title: `Convert ${sliceName} to shared slice`,
      }}
    >
      {(formik) => {
        const tabProps: TabProps = {
          path,
          slice,
          setActiveTab: (tab: Tab) => {
            void formik.setFieldValue("tab", tab);
          },
          sliceName,
          libraries,
          localSharedSlices,
          formik,
        };

        // This forces `validate` to trigger once so the UI make sense.
        if (!formik.values.tab) {
          void formik.setFieldValue("tab", "index");
        }

        return (
          <AnimatedElement>
            {formik.values.tab === "as_new_slice" ? (
              <TabAsNewSlice key="as_new_slice" {...tabProps} />
            ) : formik.values.tab === "as_new_variation" ? (
              <TabAsNewVariation key="as_new_variation" {...tabProps} />
            ) : (
              <TabIndex key="index" {...tabProps} />
            )}
          </AnimatedElement>
        );
      }}
    </ModalFormCard>
  );
};
