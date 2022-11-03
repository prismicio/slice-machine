import { Box, Text, Flex } from "theme-ui";
import * as Models from "@slicemachine/core/build/models";
import { ComponentUI } from "@lib/models/common/ComponentUI";
import useSliceMachineActions from "src/modules/useSliceMachineActions";
import { useMemo } from "react";
import { SliceMachineStoreType } from "@src/redux/type";
import { useSelector } from "react-redux";
import { isLoading } from "@src/modules/loading";
import { LoadingKeysEnum } from "@src/modules/loading/types";
import { Button } from "@components/Button";
import { AiFillCamera } from "react-icons/ai";
import SliceMachineLogo from "@components/AppLayout/Navigation/Icons/SliceMachineLogo";
import { ScreenDimensions } from "@lib/models/common/Screenshots";

type PropTypes = {
  Model: ComponentUI;
  variation: Models.VariationSM;
  screenDimensions: ScreenDimensions;
};

const Header: React.FunctionComponent<PropTypes> = ({
  Model,
  variation,
  screenDimensions,
}) => {
  const { generateSliceScreenshot } = useSliceMachineActions();

  const onTakingSliceScreenshot = () => {
    generateSliceScreenshot(
      variation.id,
      Model,
      {
        width: screenDimensions.width,
        height: screenDimensions.height,
      },
      "fromSimulator"
    );
  };

  const { isSavingScreenshot } = useSelector(
    (store: SliceMachineStoreType) => ({
      isSavingScreenshot: isLoading(
        store,
        LoadingKeysEnum.GENERATE_SLICE_SCREENSHOT
      ),
    })
  );

  const sliceView = useMemo(
    () =>
      Model && variation
        ? [
            {
              sliceID: Model.model.id,
              variationID: variation.id,
            },
          ]
        : null,
    [Model.model.id, variation?.id]
  );

  if (!sliceView) return null;

  return (
    <Box
      sx={{
        p: 3,
        display: "flex",
        gridTemplateColumns: "repeat(3, 1fr)",
        gridTemplateRows: "1fr",
        borderBottom: "1px solid #F1F1F1",
        justifyContent: "space-between",
      }}
    >
      <Flex
        sx={{
          alignItems: "center",
        }}
      >
        <SliceMachineLogo height={"20px"} width={"20px"} />
        <Text mx={2}>{Model.model.name}</Text>
      </Flex>
      <Button
        onClick={onTakingSliceScreenshot}
        label="Take a screenshot"
        isLoading={isSavingScreenshot}
        Icon={AiFillCamera}
      />
    </Box>
  );
};

export default Header;
