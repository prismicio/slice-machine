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

export type SliceView = SliceViewItem[];
export type SliceViewItem = Readonly<{ sliceID: string; variationID: string }>;

// debounce specific to a state setter, not generic for any case
export const debounceState = <I extends object>(
  func: React.Dispatch<React.SetStateAction<I>>,
  waitFor: number
) => {
  let timeout: NodeJS.Timeout;

  return (arg: I): Promise<void> =>
    new Promise((resolve) => {
      if (timeout) {
        clearTimeout(timeout);
      }

      timeout = setTimeout(() => resolve(func(arg)), waitFor);
    });
};

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
  const debouncedSetContent = debounceState(setContent, 300);

  const [prevVariationId, setPrevVariationId] = useState(variation.id);
  if (variation.id !== prevVariationId) {
    setContent(initialContent);
    setPrevVariationId(variation.id);
  }
  const apiContent = useMemo(
    () =>
      content === initialContent
        ? undefined
        : renderSliceMock(sharedSlice, content),
    [sharedSlice, initialContent, content]
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
          apiContent={apiContent}
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
            onContentChange={debouncedSetContent}
            sharedSlice={sharedSlice}
          />
        </ThemeProvider>
      </Flex>
    </Flex>
  );
}
