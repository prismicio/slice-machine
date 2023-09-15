import { FC } from "react";
import { ActionList, ActionListItem, Box } from "@prismicio/editor-ui";

import {
  BlankSlate,
  BlankSlateActions,
  BlankSlateContent,
  BlankSlateDescription,
  BlankSlateTitle,
} from "@src/components/BlankSlate";
import { LightningIcon3D } from "@src/icons/LightningIcon3D";

export type SliceZoneBlankSlateProps = {
  onAddNewSlice: () => void;
  onCreateNewSlice: () => void;
  openSlicesTemplatesModal: () => void;
  projectHasAvailableSlices: boolean;
  isSlicesTemplatesSupported: boolean;
};

export const SliceZoneBlankSlate: FC<SliceZoneBlankSlateProps> = ({
  onCreateNewSlice,
  onAddNewSlice,
  openSlicesTemplatesModal,
  projectHasAvailableSlices,
  isSlicesTemplatesSupported,
}) => {
  return (
    <Box justifyContent="center" height="100%">
      <BlankSlate backgroundImage="/blank-slate-slice-zone.png">
        <BlankSlateContent>
          <Box justifyContent="center" padding={{ bottom: 16 }}>
            <LightningIcon3D />
          </Box>
          <BlankSlateTitle>Add slices</BlankSlateTitle>
          <BlankSlateDescription>
            Slices are website sections that you can reuse on different pages
            with different content. Each slice has its own component in your
            code.
          </BlankSlateDescription>
          <BlankSlateActions>
            <ActionList>
              <ActionListItem
                startIcon="add"
                onClick={onCreateNewSlice}
                description="Okay, you're not kidding"
              >
                Create a new one
              </ActionListItem>
              {isSlicesTemplatesSupported ? (
                <ActionListItem
                  startIcon="contentCopy"
                  onClick={openSlicesTemplatesModal}
                  description="Great, if you struggle"
                >
                  Add from templates
                </ActionListItem>
              ) : undefined}
              {projectHasAvailableSlices ? (
                <ActionListItem
                  startIcon="folder"
                  onClick={onAddNewSlice}
                  description="Why reinvent the wheel?"
                >
                  Add from this project
                </ActionListItem>
              ) : undefined}
            </ActionList>
          </BlankSlateActions>
        </BlankSlateContent>
      </BlankSlate>
    </Box>
  );
};
