import IframeRenderer from "@components/Simulator/components/IframeRenderer";

import useEditorContentOnce from "@src/hooks/useEditorContent";
import {
  ComponentWithSliceProps,
  createComponentWithSlice,
} from "@src/layouts/WithSlice";
import { selectSimulatorUrl } from "@src/modules/environment";
import { SliceMachineStoreType } from "@src/redux/type";
import { FC, ReactNode } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { Box } from "theme-ui";

const CustomLayout: FC<{ children: ReactNode }> = ({ children }) => (
  <>{children}</>
);

const Screenshot: ComponentWithSliceProps = ({ slice, variation }) => {
  const { simulatorUrl } = useSelector((store: SliceMachineStoreType) => ({
    simulatorUrl: selectSimulatorUrl(store),
  }));
  const router = useRouter();
  const screenWidth = Number(router.query.screenWidth);
  const screenHeight = Number(router.query.screenHeight);

  const { apiContent } = useEditorContentOnce({
    slice,
    variationID: variation.id,
  });

  if (simulatorUrl === undefined) {
    return null;
  }

  return (
    <Box
      as="main"
      sx={{
        height: "100vh",
        width: "100vw",
        border: "none",
      }}
    >
      <IframeRenderer
        simulatorUrl={simulatorUrl}
        apiContent={apiContent}
        screenDimensions={{
          width: screenWidth,
          height: screenHeight,
        }}
        isScreenshot
      />
    </Box>
  );
};

const WithSlice = createComponentWithSlice(Screenshot);
WithSlice.CustomLayout = CustomLayout;

export default WithSlice;
