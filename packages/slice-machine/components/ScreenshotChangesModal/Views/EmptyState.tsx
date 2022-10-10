import { Flex, Spinner, Text } from "theme-ui";

import useSliceMachineActions from "@src/modules/useSliceMachineActions";

import { ViewRendererProps } from "./";
import useCustomScreenshot from "../useCustomScreenshot";

const EmptyState = ({
  variationID,
  slice,
  isLoadingScreenshot,
}: ViewRendererProps) => {
  const { generateSliceCustomScreenshot } = useSliceMachineActions();

  const { Renderer } = useCustomScreenshot({
    slice,
    variationID,
    onHandleFile: generateSliceCustomScreenshot,
  });

  return (
    <Flex
      sx={{
        justifyContent: "center",
        alignItems: "center",
        height: "90%",
        width: "100%",
        bg: "secondary",
      }}
    >
      <Flex
        sx={{
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        {isLoadingScreenshot ? <Spinner sx={{ mb: 2 }} /> : null}
        <Renderer />
        <Text sx={{ color: "greyIcon", mt: 1 }}>Maximum file size: 128Mb</Text>
      </Flex>
    </Flex>
  );
};

export default EmptyState;
