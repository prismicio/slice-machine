import React, { ReactPropTypes, useEffect, useState } from "react";
import { Provider } from "react-redux";
import useSwr from "swr";
import App, { AppContext } from "next/app";
import { PersistGate } from "redux-persist/integration/react";

import configureStore from "src/redux/store";

import theme from "src/theme";

import LoadingPage from "components/LoadingPage";
import SliceMachineApp from "components/App";
import ConfigErrors from "components/ConfigErrors";

import "react-tabs/style/react-tabs.css";
import "rc-drawer/assets/index.css";
import "react-datepicker/dist/react-datepicker.css";
import "src/css/modal.css";
import "src/css/tabs.css";
import "src/css/drawer.css";

// Code block styles (pick one)
import "highlight.js/styles/base16/material-lighter.css";
// import "highlight.js/styles/github.css";
// import "highlight.js/styles/base16/default-light.css"
// import "highlight.js/styles/base16/edge-light.css"
// import "highlight.js/styles/base16/github.css"
// import "highlight.js/styles/base16/google.css"
// import "highlight.js/base16/harmonic16-light.css"
// import "highlight.js/styles/base16/humanoid-light.css"
// import "highlight.js/styles/base16/one-light.css"
// import "highlight.js/styles/base16/summerfruit-light.css"
// import "highlight.js/styles/tomorrow-night-bright"
// import "highlight.js/styles/github.css"
// import "highlight.js/styles/docco.css"
// import "highlight.js/styles/stackoverflow-light.css"
// import "highlight.js/styles/atom-one-light.css"

import ServerState from "lib/models/server/ServerState";
import AppState from "lib/models/common/AppState";
import ServerError from "lib/models/server/ServerError";

import { LibraryUI } from "lib/models/common/LibraryUI";
import Head from "next/head";

async function fetcher(url: string): Promise<any> {
  return fetch(url).then((res) => res.json());
}

function mapSlices(libraries: ReadonlyArray<LibraryUI> | undefined) {
  return (libraries || []).reduce((acc, lib) => {
    return {
      ...acc,
      ...lib.components.reduce(
        (acc, comp) => ({
          ...acc,
          [`${comp.from}:${comp.infos.sliceName}`]: 1,
        }),
        {}
      ),
    };
  }, {});
}

const RenderStates = {
  Loading: () => <LoadingPage />,
  Default: ({
    Component,
    pageProps,
    ...rest
  }: {
    Component: (props: ReactPropTypes) => JSX.Element;
    pageProps: any;
    rest: any;
  }) => <Component {...pageProps} {...rest} />,
  ConfigError: ({
    configErrors,
  }: {
    configErrors: { [errorKey: string]: ServerError };
  }) => <ConfigErrors errors={configErrors} />,
};

const { store, persistor } = configureStore();

function MyApp({
  Component,
  pageProps,
}: {
  Component: (props: any) => JSX.Element;
  pageProps: any;
}) {
  const { data: serverState }: { data?: ServerState } = useSwr(
    "/api/state",
    fetcher
  );

  const [sliceMap, setSliceMap] = useState<any | null>(null);

  const [state, setRenderer] = useState<{
    Renderer: (props: any) => JSX.Element;
    payload: AppState | null;
  }>({ Renderer: RenderStates.Loading, payload: null });

  useEffect(() => {
    if (!serverState) {
      return;
    }

    const appState = AppState.filter(serverState);

    const newSliceMap = mapSlices(appState.libraries);
    if (sliceMap !== null) {
      Object.keys(newSliceMap).forEach((key) => {
        if (!sliceMap[key]) {
          return (window.location.href = `/slices`);
        }
      });
    }
    setSliceMap(newSliceMap);
    setRenderer({ Renderer: RenderStates.Default, payload: appState });
    const { env, configErrors, warnings, libraries } = serverState;
    console.log("------ SliceMachine log ------");
    console.log("Loaded libraries: ", { libraries });
    console.log("Loaded env: ", { env, configErrors });
    console.log("Warnings: ", { warnings });
    console.log("------ End of log ------");
  }, [serverState]);

  const { Renderer, payload } = state;

  return (
    <>
      <Head>
        <title>SliceMachine</title>
        <script type="text/javascript" src="/segment-script.js" />
      </Head>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <SliceMachineApp
            theme={theme}
            serverState={serverState}
            payload={payload}
            pageProps={pageProps}
            Component={Component}
            Renderer={Renderer}
          />
        </PersistGate>
      </Provider>
    </>
  );
}

MyApp.getInitialProps = async (appContext: AppContext) => {
  return await App.getInitialProps(appContext);
};

export default MyApp;
