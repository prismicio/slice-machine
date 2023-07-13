import { FC } from "react";
import { Box, Button, Icon } from "@prismicio/editor-ui";

import {
  BlankSlate,
  BlankSlateActions,
  BlankSlateContent,
  BlankSlateDescription,
  BlankSlateTitle,
} from "@src/components/BlankSlate";

export type SliceZoneBlankStateProps = {
  onAddNewSlice: () => void;
  onCreateNewSlice: () => void;
  projectHasAvailableSlices: boolean;
};

export const SliceZoneBlankState: FC<SliceZoneBlankStateProps> = ({
  onCreateNewSlice,
  onAddNewSlice,
  projectHasAvailableSlices,
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
            <Button startIcon={<Icon name="add" />} onClick={onCreateNewSlice}>
              New slice
            </Button>
            {projectHasAvailableSlices && (
              <Button startIcon={<Icon name="edit" />} onClick={onAddNewSlice}>
                Update Slices
              </Button>
            )}
          </BlankSlateActions>
        </BlankSlateContent>
      </BlankSlate>
    </Box>
  );
};
