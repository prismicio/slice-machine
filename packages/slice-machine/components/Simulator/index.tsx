import { SharedSliceEditor, themeClass } from "@prismicio/editor-fields";
import React, { useEffect, useMemo, useState } from "react";
import { useContext } from "react";

import { Flex } from "theme-ui";

import { SliceContext } from "@src/models/slice/context";
import { Slices } from "@slicemachine/core/build/models/Slice";

import Header from "./components/Header";
import { Size } from "./components/ScreenSizes";
import IframeRenderer from "./components/IframeRenderer";
import Tracker from "@src/tracker";
import { useSelector } from "react-redux";
import {
  getCurrentVersion,
  getFramework,
  selectSimulatorUrl,
} from "@src/modules/environment";
import { SliceMachineStoreType } from "@src/redux/type";

export type SliceView = SliceViewItem[];
export type SliceViewItem = Readonly<{ sliceID: string; variationID: string }>;

export default function Simulator() {
  const { Model, variation } = useContext(SliceContext);

  const { framework, version, simulatorUrl } = useSelector(
    (state: SliceMachineStoreType) => ({
      framework: getFramework(state),
      simulatorUrl: selectSimulatorUrl(state),
      version: getCurrentVersion(state),
    })
  );

  useEffect(() => {
    void Tracker.get().trackOpenSliceSimulator(framework, version);
  }, []);

  const [state, setState] = useState({ size: Size.FULL });

  const handleScreenSizeChange = (screen: { size: Size }) => {
    setState({ ...state, size: screen.size });
  };

  if (!Model || !variation) {
    return <div />;
  }

  const sliceView = useMemo(
    () => [{ sliceID: Model.model.id, variationID: variation.id }],
    [Model.model.id, variation.id]
  );

  const content = Model.mock?.find(
    (content) => content.variation === variation.id
  );
  const sharedSlice = Slices.fromSM(Model.model);

  console.log("content", content);
  console.log("sharedSlice", sharedSlice);

  return (
    <Flex sx={{ height: "100vh", flexDirection: "row" }}>
      <Flex sx={{ flex: 1, flexDirection: "column" }}>
        <Header
          title={Model.model.name}
          Model={Model}
          variation={variation}
          handleScreenSizeChange={handleScreenSizeChange}
          size={state.size}
        />
        <IframeRenderer
          size={state.size}
          simulatorUrl={simulatorUrl}
          sliceView={sliceView}
        />
      </Flex>
      {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
      <Flex
        className={themeClass}
        sx={{ flexDirection: "column", minWidth: "444px" }}
      >
        {content === undefined ? (
          <pre>Error: content is undefined.</pre>
        ) : (
          <SharedSliceEditor
            content={content}
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            onContentChange={(content) => {
              console.log("onContentChange", content);
            }}
            sharedSlice={sharedSlice}
          />
        )}
      </Flex>
    </Flex>
  );
}
