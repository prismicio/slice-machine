import {
  SharedSliceEditor,
  ThemeProvider,
  defaultSharedSliceContent,
} from "@prismicio/editor-fields";
import { renderSliceMock } from "@prismicio/mocks";
import type { SharedSliceContent } from "@prismicio/types-internal/lib/documents/widgets/slices";
import React, { useEffect, useMemo, useState } from "react";

import { Flex } from "theme-ui";

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
import { selectCurrentSlice } from "@src/modules/selectedSlice/selectors";
import Router from "next/router";
import { throttle } from "lodash";

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

  const sharedSlice = useMemo(
    () => Slices.fromSM(component.model),
    [component.model]
  );
  const initialContent = useMemo<SharedSliceContent>(
    () =>
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      component.mock?.find((content) => content.variation === variation.id) ??
      defaultSharedSliceContent(variation.id),
    [component.mock, variation.id]
  );

  const [content, setContent] = useState(initialContent);
  const initialApiContent = useMemo(
    () =>
      renderSliceMock(sharedSlice, content) as {
        slice_id: string;
        [k: string]: unknown;
      },
    []
  );

  const [prevVariationId, setPrevVariationId] = useState(variation.id);
  if (variation.id !== prevVariationId) {
    setContent(initialContent);
    setPrevVariationId(variation.id);
  }

  const apiContent = useMemo(
    () =>
      throttle(() => {
        if (content === initialContent) return undefined;
        return {
          ...(renderSliceMock(sharedSlice, content) as object),
          slice_id: initialApiContent.slice_id,
        };
      }, 10000),
    [sharedSlice, content, initialContent]
  );

  return (
    <Flex sx={{ flexDirection: "row", height: "100vh" }}>
      <Flex sx={{ flex: 1, flexDirection: "column" }}>
        <Header
          Model={component}
          variation={variation}
          handleScreenSizeChange={handleScreenSizeChange}
          size={state.size}
        />
        <IframeRenderer
          apiContent={apiContent()}
          size={state.size}
          simulatorUrl={simulatorUrl}
          sliceView={sliceView}
        />
      </Flex>
      <Flex
        sx={{
          backgroundColor: "#F9F8F9",
          borderInlineStart: "1px solid #DCDBDD",
          flexDirection: "column",
          overflowY: "scroll",
          padding: "72px 24px 36px 23px",
          width: "444px",
        }}
      >
        <ThemeProvider>
          <SharedSliceEditor
            content={content}
            onContentChange={setContent}
            sharedSlice={sharedSlice}
          />
        </ThemeProvider>
      </Flex>
    </Flex>
  );
}
