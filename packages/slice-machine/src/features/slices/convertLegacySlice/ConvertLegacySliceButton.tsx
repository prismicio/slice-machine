import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Icon,
} from "@prismicio/editor-ui";
import { type FC, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

import { getState, telemetry } from "@/apiClient";
import { getFieldMappingFingerprint } from "@/domain/slice";
import { useCustomTypeState } from "@/features/customTypes/customTypesBuilder/CustomTypeProvider";
import { ComponentUI } from "@/legacy/lib/models/common/ComponentUI";
import { NonSharedSliceInSliceZone } from "@/legacy/lib/models/common/CustomType/sliceZone";
import { managerClient } from "@/managerClient";
import { getLibraries } from "@/modules/slices";
import useSliceMachineActions from "@/modules/useSliceMachineActions";
import { SliceMachineStoreType } from "@/redux/type";

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
  const { refreshState } = useSliceMachineActions();

  const [isLoading, setIsLoading] = useState(false);
  const [dialog, setDialog] = useState<LegacySliceConversionType | undefined>();
  const { setCustomType } = useCustomTypeState();

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

      toast.error(`Could not convert slice \`${sliceName}\``);

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

      toast.error(
        `Could not refresh custom type view \`${path.customTypeID}\``,
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
        toast.success(
          `${sliceName} has been upgraded to a new slice ${args.libraryID} > ${args.sliceID}`,
        );
        break;

      case "as_new_variation":
        toast.success(
          `${sliceName} has been converted as a variation of ${args.libraryID} > ${args.sliceID}`,
        );
        break;

      case "merge_with_identical":
      default:
        toast.success(
          `${sliceName} has been merged with ${args.libraryID} > ${args.sliceID}`,
        );
        break;
    }

    setCustomType(customType);
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
            data-testid="convert-legacy-slice"
            startIcon="refresh"
            endIcon="arrowDropDown"
            size="medium"
            color="grey"
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
