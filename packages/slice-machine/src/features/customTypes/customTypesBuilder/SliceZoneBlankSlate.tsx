import {
  ActionList,
  ActionListItem,
  BlankSlate,
  BlankSlateActions,
  BlankSlateDescription,
  BlankSlateIcon,
  BlankSlateTitle,
} from "@prismicio/editor-ui";
import { FC } from "react";

import { getSliceCreationOptions } from "./sliceCreationOptions";

export type SliceZoneBlankSlateProps = {
  openUpdateSliceZoneModal: () => void;
  openCreateSliceModal: () => void;
  openCreateSliceFromImageModal: () => void;
  openSlicesTemplatesModal: () => void;
  projectHasAvailableSlices: boolean;
  isSlicesTemplatesSupported: boolean;
};

export const SliceZoneBlankSlate: FC<SliceZoneBlankSlateProps> = ({
  openCreateSliceModal,
  openCreateSliceFromImageModal,
  openUpdateSliceZoneModal,
  openSlicesTemplatesModal,
  projectHasAvailableSlices,
  isSlicesTemplatesSupported,
}) => {
  const sliceCreationOptions = getSliceCreationOptions({
    menuType: "ActionList",
  });

  return (
    <BlankSlate data-testid="slice-zone-blank-slate" sx={{ width: 648 }}>
      <BlankSlateIcon
        lineColor="purple9"
        backgroundColor="purple5"
        name="add"
        size="large"
      />
      <BlankSlateTitle size="big">Add slices</BlankSlateTitle>
      <BlankSlateDescription>
        Slices are reusable website sections. You can use them on different
        pages and write unique content for each. Each slice has its own
        component in your code.
      </BlankSlateDescription>
      <BlankSlateActions>
        <ActionList>
          <ActionListItem
            renderStartIcon={() =>
              sliceCreationOptions.fromImage.BackgroundIcon
            }
            onClick={openCreateSliceFromImageModal}
            description={sliceCreationOptions.fromImage.description}
          >
            {sliceCreationOptions.fromImage.title}
          </ActionListItem>
          <ActionListItem
            renderStartIcon={() =>
              sliceCreationOptions.fromScratch.BackgroundIcon
            }
            onClick={openCreateSliceModal}
            description={sliceCreationOptions.fromScratch.description}
          >
            {sliceCreationOptions.fromScratch.title}
          </ActionListItem>
          {isSlicesTemplatesSupported && (
            <ActionListItem
              renderStartIcon={() =>
                sliceCreationOptions.fromTemplate.BackgroundIcon
              }
              onClick={openSlicesTemplatesModal}
              description={sliceCreationOptions.fromTemplate.description}
            >
              {sliceCreationOptions.fromTemplate.title}
            </ActionListItem>
          )}
          {projectHasAvailableSlices && (
            <ActionListItem
              renderStartIcon={() =>
                sliceCreationOptions.fromExisting.BackgroundIcon
              }
              onClick={openUpdateSliceZoneModal}
              description={sliceCreationOptions.fromExisting.description}
            >
              {sliceCreationOptions.fromExisting.title}
            </ActionListItem>
          )}
        </ActionList>
      </BlankSlateActions>
    </BlankSlate>
  );
};
