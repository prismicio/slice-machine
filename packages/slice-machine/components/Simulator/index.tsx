import React, { useEffect, useMemo, useState } from "react";

import { Flex } from "theme-ui";

import Header from "./components/Header";
import { Size } from "./components/ScreenSizes";
import IframeRenderer from "./components/IframeRenderer";
import Tracker from "@src/tracking/client";
import { useSelector } from "react-redux";
import {
  getCurrentVersion,
  getFramework,
  selectSimulatorUrl,
} from "@src/modules/environment";
import { SliceMachineStoreType } from "@src/redux/type";
import { selectCurrentSlice } from "@src/modules/selectedSlice/selectors";
import Router from "next/router";

export type SliceView = SliceViewItem[];
export type SliceViewItem = Readonly<{ sliceID: string; variationID: string }>;

export default function Simulator() {
  const { component } = useSelector((store: SliceMachineStoreType) => ({
    component: selectCurrentSlice(
      store,
      Router.router?.query.lib as string,
      Router.router?.query.sliceName as string
    ),
  }));

  const variation = component?.model.variations.find(
    (variation) => variation.id === (Router.router?.query.variation as string)
  );

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

  if (!component || !variation) {
    return <div />;
  }

  const sliceView = useMemo(
    () => [
      {
        sliceID: component.model.id,
        variationID: variation.id,
      },
    ],
    [component.model.id, variation.id]
  );

  return (
    <Flex sx={{ height: "100vh", flexDirection: "column" }}>
      <Header
        Model={component}
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
  );
}
