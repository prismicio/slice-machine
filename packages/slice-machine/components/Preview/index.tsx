import { useState } from "react";
import { useContext } from "react";

import { SliceContext } from "@src/models/slice/context";

import Header from "./components/Header";
import { Size } from "./components/ScreenSizes";
import IframeRenderer from "./components/IframeRenderer";

export type SliceView = SliceViewItem[];
export type SliceViewItem = Readonly<{ sliceID: string; variationID: string }>;

export default function Preview() {
  const { Model, variation } = useContext(SliceContext);

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

  const canvasUrl = `http://localhost:${
    process.env.NODE_ENV === "development" ? "3001" : "3000"
  }/_canvas`;

  return (
    <div>
      <Header
        title={Model.infos.sliceName}
        Model={Model}
        variation={variation}
        handleScreenSizeChange={handleScreenSizeChange}
        canvasUrl={canvasUrl}
        size={state.size}
      />
      <IframeRenderer
        size={state.size}
        canvasUrl={canvasUrl}
        sliceView={sliceView}
      />
    </div>
  );
}
