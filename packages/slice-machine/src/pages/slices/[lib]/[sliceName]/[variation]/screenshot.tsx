import { useRouter } from "next/router";
import { FC, ReactNode } from "react";
import { useSelector } from "react-redux";
import { Box } from "theme-ui";

import useEditorContentOnce from "@/hooks/useEditorContent";
import {
  ComponentWithSliceProps,
  createComponentWithSlice,
} from "@/layouts/WithSlice";
import IframeRenderer from "@/legacy/components/Simulator/components/IframeRenderer";
import { selectSimulatorUrl } from "@/modules/environment";
import { SliceMachineStoreType } from "@/redux/type";

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
        handleSimulatorConnectionResult={() => {}}
      />
    </Box>
  );
};

const WithSlice = createComponentWithSlice(Screenshot);
WithSlice.CustomLayout = CustomLayout;

export default WithSlice;
