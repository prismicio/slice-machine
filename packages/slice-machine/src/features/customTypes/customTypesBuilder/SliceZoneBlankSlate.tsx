import { FC } from "react";
import {
  Box,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Icon,
} from "@prismicio/editor-ui";
import { useRouter } from "next/router";

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
  const { query } = useRouter();

  return (
    <Box justifyContent="center" height="100%">
      <BlankSlate backgroundImage="/blank-slate-slice-zone.png">
        <BlankSlateContent>
          <BlankSlateTitle>Add slices</BlankSlateTitle>
          <BlankSlateDescription>
            Slices are website sections that you can reuse on different pages
            with different content. Each slice has its own component in your
            code.
          </BlankSlateDescription>
          <BlankSlateActions>
            <DropdownMenu>
              <DropdownMenuTrigger data-testid="add-slice-dropdown">
                <Button
                  variant={
                    query.newPageType === "true" ? "primary" : "secondary"
                  }
                  startIcon="add"
                >
                  Add
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="start">
                <DropdownMenuItem
                  startIcon={<Icon name="add" />}
                  onSelect={onCreateNewSlice}
                >
                  Blank slice
                </DropdownMenuItem>

                {isSlicesTemplatesSupported ? (
                  <DropdownMenuItem
                    onSelect={openSlicesTemplatesModal}
                    startIcon={<Icon name="contentCopy" />}
                  >
                    From templates
                  </DropdownMenuItem>
                ) : undefined}

                {projectHasAvailableSlices ? (
                  <DropdownMenuItem
                    onSelect={onAddNewSlice}
                    startIcon={<Icon name="folder" />}
                  >
                    From library
                  </DropdownMenuItem>
                ) : undefined}
              </DropdownMenuContent>
            </DropdownMenu>
          </BlankSlateActions>
        </BlankSlateContent>
      </BlankSlate>
    </Box>
  );
};
