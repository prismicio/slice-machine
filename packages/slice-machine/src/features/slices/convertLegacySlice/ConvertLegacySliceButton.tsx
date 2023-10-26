import { useMemo, useState, type FC } from "react";
import { useSelector } from "react-redux";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Icon,
  Button,
} from "@prismicio/editor-ui";

import { NonSharedSliceInSliceZone } from "@models/common/CustomType/sliceZone";
import { ComponentUI } from "@models/common/ComponentUI";
import { CustomTypes } from "@models/common/CustomType";
import { getLibraries } from "@src/modules/slices";
import { SliceMachineStoreType } from "@src/redux/type";
import { managerClient } from "@src/managerClient";
import { getState, telemetry } from "@src/apiClient";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { ToasterType } from "@src/modules/toaster";
import { getFieldMappingFingerprint } from "@src/domain/slice";

import { NonSharedSliceCardProps } from "../sliceCards/NonSharedSliceCard";
import { ConvertLegacySliceAsNewSliceDialog } from "./ConvertLegacySliceAsNewSliceDialog";
import { ConvertLegacySliceAsNewVariationDialog } from "./ConvertLegacySliceAsNewVariationDialog";
import { ConvertLegacySliceMergeWithIdenticalDialog } from "./ConvertLegacySliceMergeWithIdenticalDialog";
import {
  ConvertLegacySliceAndTrackArgs,
  IdenticalSlice,
  LegacySliceConversionType,
} from "./types";

type ConvertLegacySliceButtonProps = NonSharedSliceCardProps;

export const ConvertLegacySliceButton: FC<ConvertLegacySliceButtonProps> = ({
  slice,
  path,
}) => {
  const {
    refreshState,
    openToaster,
    initCustomTypeStore,
    saveCustomTypeSuccess,
  } = useSliceMachineActions();

  const [isLoading, setIsLoading] = useState(false);
  const [dialog, setDialog] = useState<LegacySliceConversionType | undefined>();

  const { libraries: allLibraries } = useSelector(
    (store: SliceMachineStoreType) => ({
      libraries: getLibraries(store),
    }),
  );

  const sliceName =
    slice.value.type === "Slice"
      ? slice.value.fieldset ?? slice.key
      : slice.key;
  const libraries = allLibraries.filter((library) => library.isLocal);
  const localSharedSlices = libraries
    .map((library) => library.components)
    .flat();
  const identicalSlices = useIdenticalSlices(
    slice,
    sliceName,
    localSharedSlices,
  );

  const convertLegacySliceAndTrack = async (
    args: ConvertLegacySliceAndTrackArgs,
  ) => {
    if (!dialog) {
      return;
    }

    setIsLoading(true);

    void telemetry.track({
      event: "legacy-slice:converted",
      id: args.sliceID,
      variation: args.variationID ?? "default",
      library: args.libraryID,
      conversionType: dialog,
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
      console.error(`Could not convert slice \`${sliceName}\``, errors);

      openToaster(
        `Could not convert slice \`${sliceName}\``,
        ToasterType.ERROR,
      );

      throw errors;
    }

    const { model: customType, errors: customTypeReadErrors } =
      await managerClient.customTypes.readCustomType({
        id: path.customTypeID,
      });

    if (customTypeReadErrors.length || !customType) {
      console.error(
        `Could not refresh custom type view \`${path.customTypeID}\``,
        customTypeReadErrors,
      );

      openToaster(
        `Could not refresh custom type view \`${path.customTypeID}\``,
        ToasterType.ERROR,
      );

      return;
    }

    // TODO(DT-1453): Remove the need of the global getState
    const serverState = await getState();
    // Update Redux store
    refreshState(serverState);

    setIsLoading(false);
    setDialog(undefined);
    switch (dialog) {
      case "as_new_slice":
        openToaster(
          `${sliceName} has been upgraded to a new slice ${args.libraryID} > ${args.sliceID}`,
          ToasterType.SUCCESS,
        );
        break;

      case "as_new_variation":
        openToaster(
          `${sliceName} has been converted as a variation of ${args.libraryID} > ${args.sliceID}`,
          ToasterType.SUCCESS,
        );
        break;

      case "merge_with_identical":
      default:
        openToaster(
          `${sliceName} has been merged with ${args.libraryID} > ${args.sliceID}`,
          ToasterType.SUCCESS,
        );
        break;
    }

    const customTypeSM = CustomTypes.toSM(customType);
    initCustomTypeStore(customTypeSM, customTypeSM);
    saveCustomTypeSuccess(customType);
  };

  const formProps = {
    path,
    slice,
    sliceName,
    libraries,
    localSharedSlices,
    identicalSlices,
    close: () => setDialog(undefined),
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
            onSelect={() => setDialog("as_new_slice")}
          >
            Upgrade slice
          </DropdownMenuItem>
          <DropdownMenuItem
            startIcon={<Icon name="viewDay" size="large" />}
            description="Add it to another slice"
            onSelect={() => setDialog("as_new_variation")}
            disabled={!localSharedSlices.length}
          >
            Convert to slice variation
          </DropdownMenuItem>
          <DropdownMenuItem
            startIcon={<Icon name="driveFileMove" size="large" />}
            description="Combine identical slices"
            onSelect={() => setDialog("merge_with_identical")}
            disabled={!identicalSlices.length}
          >
            Merge with another slice
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ConvertLegacySliceAsNewSliceDialog
        {...formProps}
        isOpen={dialog === "as_new_slice"}
      />
      <ConvertLegacySliceAsNewVariationDialog
        {...formProps}
        isOpen={dialog === "as_new_variation"}
      />
      <ConvertLegacySliceMergeWithIdenticalDialog
        {...formProps}
        isOpen={dialog === "merge_with_identical"}
      />
    </>
  );
};

const useIdenticalSlices = (
  slice: NonSharedSliceInSliceZone,
  sliceName: string,
  localSharedSlices: ComponentUI[],
) => {
  return useMemo<IdenticalSlice[]>(() => {
    const results: IdenticalSlice[] = [];

    const sliceFields = getFieldMappingFingerprint(slice.value, sliceName);

    for (const sharedSlice of localSharedSlices) {
      for (const variation of sharedSlice.model.variations) {
        const variationFields = getFieldMappingFingerprint(
          variation,
          sharedSlice.model.name,
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
};
