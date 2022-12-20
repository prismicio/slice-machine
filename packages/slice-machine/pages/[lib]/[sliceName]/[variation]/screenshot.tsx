import IframeRenderer from "@components/Simulator/components/IframeRenderer";
import {
  ScreenSizeOptions,
  ScreenSizes,
} from "@components/Simulator/components/Toolbar/ScreensizeInput";

import useEditorContentOnce from "@src/hooks/useEditorContent";
import {
  ComponentWithSliceProps,
  createComponentWithSlice,
} from "@src/layouts/WithSlice";
import { selectSimulatorUrl } from "@src/modules/environment";
import { SliceMachineStoreType } from "@src/redux/type";
import { FC, ReactNode } from "react";

import { useSelector } from "react-redux";
import { Box } from "theme-ui";

const CustomLayout: FC<{ children: ReactNode }> = ({ children }) => (
  <>{children}</>
);

const Screenshot: ComponentWithSliceProps = ({ slice, variation }) => {
  const { simulatorUrl } = useSelector((store: SliceMachineStoreType) => ({
    simulatorUrl: selectSimulatorUrl(store),
  }));

  const { apiContent } = useEditorContentOnce({
    slice,
    variationID: variation.id,
  });

  if (!simulatorUrl) {
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
        screenDimensions={ScreenSizes[ScreenSizeOptions.DESKTOP]}
      />
    </Box>
  );
};

const WithSlice = createComponentWithSlice(Screenshot);
WithSlice.CustomLayout = CustomLayout;

export default WithSlice;
