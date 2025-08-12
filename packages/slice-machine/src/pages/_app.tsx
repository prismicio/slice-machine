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
  BlankSlate,
  BlankSlateDescription,
  BlankSlateIcon,
  BlankSlateTitle,
  Box,
  DefaultErrorMessage,
  Text,
  ThemeProvider,
  TooltipProvider,
} from "@prismicio/editor-ui";
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
  BareErrorBoundary,
  ErrorBoundary as EditorErrorBoundary,
} from "@/ErrorBoundary";
import { LogoutButton } from "@/features/auth/LogoutButton";
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
                <BareErrorBoundary
                  renderError={() => (
                    <Box justifyContent="center" width="100%" padding={80}>
                      <DefaultErrorMessage
                        title="Error"
                        description="An error occurred while rendering the app."
                      />
                    </Box>
                  )}
                >
                  <Suspense fallback={<LoadingPage />}>
                    <AppStateWrapper>
                      <ComponentLayout>
                        <Component {...pageProps} />
                      </ComponentLayout>
                    </AppStateWrapper>
                  </Suspense>
                </BareErrorBoundary>
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
      <EditorErrorBoundary
        renderError={(error) => {
          return (
            <Box
              position="absolute"
              top={64}
              width="100%"
              justifyContent="center"
              flexDirection="column"
            >
              <BlankSlate>
                <BlankSlateIcon
                  lineColor="tomato11"
                  backgroundColor="tomato3"
                  name="alert"
                />
                <BlankSlateTitle>Failed to load Slice Machine</BlankSlateTitle>
                <RenderErrorDescription error={error} />
              </BlankSlate>
            </Box>
          );
        }}
      >
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
      </EditorErrorBoundary>
    </Provider>
  );
}

function RenderErrorDescription(args: { error: unknown }) {
  const { error } = args;

  if (isUnauthorizedError(error)) {
    return (
      <Box flexDirection="column" gap={16} margin={{ top: 8 }}>
        <Box flexDirection="column" gap={8} alignItems="center">
          <Text variant="h3" align="center">
            It seems like you don't have access to this repository
          </Text>
          <Text align="center">
            Check that the repository name is correct, then contact your
            repository administrator.
          </Text>
        </Box>
        <LogoutButton
          onLogoutSuccess={() => window.location.reload()}
          invalidateOnSuccess={false}
          sx={{ alignSelf: "center" }}
        >
          Log out
        </LogoutButton>
      </Box>
    );
  }

  return <BlankSlateDescription>{JSON.stringify(error)}</BlankSlateDescription>;
}

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
