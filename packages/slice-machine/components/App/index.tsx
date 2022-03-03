import React from "react";

import LibrariesProvider from "@src/models/libraries/context";
import { SliceHandler } from "@src/models/slice/context";

import AppLayout from "../AppLayout";

import LoginModal from "@components/LoginModal";
import ReviewModal from "@components/ReviewModal";
import useOnboardingRedirection from "@src/hooks/useOnboardingRedirection";
import useServerState from "@src/hooks/useServerState";
import { MissingLibraries } from "@components/MissingLibraries";
import ToastContainer from "@components/ToasterContainer";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import { getEnvironment } from "@src/modules/environment";
import { getLibraries, getRemoteSlices } from "@src/modules/slices";
import useSMTracker from "@src/hooks/useSMTracker";

const SliceMachineApp: React.FunctionComponent = ({ children }) => {
  const { env, libraries, remoteSlices } = useSelector(
    (state: SliceMachineStoreType) => ({
      libraries: getLibraries(state),
      remoteSlices: getRemoteSlices(state),
      env: getEnvironment(state),
    })
  );

  useSMTracker();
  useOnboardingRedirection();
  useServerState();

  return (
    <LibrariesProvider
      remoteSlices={remoteSlices}
      libraries={libraries}
      env={env}
    >
      <AppLayout>
        <SliceHandler>
          {libraries?.length ? <>{children}</> : <MissingLibraries />}
        </SliceHandler>
      </AppLayout>
      <LoginModal />
      <ReviewModal />
      <ToastContainer />
    </LibrariesProvider>
  );
};

export default SliceMachineApp;
