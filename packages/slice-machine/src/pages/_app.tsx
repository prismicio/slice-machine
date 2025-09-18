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
import { useSuspenseQuery } from "@tanstack/react-query";
import { ConnectedRouter as StoreConnectedRouter } from "connected-next-router";
import type { NextPage } from "next";
import type { AppContext, AppInitialProps } from "next/app";
import dynamic from "next/dynamic";
import Head from "next/head";
import Router from "next/router";
import { type FC, type ReactNode, Suspense, useEffect } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { ThemeProvider as ThemeUIThemeProvider, useThemeUI } from "theme-ui";

import { getState } from "@/apiClient";
import { InfoBanner } from "@/features/communication/InfoBanner";
import { useActiveEnvironment } from "@/features/environments/useActiveEnvironment";
import { AppStateErrorBoundary } from "@/features/errorBoundaries";
import { AutoSyncProvider } from "@/features/sync/AutoSyncProvider";
import { RouteChangeProvider } from "@/hooks/useRouteChange";
import SliceMachineApp from "@/legacy/components/App";
import LoadingPage from "@/legacy/components/LoadingPage";
import ToastContainer from "@/legacy/components/ToasterContainer";
import { normalizeFrontendCustomTypes } from "@/legacy/lib/models/common/normalizers/customType";
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
  const { Component } = props;

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
                <AppStateErrorBoundary>
                  <Suspense fallback={<LoadingPage />}>
                    <AppStateValidator>
                      <AppStateWrapper>
                        <AutoSyncProvider>
                          <ComponentLayout>
                            <InfoBanner />
                            <Component {...props.pageProps} />
                          </ComponentLayout>
                        </AutoSyncProvider>
                      </AppStateWrapper>
                    </AppStateValidator>
                  </Suspense>
                </AppStateErrorBoundary>
                <ToastContainer />
              </TooltipProvider>
            </ThemeProvider>
          </RemoveDarkMode>
        </QueryClientProvider>
      </ThemeUIThemeProvider>
    </>
  );
}

/** This is where we should check for unwanted states that should prevent the
 * user from using the app, and trigger the {@link AppStateErrorBoundary} to
 * display something explaining why. */
function AppStateValidator(props: { children: ReactNode }) {
  const activeEnvironment = useActiveEnvironment({ suspense: true });

  if (
    // We're using the fetchEnvironments request to check this because it can
    // return an SMUnauthorizedError or SMInvalidActiveEnvironmentError
    // according to the API response, so we handle both cases with just one
    // request. We also perform the request in other parts of the app, so it can
    // reuse its cache.
    isUnauthorizedError(activeEnvironment.error) ||
    isInvalidActiveEnvironmentError(activeEnvironment.error)
  ) {
    throw activeEnvironment.error;
  }

  return <>{props.children}</>;
}

function AppStateWrapper({ children }: { children: ReactNode }) {
  const { data: state } = useSuspenseQuery({
    queryKey: ["getInitialState"],
    queryFn: async () => {
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

      return { serverState, store, persistor };
    },
    // avoid refetching
    staleTime: Infinity,
    gcTime: Infinity,
  });

  return (
    <Provider store={state.store}>
      <StoreConnectedRouter Router={Router}>
        <PersistGate loading={null} persistor={state.persistor}>
          <RouteChangeProvider>{children}</RouteChangeProvider>
        </PersistGate>
      </StoreConnectedRouter>
    </Provider>
  );
}

export default dynamic(() => Promise.resolve(App), { ssr: false });
