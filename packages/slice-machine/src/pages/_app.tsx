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

import { ThemeProvider, TooltipProvider } from "@prismicio/editor-ui";
import {
  isInvalidActiveEnvironmentError,
  isUnauthorizedError,
} from "@slicemachine/manager/client";
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
import {
  AppStateErrorBoundary,
  FallbackErrorBoundary,
} from "@/errorBoundaries";
import { useActiveEnvironment } from "@/features/environments/useActiveEnvironment";
import { AutoSyncProvider } from "@/features/sync/AutoSyncProvider";
import { RouteChangeProvider } from "@/hooks/useRouteChange";
import SliceMachineApp from "@/legacy/components/App";
import LoadingPage from "@/legacy/components/LoadingPage";
import ToastContainer from "@/legacy/components/ToasterContainer";
import { normalizeFrontendCustomTypes } from "@/legacy/lib/models/common/normalizers/customType";
import type ServerState from "@/legacy/lib/models/server/ServerState";
import { QueryClientProvider } from "@/queryClient";
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

function App(props: AppContextWithComponentLayout & AppInitialProps) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { Component, pageProps } = props;

  const ComponentLayout = Component.CustomLayout ?? SliceMachineApp;

  return (
    <>
      <Head>
        <title>Slice Machine</title>
      </Head>
      <ThemeUIThemeProvider theme={theme}>
        <QueryClientProvider>
          <RemoveDarkMode>
            <ThemeProvider mode="light">
              <TooltipProvider>
                <FallbackErrorBoundary>
                  <Suspense fallback={<LoadingPage />}>
                    <AppStateWrapper>
                      <ComponentLayout>
                        <Component {...pageProps} />
                      </ComponentLayout>
                    </AppStateWrapper>
                  </Suspense>
                </FallbackErrorBoundary>
              </TooltipProvider>
            </ThemeProvider>
          </RemoveDarkMode>
        </QueryClientProvider>
      </ThemeUIThemeProvider>
    </>
  );
}

interface AppState {
  serverState: ServerState;
  store: Store;
  persistor: Persistor;
}

function AppStateWrapper({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>();

  useEffect(() => {
    async function getInitialState() {
      const serverState = await getState();

      const { store, persistor } = configureStore({
        environment: serverState.env,
        availableCustomTypes: {
          ...normalizeFrontendCustomTypes(
            serverState.customTypes,
            serverState.remoteCustomTypes,
          ),
        },
        slices: {
          libraries: serverState.libraries,
          remoteSlices: serverState.remoteSlices,
        },
      });

      setState({ serverState, store, persistor });
    }

    void getInitialState();
  }, []);

  if (state === undefined) {
    return <LoadingPage />;
  }

  return (
    <Provider store={state.store}>
      <AppStateErrorBoundary>
        <Suspense fallback={<LoadingPage />}>
          <AppStateValidator>
            <ConnectedRouter Router={Router}>
              <PersistGate loading={null} persistor={state.persistor}>
                <AutoSyncProvider>
                  <RouteChangeProvider>{children}</RouteChangeProvider>
                </AutoSyncProvider>
              </PersistGate>
            </ConnectedRouter>
          </AppStateValidator>
          <ToastContainer />
        </Suspense>
      </AppStateErrorBoundary>
    </Provider>
  );
}

/** This is where we should check for unwanted states that should prevent the
 * user from using the app, and trigger the {@link AppStateErrorBoundary} to
 * display something explaining why. */
function AppStateValidator(props: { children: ReactNode }) {
  const activeEnvironment = useActiveEnvironment({ suspense: true });

  if (
    isUnauthorizedError(activeEnvironment.error) ||
    isInvalidActiveEnvironmentError(activeEnvironment.error)
  ) {
    throw activeEnvironment.error;
  }

  return <>{props.children}</>;
}

export default dynamic(() => Promise.resolve(App), { ssr: false });
