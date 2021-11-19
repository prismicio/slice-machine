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
import RatingModal from "@components/RatingModal";
import { AppPayload, ServerState } from "@models/server/ServerState";
import useOnboardingRedirection from "@src/hooks/useOnboardingRedirection";
import useServerState from "@src/hooks/useServerState";
import UpdateModal from "../UpdateModal";

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
  payload: AppPayload | null;
  pageProps: any; // This is coming from next
  Component: (props: any) => JSX.Element;
  Renderer: (props: any) => JSX.Element;
};

const SliceMachineApp: React.FunctionComponent<AppProps> = ({
  theme,
  serverState,
  payload,
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
            <Renderer {...payload} />
          ) : (
            <>
              {!payload || !payload.libraries ? (
                <Renderer
                  Component={Component}
                  pageProps={pageProps}
                  {...payload}
                  openPanel={openPanel}
                />
              ) : (
                <ToastProvider>
                  <LibrariesProvider
                    remoteSlices={payload.remoteSlices}
                    libraries={payload.libraries}
                    env={payload.env}
                  >
                    <CustomTypesProvider
                      customTypes={payload.customTypes}
                      remoteCustomTypes={payload.remoteCustomTypes}
                    >
                      <AppLayout {...payload} serverState={serverState}>
                        <SliceHandler {...payload}>
                          <Renderer
                            Component={Component}
                            pageProps={pageProps}
                            {...payload}
                            openPanel={openPanel}
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
                    </CustomTypesProvider>
                  </LibrariesProvider>
                  {<UpdateModal /> || <LoginModal />}
                  <RatingModal />
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
