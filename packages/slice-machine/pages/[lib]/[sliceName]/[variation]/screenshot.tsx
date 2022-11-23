import IframeRenderer from "@components/Simulator/components/IframeRenderer";
import {
  ScreenSizeOptions,
  ScreenSizes,
} from "@components/Simulator/components/Toolbar/ScreensizeInput";
import useEditorContentOnce from "@src/hooks/useEditorContent";
import { selectSimulatorUrl } from "@src/modules/environment";
import { selectCurrentSlice } from "@src/modules/selectedSlice/selectors";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { SliceMachineStoreType } from "@src/redux/type";
import { useRouter } from "next/router";
import { ReactNode, useEffect } from "react";
import { useSelector } from "react-redux";
import { Box } from "theme-ui";

type ScreenshotType = React.FunctionComponent & {
  CustomLayout: typeof CustomLayout;
};

const CustomLayout: React.FunctionComponent<{ children: ReactNode }> = ({
  children,
}) => <>{children}</>;

const Screenshot: ScreenshotType = () => {
  const router = useRouter();
  const { initSliceStore } = useSliceMachineActions();

  const { component, simulatorUrl } = useSelector(
    (store: SliceMachineStoreType) => ({
      component: selectCurrentSlice(
        store,
        router.query.lib as string,
        router.query.sliceName as string
      ),
      simulatorUrl: selectSimulatorUrl(store),
    })
  );

  if (!component) {
    void router.replace("/");
    return null;
  }

  useEffect(() => {
    initSliceStore(component);
  }, []);

  const variation = component.model.variations.find(
    (variation) => variation.id === router.query.variation
  );

  if (!variation) {
    return null;
  }

  const { apiContent } = useEditorContentOnce({
    slice: component,
    variationID: variation.id,
  });

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
        sx={{
          height: "100%",
        }}
        simulatorUrl={simulatorUrl}
        apiContent={apiContent}
        screenDimensions={ScreenSizes[ScreenSizeOptions.DESKTOP]}
      />
    </Box>
  );
};

Screenshot.CustomLayout = CustomLayout;

export default Screenshot;
