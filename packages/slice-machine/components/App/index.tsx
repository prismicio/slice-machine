import React, { useEffect } from "react";

import { ThemeProvider, BaseStyles, useThemeUI, Theme } from "theme-ui";

import LibrariesProvider from "@src/models/libraries/context";
import CustomTypesProvider from "@src/models/customTypes/context";
import { SliceHandler } from "@src/models/slice/context";

import AppLayout from "../AppLayout";
import ToastProvider from "../../src/ToastProvider";

import LoginModal from "@components/LoginModal";
import ReviewModal from "@components/ReviewModal";
import ServerState from "@models/server/ServerState";
import useOnboardingRedirection from "@src/hooks/useOnboardingRedirection";
import useServerState from "@src/hooks/useServerState";
import UpdateVersionModal from "../UpdateVersionModal";

const RemoveDarkMode = ({ children }: { children: React.ReactElement }) => {
  const { setColorMode } = useThemeUI();
  useEffect(() => {
    if (setColorMode) {
      setColorMode("light");
    }
  }, []);

  return children;
};

type AppProps = {
  theme: () => Theme;
  serverState: ServerState | undefined;
  pageProps: any; // This is coming from next
  Component: (props: any) => JSX.Element;
  Renderer: (props: any) => JSX.Element;
};

const SliceMachineApp: React.FunctionComponent<AppProps> = ({
  theme,
  serverState,
  pageProps,
  Component,
  Renderer,
}) => {
  useOnboardingRedirection();
  useServerState(serverState);

  return (
    <ThemeProvider theme={theme}>
      <BaseStyles>
        <RemoveDarkMode>
          {!serverState ? (
            <Renderer {...serverState} />
          ) : (
            <>
              {!serverState || !serverState.libraries ? (
                <Renderer
                  Component={Component}
                  pageProps={pageProps}
                  {...serverState}
                />
              ) : (
                <ToastProvider>
                  <LibrariesProvider
                    remoteSlices={serverState.remoteSlices}
                    libraries={serverState.libraries}
                    env={serverState.env}
                  >
                    <CustomTypesProvider
                      customTypes={serverState.customTypes}
                      remoteCustomTypes={serverState.remoteCustomTypes}
                    >
                      <AppLayout>
                        <SliceHandler {...serverState}>
                          <Renderer
                            Component={Component}
                            pageProps={pageProps}
                            {...serverState}
                          />
                        </SliceHandler>
                      </AppLayout>
                      <UpdateVersionModal />
                      <LoginModal />
                      <ReviewModal />
                    </CustomTypesProvider>
                  </LibrariesProvider>
                </ToastProvider>
              )}
            </>
          )}
        </RemoveDarkMode>
      </BaseStyles>
    </ThemeProvider>
  );
};

export default SliceMachineApp;
