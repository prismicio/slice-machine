import "@prismicio/editor-ui/style.css";
import "react-datepicker/dist/react-datepicker.css";
import "react-tabs/style/react-tabs.css";
import "react-toastify/dist/ReactToastify.css";
import "rc-drawer/assets/index.css";

import "@src/styles/drawer.css";
import "@src/styles/globals.css";
import "@src/styles/hljs.css";
import "@src/styles/intercom.css";
import "@src/styles/keyframes.css";
import "@src/styles/modal.css";
import "@src/styles/starry-night.css";
import "@src/styles/tabs.css";
import "@src/styles/toaster.css";

import {
  Box,
  DefaultErrorMessage,
  ErrorBoundary,
  ThemeProvider,
  TooltipProvider,
} from "@prismicio/editor-ui";
import { ConnectedRouter } from "connected-next-router";
import type { NextPage } from "next";
import type { AppContext, AppInitialProps } from "next/app";
import dynamic from "next/dynamic";
import Head from "next/head";
import Router from "next/router";
import { type FC, type ReactNode, useEffect, useState, Suspense } from "react";
import { Provider } from "react-redux";
import type { Store } from "redux";
import type { Persistor } from "redux-persist/es/types";
import { PersistGate } from "redux-persist/integration/react";
import { ThemeProvider as ThemeUIThemeProvider, useThemeUI } from "theme-ui";

import { AppLayout, AppLayoutContent } from "@components/AppLayout";
import { InAppGuideProvider } from "@src/features/inAppGuide/InAppGuideContext";
import { InAppGuideDialog } from "@src/features/inAppGuide/InAppGuideDialog";

import SliceMachineApp from "../components/App";
import LoadingPage from "../components/LoadingPage";
import ToastContainer from "../components/ToasterContainer";
import { normalizeFrontendCustomTypes } from "../lib/models/common/normalizers/customType";
import type ServerState from "../lib/models/server/ServerState";
import { RouteChangeProvider } from "../src/hooks/useRouteChange";
import configureStore from "../src/redux/store";
import { getState } from "../src/apiClient";
import theme from "../src/theme";

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
                        onError={(error) => {
                          console.error(
                            "An error occurred while rendering the app",
                            error,
                          );
                        }}
                        renderError={() => (
                          <AppLayout>
                            <AppLayoutContent>
                              <Box alignItems="center" justifyContent="center">
                                <DefaultErrorMessage
                                  title="Error"
                                  description="An error occurred while rendering the app."
                                />
                              </Box>
                            </AppLayoutContent>
                          </AppLayout>
                        )}
                      >
                        <InAppGuideProvider>
                          <RouteChangeProvider>
                            <Suspense fallback={<LoadingPage />}>
                              <ComponentLayout>
                                <Component {...pageProps} />
                              </ComponentLayout>
                            </Suspense>
                          </RouteChangeProvider>
                          <ErrorBoundary
                            onError={(error) => {
                              console.error(
                                `An error occurred while rendering the in-app guide`,
                                error,
                              );
                            }}
                          >
                            <Suspense>
                              <InAppGuideDialog />
                            </Suspense>
                          </ErrorBoundary>
                        </InAppGuideProvider>
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
