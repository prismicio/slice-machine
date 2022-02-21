import React from "react";

import LibrariesProvider from "@src/models/libraries/context";
import { SliceHandler } from "@src/models/slice/context";

import AppLayout from "../AppLayout";

import LoginModal from "@components/LoginModal";
import ReviewModal from "@components/ReviewModal";
import ServerState from "@models/server/ServerState";
import useOnboardingRedirection from "@src/hooks/useOnboardingRedirection";
import useServerState from "@src/hooks/useServerState";
import { MissingLibraries } from "@components/MissingLibraries";
import ToastContainer from "@components/ToasterContainer";

type AppProps = {
  serverState: ServerState;
};

const SliceMachineApp: React.FunctionComponent<AppProps> = ({
  serverState,
  children,
}) => {
  useOnboardingRedirection();
  useServerState(serverState);

  return (
    <LibrariesProvider
      remoteSlices={serverState.remoteSlices}
      libraries={serverState.libraries}
      env={serverState.env}
    >
      <AppLayout>
        <SliceHandler {...serverState}>
          {serverState.libraries?.length ? (
            <>{children}</>
          ) : (
            <MissingLibraries />
          )}
        </SliceHandler>
      </AppLayout>
      <LoginModal />
      <ReviewModal />
      <ToastContainer />
    </LibrariesProvider>
  );
};

export default SliceMachineApp;
