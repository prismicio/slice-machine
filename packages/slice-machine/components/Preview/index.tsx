import { useState } from "react";
import { useContext } from "react";

import { Flex } from "theme-ui";

import { SliceContext } from "@src/models/slice/context";

import Header from "./components/Header";
import { Size } from "./components/ScreenSizes";
import IframeRenderer from "./components/IframeRenderer";
import { SliceMachineStoreType } from "@src/redux/type";
import { useSelector } from "react-redux";
import { getCanvasUrl } from "@src/modules/environment";

export type SliceView = SliceViewItem[];
export type SliceViewItem = Readonly<{ sliceID: string; variationID: string }>;

export default function Preview(): JSX.Element {
  const { Model, variation } = useContext(SliceContext);
  const { canvasUrl } = useSelector((store: SliceMachineStoreType) => ({
    canvasUrl: getCanvasUrl(store),
  }));

  const [state, setState] = useState({ size: Size.FULL });

  const handleScreenSizeChange = (screen: { size: Size }) => {
    setState({ ...state, size: screen.size });
  };

  if (!Model || !variation) {
    return <div />;
  }

  const sliceView: SliceView = [
    { sliceID: Model.infos.model.id, variationID: variation.id },
  ];

  return (
    <Flex sx={{ height: "100vh", flexDirection: "column" }}>
      <Header
        title={Model.infos.sliceName}
        Model={Model}
        variation={variation}
        handleScreenSizeChange={handleScreenSizeChange}
        size={state.size}
      />
      {canvasUrl ? (
        <IframeRenderer
          size={state.size}
          canvasUrl={canvasUrl}
          sliceView={sliceView}
        />
      ) : (
        <div>
          It seems that your canvas Url is not configured yet in the manifest.
        </div>
      )}
    </Flex>
  );
}
