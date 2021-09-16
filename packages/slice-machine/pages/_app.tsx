import Head from "next/head";
import React, { useCallback, useEffect, useState } from "react";
import useSwr from "swr";
import App, { AppContext } from "next/app";

import theme from "../src/theme";
// @ts-ignore
import { ThemeProvider, BaseStyles, useThemeUI } from "theme-ui";

import LibrariesProvider from "../src/models/libraries/context";
import CustomTypesProvider from "../src/models/customTypes/context";
import { SliceHandler } from "../src/models/slice/context";
import ConfigProvider from "../src/config-context";

import Drawer from "rc-drawer";

import LoadingPage from "../components/LoadingPage";
import ConfigErrors from "../components/ConfigErrors";
import Warnings from "../components/Warnings";
import AppLayout from "../components/AppLayout";
import ToastProvider from "../src/ToastProvider";

import "react-tabs/style/react-tabs.css";
import "rc-drawer/assets/index.css";
import "lib/builders/SliceBuilder/layout/Drawer/index.css";
import "react-datepicker/dist/react-datepicker.css";
import "src/css/modal.css";
import "src/css/tabs.css";

import { ServerState } from "../lib/models/server/ServerState";
import ServerError from "../lib/models/server/ServerError";
import { Library } from "../lib/models/common/Library";
import Environment from "../lib/models/common/Environment";
import Slice from "../lib/models/common/Slice";
import { CustomType, ObjectTabs } from "../lib/models/common/CustomType";
import { AsObject } from "../lib/models/common/Variation";
import { useRouter } from "next/router";

async function fetcher(url: string): Promise<any> {
  return fetch(url).then((res) => res.json());
}

function mapSlices(libraries: ReadonlyArray<Library>): any {
  return (libraries || []).reduce((acc, lib) => {
    return {
      ...acc,
      ...lib.components.reduce(
        (acc, comp) => ({
          ...acc,
          [`${comp.from}:${comp.infos.sliceName}`]: 1,
        }),
        {}
      ),
    };
  }, {});
}

const RemoveDarkMode = ({ children }: { children: React.ReactElement }) => {
  const { setColorMode } = useThemeUI();
  useEffect(() => {
    if (setColorMode) {
      setColorMode("light");
    }
  }, []);

  return children;
};

const RenderStates = {
  Loading: () => <LoadingPage />,
  Default: ({
    Component,
    pageProps,
    ...rest
  }: {
    Component: (props: any) => JSX.Element;
    pageProps: any;
    rest: any;
  }) => <Component {...pageProps} {...rest} />,
  ConfigError: ({
    configErrors,
  }: {
    configErrors: { [errorKey: string]: ServerError };
  }) => <ConfigErrors errors={configErrors} />,
};

function MyApp({
  Component,
  pageProps,
}: {
  Component: (props: any) => JSX.Element;
  pageProps: any;
}) {
  const { data }: { data?: ServerState } = useSwr("/api/state", fetcher);
  const [sliceMap, setSliceMap] = useState<any | null>(null);
  const [drawerState, setDrawerState] = useState<{
    open: boolean;
    priority?: any;
  }>({ open: false });
  const [state, setRenderer] = useState<{
    Renderer: (props: any) => JSX.Element;
    payload: {
      env: Environment;
      libraries?: ReadonlyArray<Library>;
      customTypes?: ReadonlyArray<CustomType<ObjectTabs>>;
      remoteCustomTypes?: ReadonlyArray<CustomType<ObjectTabs>>;
      remoteSlices?: ReadonlyArray<Slice<AsObject>>;
    } | null;
  }>({ Renderer: RenderStates.Loading, payload: null });

  const openPanel = useCallback(
    (priority?: any) =>
      setDrawerState({
        ...drawerState,
        open: true,
        ...(priority ? { priority } : null),
      }),
    []
  );

  useEffect(() => {
    if (!data) {
      return;
    }
    const newSliceMap = mapSlices(data.libraries);
    if (sliceMap !== null) {
      Object.keys(newSliceMap).forEach((key) => {
        if (!sliceMap[key]) {
          // const [from, sliceName] = key.split(':')
          return (window.location.href = `/slices`);
        }
      });
    }
    setSliceMap(newSliceMap);
    setRenderer({ Renderer: RenderStates.Default, payload: data });
    const { env, configErrors, warnings } = data;
    console.log("------ SliceMachine log ------");
    console.log("Loaded libraries: ", { libraries: data.libraries });
    console.log("Loaded env: ", { env, configErrors });
    console.log("Warnings: ", { warnings });
    console.log("------ End of log ------");
  }, [data]);

  const { Renderer, payload } = state;

  const router = useRouter();

  useEffect(() => {
    if (data && !data.env.hasConfigFile && router.pathname !== "/onboarding") {
      // router.replace('/onboarding')
    }
  }, [data]);

  return (
    <ThemeProvider theme={theme}>
      <Head>
        <title>SliceMachine</title>
      </Head>
      <BaseStyles>
        <RemoveDarkMode>
          {!data ? (
            <Renderer {...payload} />
          ) : (
            <ConfigProvider value={data}>
              {!payload || !payload.libraries ? (
                <Renderer
                  Component={Component}
                  pageProps={pageProps}
                  {...payload}
                  openPanel={openPanel}
                />
              ) : (
                <LibrariesProvider
                  remoteSlices={payload.remoteSlices}
                  libraries={payload.libraries}
                  env={payload.env}
                >
                  <CustomTypesProvider
                    customTypes={payload.customTypes}
                    remoteCustomTypes={payload.remoteCustomTypes}
                  >
                    <ToastProvider>
                      <AppLayout {...payload} data={data}>
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
                              setDrawerState({ ...drawerState, open: false })
                            }
                          >
                            <Warnings
                              priority={drawerState.priority}
                              list={data.warnings}
                              configErrors={data.configErrors}
                            />
                          </Drawer>
                        </SliceHandler>
                      </AppLayout>
                    </ToastProvider>
                  </CustomTypesProvider>
                </LibrariesProvider>
              )}
            </ConfigProvider>
          )}
        </RemoveDarkMode>
      </BaseStyles>
    </ThemeProvider>
  );
}

MyApp.getInitialProps = async (appContext: AppContext) => {
  return await App.getInitialProps(appContext);
};

export default MyApp;
