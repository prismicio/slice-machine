import type { FC, ReactNode } from "react";

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
import { getLibraries } from "@src/modules/slices";
import useSMTracker from "@src/hooks/useSMTracker";

type Props = Readonly<{
  children?: ReactNode;
}>;

const SliceMachineApp: FC<Props> = ({ children }) => {
  const { libraries } = useSelector((state: SliceMachineStoreType) => ({
    libraries: getLibraries(state),
  }));

  useSMTracker();
  useOnboardingRedirection();
  useServerState();

  return (
    <>
      <AppLayout>
        <SliceHandler>
          {libraries?.length ? <>{children}</> : <MissingLibraries />}
        </SliceHandler>
      </AppLayout>
      <LoginModal />
      <ReviewModal />
      <ToastContainer />
    </>
  );
};

export default SliceMachineApp;
