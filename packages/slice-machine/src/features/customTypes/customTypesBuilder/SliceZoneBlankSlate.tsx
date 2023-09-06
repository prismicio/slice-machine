import { FC } from "react";
import { Box, Button } from "@prismicio/editor-ui";

import {
  BlankSlate,
  BlankSlateActions,
  BlankSlateContent,
  BlankSlateDescription,
  BlankSlateTitle,
} from "@src/components/BlankSlate";

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
    <Box justifyContent="center">
      <BlankSlate backgroundImage="/blank-slate-slice-zone.png">
        <BlankSlateContent>
          <BlankSlateTitle>Add slices</BlankSlateTitle>
          <BlankSlateDescription>
            Slices are website sections that you can reuse on different pages
            with different content. Each slice has its own component in your
            code.
          </BlankSlateDescription>
          <BlankSlateActions>
            <Button startIcon="add" onClick={onCreateNewSlice}>
              Create a blank slice
            </Button>
            {isSlicesTemplatesSupported && (
              <Button
                startIcon="contentCopy"
                onClick={openSlicesTemplatesModal}
              >
                Add from templates
              </Button>
            )}
            {projectHasAvailableSlices && (
              <Button startIcon="folder" onClick={onAddNewSlice}>
                Add from libraries
              </Button>
            )}
          </BlankSlateActions>
        </BlankSlateContent>
      </BlankSlate>
    </Box>
  );
};
