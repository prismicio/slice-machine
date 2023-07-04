import { Flex } from "theme-ui";
import { Button, Icon, Image } from "@prismicio/editor-ui";

import {
  BlankSlate,
  BlankSlateActions,
  BlankSlateContent,
  BlankSlateDescription,
  BlankSlateImage,
  BlankSlateTitle,
} from "@src/components/BlankSlate";

const EmptyState: React.FC<{
  onAddNewSlice: () => void;
  onCreateNewSlice: () => void;
  isCreatingSlice: boolean;
  projectHasAvailableSlices: boolean;
}> = ({
  onCreateNewSlice,
  onAddNewSlice,
  isCreatingSlice,
  projectHasAvailableSlices,
}) => {
  return (
    <Flex sx={{ justifyContent: "center" }}>
      <BlankSlate>
        <BlankSlateImage>
          <Image src="/blank-slate-page-types.png" sizing="cover" />
        </BlankSlateImage>
        <BlankSlateContent>
          <BlankSlateTitle>Add your Slices</BlankSlateTitle>
          <BlankSlateDescription>
            Slices are website sections that you can reuse on different pages
            with different content. Each Slice has its own component in your
            code.
          </BlankSlateDescription>
          <BlankSlateActions>
            <Button
              startIcon={<Icon name="add" />}
              onClick={onCreateNewSlice}
              loading={isCreatingSlice}
            >
              New slice
            </Button>
            {projectHasAvailableSlices && (
              <Button
                startIcon={<Icon name="edit" />}
                onClick={onAddNewSlice}
                disabled={isCreatingSlice}
              >
                Update Slices
              </Button>
            )}
          </BlankSlateActions>
        </BlankSlateContent>
      </BlankSlate>
    </Flex>
  );
};

export default EmptyState;
