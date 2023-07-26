import { ThemeProvider } from "@prismicio/editor-ui";
import { type FC, type ReactNode, useEffect, useState } from "react";
import { Provider } from "react-redux";
import configureStore from "../src/redux/store";
import App, { AppContext } from "next/app";
import { PersistGate } from "redux-persist/integration/react";
import { ThemeProvider as ThemeUIThemeProvider, useThemeUI } from "theme-ui";

import theme from "../src/theme";

import LoadingPage from "../components/LoadingPage";
import SliceMachineApp from "../components/App";

import "@prismicio/editor-ui/style.css";
import "react-tabs/style/react-tabs.css";
import "rc-drawer/assets/index.css";
import "react-datepicker/dist/react-datepicker.css";
import "react-toastify/dist/ReactToastify.css";
import "src/css/keyframes.css";
import "src/css/modal.css";
import "src/css/tabs.css";
import "src/css/drawer.css";
import "src/css/toaster.css";
import "src/css/intercom.css";
import "src/css/starry-night.css";

import "src/css/hljs.css";

import ServerState from "../lib/models/server/ServerState";

import Head from "next/head";
import { AppInitialProps } from "next/dist/shared/lib/utils";
import { Store } from "redux";
import { Persistor } from "redux-persist/es/types";
import { ConnectedRouter } from "connected-next-router";
import { RouteChangeProvider } from "../src/hooks/useRouteChange";
import { getState } from "../src/apiClient";
import { normalizeFrontendCustomTypes } from "../lib/models/common/normalizers/customType";
import Router from "next/router";

import { NextPage } from "next";
import ToastContainer from "@components/ToasterContainer";

type NextPageWithLayout = NextPage & {
  CustomLayout?: React.FC<{ children: ReactNode }>;
};

type AppContextWithComponentLayout = AppContext & {
  Component: NextPageWithLayout;
};

type RemoveDarkModeProps = Readonly<{
  children?: ReactNode;
}>;

const RemoveDarkMode: FC<RemoveDarkModeProps> = ({ children }) => {
  const { setColorMode } = useThemeUI();
  useEffect(() => {
    if (setColorMode) {
      setColorMode("light");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
};

function MyApp({
  Component,
  pageProps,
}: AppContextWithComponentLayout & AppInitialProps) {
  const [serverState, setServerState] = useState<ServerState | null>(null);
  const [smStore, setSMStore] = useState<{
    store: Store;
    persistor: Persistor;
  } | null>(null);

  useEffect(() => {
    async function getInitialState() {
      const serverState = await getState();
      setServerState(serverState);
    }
    void getInitialState();
  }, []);

  useEffect(() => {
    if (!serverState || smStore) {
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

    setSMStore({ store, persistor });
  }, [serverState, smStore]);

  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  const ComponentLayout = Component.CustomLayout || SliceMachineApp;

  return (
    <>
      <Head>
        <title>Slice Machine</title>
      </Head>
      <ThemeUIThemeProvider theme={theme}>
        <RemoveDarkMode>
          <ThemeProvider mode="light">
            {!smStore || !serverState ? (
              <LoadingPage />
            ) : (
              <Provider store={smStore.store}>
                <ConnectedRouter Router={Router}>
                  <PersistGate loading={null} persistor={smStore.persistor}>
                    <RouteChangeProvider>
                      <ComponentLayout>
                        <Component {...pageProps} />
                      </ComponentLayout>
                    </RouteChangeProvider>
                  </PersistGate>
                </ConnectedRouter>
                <ToastContainer />
              </Provider>
            )}
          </ThemeProvider>
        </RemoveDarkMode>
      </ThemeUIThemeProvider>
    </>
  );
}

MyApp.getInitialProps = async (appContext: AppContext) => {
  return await App.getInitialProps(appContext);
};

export default MyApp;
