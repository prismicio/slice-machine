import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Icon,
  Button,
} from "@prismicio/editor-ui";
import {
  LegacySlice,
  CompositeSlice,
} from "@prismicio/types-internal/lib/customtypes";

import { VariationSM } from "@models/common/Slice";
import { CustomTypes } from "@models/common/CustomType";
import { getLibraries } from "@src/modules/slices";
import { SliceMachineStoreType } from "@src/redux/type";
import { managerClient } from "@src/managerClient";
import { getState, telemetry } from "@src/apiClient";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { ToasterType } from "@src/modules/toaster";

import { FormAsNewSlice } from "./FormAsNewSlice";
import { FormAsNewVariation } from "./FormAsNewVariation";
import { FormMergeWithIdentical } from "./FormMergeWithIdentical";
import {
  ConvertLegacySliceModalProps,
  ConvertLegacySliceAndTrackArgs,
  IdenticalSlice,
  Type,
} from "./types";

const getFieldMappingFingerprint = (
  slice: LegacySlice | CompositeSlice | VariationSM,
  sliceName: string
): {
  primary: string;
  items: string;
} => {
  const primary: Record<string, string> = {};
  const items: Record<string, string> = {};

  if ("type" in slice) {
    if (slice.type === "Slice") {
      for (const key in slice["non-repeat"]) {
        primary[key] = slice["non-repeat"][key].type;
      }
      for (const key in slice.repeat) {
        items[key] = slice.repeat[key].type;
      }
    } else if (slice.type === "Group") {
      for (const key in slice.config?.fields) {
        items[key] = slice.config?.fields[key].type ?? "";
      }
    } else {
      primary[sliceName] = slice.type;
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

export const ConvertLegacySliceModal: React.FC<
  ConvertLegacySliceModalProps
> = ({ slice, path }) => {
  const {
    refreshState,
    openToaster,
    initCustomTypeStore,
    saveCustomTypeSuccess,
  } = useSliceMachineActions();

  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState<false | Type>(false);

  const { libraries: allLibraries } = useSelector(
    (store: SliceMachineStoreType) => ({
      libraries: getLibraries(store),
    })
  );

  const {} = useSliceMachineActions();

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
  const identicalSlices = useMemo<IdenticalSlice[]>(() => {
    const results: IdenticalSlice[] = [];

    const sliceFields = getFieldMappingFingerprint(slice.value, sliceName);

    for (const sharedSlice of localSharedSlices) {
      for (const variation of sharedSlice.model.variations) {
        const variationFields = getFieldMappingFingerprint(
          variation,
          sharedSlice.model.name
        );

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
  }, [slice, sliceName, localSharedSlices]);

  const convertLegacySliceAndTrack = (args: ConvertLegacySliceAndTrackArgs) => {
    if (isModalOpen === false) {
      return;
    }

    setIsLoading(true);
    void (async () => {
      void telemetry.track({
        event: "legacy-slice:converted",
        id: args.sliceID,
        variation: args.variationID ?? "default",
        library: args.libraryID,
        conversionType: isModalOpen,
      });

      const { errors } =
        await managerClient.slices.convertLegacySliceToSharedSlice({
          model: slice.value,
          src: {
            ...path,
            sliceID: slice.key,
          },
          dest: {
            libraryID: args.libraryID,
            sliceID: args.sliceID,
            variationName: args.variationName ?? "Default",
            variationID: args.variationID ?? "default",
          },
        });

      if (errors.length) {
        console.error(
          `Errors happened when converting slice \`${sliceName}\``,
          errors
        );
      }

      const { model: customType, errors: customTypeReadErrors } =
        await managerClient.customTypes.readCustomType({
          id: path.customTypeID,
        });

      if (customTypeReadErrors.length || !customType) {
        console.error(
          `Errors happened when converting slice \`${sliceName}\``,
          customTypeReadErrors
        );

        throw customTypeReadErrors;
      }

      // TODO(DT-1453): Remove the need of the global getState
      const serverState = await getState();
      // Update Redux store
      refreshState(serverState);

      setIsLoading(false);
      setIsModalOpen(false);
      switch (isModalOpen) {
        case "as_new_slice":
          openToaster(
            `${sliceName} has been upgraded to a new slice ${args.libraryID} > ${args.sliceID}`,
            ToasterType.SUCCESS
          );
          break;

        case "as_new_variation":
          openToaster(
            `${sliceName} has been converted as a variation of ${args.libraryID} > ${args.sliceID}`,
            ToasterType.SUCCESS
          );
          break;

        case "merge_with_identical":
        default:
          openToaster(
            `${sliceName} has been merged with ${args.libraryID} > ${args.sliceID}`,
            ToasterType.SUCCESS
          );
          break;
      }

      const customTypeSM = CustomTypes.toSM(customType);
      initCustomTypeStore(customTypeSM, customTypeSM);
      saveCustomTypeSuccess(customType);
    })();
  };

  const formProps = {
    path,
    slice,
    sliceName,
    libraries,
    localSharedSlices,
    identicalSlices,
    close: () => setIsModalOpen(false),
    onSubmit: convertLegacySliceAndTrack,
    isLoading,
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button
            data-cy="convert-legacy-slice"
            startIcon="refresh"
            endIcon="arrowDropDown"
            size="medium"
            variant="secondary"
          >
            Migrate legacy slice
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem
            startIcon={<Icon name="folder" size="large" />}
            description="Use it with new types"
            onSelect={() => setIsModalOpen("as_new_slice")}
          >
            Upgrade slice
          </DropdownMenuItem>
          <DropdownMenuItem
            startIcon={<Icon name="viewDay" size="large" />}
            description="Add it to another slice"
            onSelect={() => setIsModalOpen("as_new_variation")}
            disabled={!localSharedSlices.length}
          >
            Convert to slice variation
          </DropdownMenuItem>
          <DropdownMenuItem
            startIcon={<Icon name="driveFileMove" size="large" />}
            description="Combine identical slices"
            onSelect={() => setIsModalOpen("merge_with_identical")}
            disabled={!identicalSlices.length}
          >
            Merge with another slice
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <FormAsNewSlice {...formProps} isOpen={isModalOpen === "as_new_slice"} />
      <FormAsNewVariation
        {...formProps}
        isOpen={isModalOpen === "as_new_variation"}
      />
      <FormMergeWithIdentical
        {...formProps}
        isOpen={isModalOpen === "merge_with_identical"}
      />
    </>
  );
};
