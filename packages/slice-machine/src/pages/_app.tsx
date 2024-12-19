import "@prismicio/editor-ui/style.css";
import "react-datepicker/dist/react-datepicker.css";
import "react-tabs/style/react-tabs.css";
import "react-toastify/dist/ReactToastify.css";
import "rc-drawer/assets/index.css";
import "@/styles/drawer.css";
import "@/styles/globals.css";
import "@/styles/hljs.css";
import "@/styles/intercom.css";
import "@/styles/keyframes.css";
import "@/styles/modal.css";
import "@/styles/starry-night.css";
import "@/styles/tabs.css";
import "@/styles/toaster.css";

import {
  Box,
  DefaultErrorMessage,
  ThemeProvider,
  TooltipProvider,
} from "@prismicio/editor-ui";
import { ConnectedRouter } from "connected-next-router";
import type { NextPage } from "next";
import type { AppContext, AppInitialProps } from "next/app";
import dynamic from "next/dynamic";
import Head from "next/head";
import Router from "next/router";
import { type FC, type ReactNode, Suspense, useEffect, useState } from "react";
import { Provider } from "react-redux";
import type { Store } from "redux";
import type { Persistor } from "redux-persist/es/types";
import { PersistGate } from "redux-persist/integration/react";
import { ThemeProvider as ThemeUIThemeProvider, useThemeUI } from "theme-ui";

import { getState } from "@/apiClient";
import { ErrorBoundary } from "@/ErrorBoundary";
import { AutoSyncProvider } from "@/features/sync/AutoSyncProvider";
import { RouteChangeProvider } from "@/hooks/useRouteChange";
import SliceMachineApp from "@/legacy/components/App";
import LoadingPage from "@/legacy/components/LoadingPage";
import ToastContainer from "@/legacy/components/ToasterContainer";
import { normalizeFrontendCustomTypes } from "@/legacy/lib/models/common/normalizers/customType";
import type ServerState from "@/legacy/lib/models/server/ServerState";
import configureStore from "@/redux/store";
import theme from "@/theme";

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

function App({
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
      serverState.remoteCustomTypes,
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
            <TooltipProvider>
              {!smStore || !serverState ? (
                <LoadingPage />
              ) : (
                <Provider store={smStore.store}>
                  <ConnectedRouter Router={Router}>
                    <PersistGate loading={null} persistor={smStore.persistor}>
                      <ErrorBoundary
                        renderError={() => (
                          <Box
                            justifyContent="center"
                            width="100%"
                            padding={80}
                          >
                            <DefaultErrorMessage
                              title="Error"
                              description="An error occurred while rendering the app."
                            />
                          </Box>
                        )}
                      >
                        <Suspense fallback={<LoadingPage />}>
                          <AutoSyncProvider>
                            <RouteChangeProvider>
                              <ComponentLayout>
                                <Component {...pageProps} />
                              </ComponentLayout>
                            </RouteChangeProvider>
                          </AutoSyncProvider>
                        </Suspense>
                      </ErrorBoundary>
                    </PersistGate>
                  </ConnectedRouter>
                  <ToastContainer />
                </Provider>
              )}
            </TooltipProvider>
          </ThemeProvider>
        </RemoveDarkMode>
      </ThemeUIThemeProvider>
    </>
  );
}

export default dynamic(() => Promise.resolve(App), { ssr: false });
