import React, { useCallback, useEffect, useState } from "react";

import { ThemeProvider, BaseStyles, useThemeUI, Theme } from "theme-ui";

import LibrariesProvider from "@src/models/libraries/context";
import CustomTypesProvider from "@src/models/customTypes/context";
import { SliceHandler } from "@src/models/slice/context";

import Drawer from "rc-drawer";

import Warnings from "../Warnings";
import AppLayout from "../AppLayout";
import ToastProvider from "../../src/ToastProvider";

import LoginModal from "@components/LoginModal";
import ReviewModal from "@components/ReviewModal";
import { ServerState } from "@models/server/ServerState";
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
  const [drawerState, setDrawerState] = useState<{
    open: boolean;
    priority?: any;
  }>({ open: false });

  const openPanel = useCallback(
    (priority?: any) =>
      setDrawerState({
        ...drawerState,
        open: true,
        ...(priority ? { priority } : null),
      }),
    []
  );

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
                  openPanel={openPanel}
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
                            openPanel={openPanel}
                            {...serverState}
                          />
                          <Drawer
                            placement="right"
                            open={drawerState.open}
                            onClose={() =>
                              setDrawerState({
                                ...drawerState,
                                open: false,
                              })
                            }
                          >
                            <Warnings
                              priority={drawerState.priority}
                              list={serverState.warnings}
                              configErrors={serverState.configErrors}
                            />
                          </Drawer>
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
