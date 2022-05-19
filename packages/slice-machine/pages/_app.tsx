import React, { useEffect, useState } from "react";
import { Provider } from "react-redux";
import configureStore from "../src/redux/store";
import App, { AppContext } from "next/app";
import { PersistGate } from "redux-persist/integration/react";
import { ThemeProvider, BaseStyles, useThemeUI } from "theme-ui";

import theme from "../src/theme";

import LoadingPage from "../components/LoadingPage";
import SliceMachineApp from "../components/App";

import "react-tabs/style/react-tabs.css";
import "rc-drawer/assets/index.css";
import "react-datepicker/dist/react-datepicker.css";
import "react-toastify/dist/ReactToastify.css";
import "src/css/modal.css";
import "src/css/tabs.css";
import "src/css/drawer.css";
import "src/css/toaster.css";
import "src/css/intercom.css";

import "highlight.js/styles/atom-one-dark.css";

import ServerState from "../lib/models/server/ServerState";
import {
  getIsTrackingAvailable,
  getRepoName,
} from "../src/modules/environment";
import Tracker from "../src/tracker";

import Head from "next/head";
import { AppInitialProps } from "next/dist/shared/lib/utils";
import { Store } from "redux";
import { Persistor } from "redux-persist/es/types";
import { ConnectedRouter } from "connected-next-router";
import { getState } from "../src/apiClient";
import { normalizeFrontendCustomTypes } from "../src/normalizers/customType";
import Router from "next/router";

const RemoveDarkMode: React.FunctionComponent = ({ children }) => {
  const { setColorMode } = useThemeUI();
  useEffect(() => {
    if (setColorMode) {
      setColorMode("light");
    }
  }, []);

  return <>{children}</>;
};

function MyApp({ Component, pageProps }: AppContext & AppInitialProps) {
  const [serverState, setServerState] = useState<ServerState | null>(null);
  const [smStore, setSMStore] = useState<{
    store: Store;
    persistor: Persistor;
  } | null>(null);

  useEffect(() => {
    async function getInitialState() {
      const { data: serverState } = await getState();
      setServerState(serverState);
    }
    void getInitialState();
  }, []);

  useEffect(() => {
    if (!serverState) {
      return;
    }

    const normalizedCustomTypes = normalizeFrontendCustomTypes(
      serverState.customTypes,
      serverState.remoteCustomTypes
    );

    const { store, persistor } = configureStore({
      environment: serverState.env,
      availableCustomTypes: {
        ...normalizedCustomTypes,
      },
      slices: {
        libraries: serverState.libraries,
        remoteSlices: serverState.remoteSlices,
      },
    });

    const state = store.getState();
    const tracking = getIsTrackingAvailable(state);
    const repoName = getRepoName(state);

    Tracker.get().initialize(
      process.env.NEXT_PUBLIC_SM_UI_SEGMENT_KEY ||
        "Ng5oKJHCGpSWplZ9ymB7Pu7rm0sTDeiG",
      repoName,
      tracking
    );

    setSMStore({ store, persistor });
  }, [serverState]);

  return (
    <>
      <Head>
        <title>SliceMachine</title>
      </Head>
      <ThemeProvider theme={theme}>
        <BaseStyles>
          <RemoveDarkMode>
            {!smStore || !serverState ? (
              <LoadingPage />
            ) : (
              <Provider store={smStore.store}>
                <ConnectedRouter Router={Router}>
                  <PersistGate loading={null} persistor={smStore.persistor}>
                    <SliceMachineApp>
                      <Component {...pageProps} />
                    </SliceMachineApp>
                  </PersistGate>
                </ConnectedRouter>
              </Provider>
            )}
          </RemoveDarkMode>
        </BaseStyles>
      </ThemeProvider>
    </>
  );
}

MyApp.getInitialProps = async (appContext: AppContext) => {
  return await App.getInitialProps(appContext);
};

export default MyApp;
