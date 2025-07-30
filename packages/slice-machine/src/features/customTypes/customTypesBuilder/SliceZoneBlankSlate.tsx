import {
  ActionList,
  ActionListItem,
  BackgroundIcon,
  BlankSlate,
  BlankSlateActions,
  BlankSlateDescription,
  BlankSlateIcon,
  BlankSlateTitle,
} from "@prismicio/editor-ui";
import { FC } from "react";

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
        Slices are website sections that you can reuse on different pages with
        different content. Each slice has its own component in your code.
      </BlankSlateDescription>
      <BlankSlateActions>
        <ActionList>
          <ActionListItem
            renderStartIcon={() => (
              <BackgroundIcon
                name="autoFixHigh"
                size="small"
                iconSize="medium"
                color="purple"
                variant="solid"
                radius={6}
              />
            )}
            onClick={openCreateSliceFromImageModal}
            description="Build a slice based on your design image."
          >
            Generate from image
          </ActionListItem>
          <ActionListItem
            renderStartIcon={() => (
              <BackgroundIcon
                name="add"
                size="small"
                iconSize="medium"
                color="white"
                variant="solid"
                radius={6}
              />
            )}
            onClick={openCreateSliceModal}
            description="Build a custom slice your way."
          >
            Start from scratch
          </ActionListItem>
          {isSlicesTemplatesSupported && (
            <ActionListItem
              renderStartIcon={() => (
                <BackgroundIcon
                  name="contentCopy"
                  size="small"
                  iconSize="medium"
                  color="white"
                  variant="solid"
                  radius={6}
                />
              )}
              onClick={openSlicesTemplatesModal}
              description="Choose from ready-made examples."
            >
              Use a template
            </ActionListItem>
          )}
          {projectHasAvailableSlices && (
            <ActionListItem
              renderStartIcon={() => (
                <BackgroundIcon
                  name="folder"
                  size="small"
                  iconSize="medium"
                  color="white"
                  variant="solid"
                  radius={6}
                />
              )}
              onClick={openUpdateSliceZoneModal}
              description="Select from your created slices."
            >
              Reuse an existing slice
            </ActionListItem>
          )}
        </ActionList>
      </BlankSlateActions>
    </BlankSlate>
  );
};
