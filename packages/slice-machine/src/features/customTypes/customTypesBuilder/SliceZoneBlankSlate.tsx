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
          <BlankSlateTitle>Add your Slices</BlankSlateTitle>
          <BlankSlateDescription>
            Slices are website sections that you can reuse on different pages
            with different content. Each Slice has its own component in your
            code.
          </BlankSlateDescription>
          <BlankSlateActions>
            <Button startIcon="add" onClick={onCreateNewSlice}>
              Create a new slice
            </Button>
            {projectHasAvailableSlices && (
              <Button startIcon="folder" onClick={onAddNewSlice}>
                Add from your library
              </Button>
            )}
            {isSlicesTemplatesSupported && (
              <Button
                startIcon="centerFocusWeak"
                onClick={openSlicesTemplatesModal}
              >
                Add from template
              </Button>
            )}
          </BlankSlateActions>
        </BlankSlateContent>
      </BlankSlate>
    </Box>
  );
};
