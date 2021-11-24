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

  console.log({ sliceView });

  if (!Model) {
    return <div />;
  }
  return (
    <div>
      <Header
        title={Model.infos.sliceName}
        Model={Model}
        variation={variation}
        handleScreenSizeChange={handleScreenSizeChange}
        size={state.size}
      />
      <IframeRenderer size={state.size} sliceView={sliceView} />
      {/* <Flex
        sx={{
          justifyContent: 'center',
          borderTop: '1px solid #F1F1F1',
          margin: '0 auto',
          overflow: 'auto',
          ...iframeSizes[state.size]
        }}
      >
        <iframe src="http://localhost:3001/_canvas" style={{ border: 'none', height: '100%', width: '100%' }} />
      </Flex> */}
    </div>
  );
}

/**
 * .iframe-container {
  overflow: hidden;
<Flex
  sx={{
    justifyContent: 'center',
    borderTop: '1px solid #F1F1F1',
    margin: '0 auto',
    overflow: 'hidden',
    paddingTop: '56.25%',
    position: 'relative',
    '& > iframe': {
      border: 'red',
      height: '100%',
      left: '0',
      position: 'absolute',
      top: '0',
      width: '100%'
    },
    ...iframeSizes[state.size]
  }}
>
  <iframe src="http://localhost:3001/" />
</Flex>
 */
