import IframeRenderer from "@components/Simulator/components/IframeRenderer";
import {
  ScreenSizeOptions,
  ScreenSizes,
} from "@components/Simulator/components/Toolbar/ScreensizeInput";
import { ComponentUI } from "@lib/models/common/ComponentUI";
import { VariationSM } from "@slicemachine/core/build/models";
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

type CustomLayoutProps = Readonly<{
  children?: ReactNode;
}>;
const CustomLayout: React.FC<CustomLayoutProps> = ({ children }) => (
  <>{children}</>
);

const Screenshot: ScreenshotType = () => {
  const router = useRouter();

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

  const variationId = (() => {
    if (router.query.variation && typeof router.query.variation === "string")
      return router.query.variation;
    return;
  })();

  const variation = component?.model.variations.find(
    (variation) => variation.id === variationId
  );

  if (!component || !variation) {
    void router.replace("/");
    return null;
  } else {
    return (
      <ScreenshotForComponent
        component={component}
        variation={variation}
        simulatorUrl={simulatorUrl}
      />
    );
  }
};

type ScreenshotForComponentProps = {
  component: ComponentUI;
  variation: VariationSM;
  simulatorUrl: string | undefined;
};
const ScreenshotForComponent: React.FC<ScreenshotForComponentProps> = ({
  component,
  variation,
  simulatorUrl,
}) => {
  const { initSliceStore } = useSliceMachineActions();

  useEffect(() => {
    initSliceStore(component);
  }, []);

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
