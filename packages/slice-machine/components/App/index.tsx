import type { FC, ReactNode } from "react";
import { useSelector } from "react-redux";
import { BaseStyles } from "theme-ui";
import dynamic from "next/dynamic";

import LoginModal from "@components/LoginModal";
import ReviewModal from "@components/ReviewModal";
import { MissingLibraries } from "@components/MissingLibraries";
import ToastContainer from "@components/ToasterContainer";
import { SliceHandler } from "@src/models/slice/context";
import useServerState from "@src/hooks/useServerState";
import { SliceMachineStoreType } from "@src/redux/type";
import { getLibraries } from "@src/modules/slices";
import useSMTracker from "@src/hooks/useSMTracker";
import { useChangelog } from "@src/hooks/useChangelog";

import AppLayout from "../AppLayout";

// TODO: Remove this dynamic import when we have a proper solution to have sprinkles load first
// Maybe related to https://github.com/vanilla-extract-css/vanilla-extract/pull/1105
const Navigation = dynamic(() => import("@components/AppLayout/Navigation"));

type Props = Readonly<{
  children?: ReactNode;
}>;

const SliceMachineApp: FC<Props> = ({ children }) => {
  const { libraries } = useSelector((state: SliceMachineStoreType) => ({
    libraries: getLibraries(state),
  }));

  useSMTracker();
  useServerState();
  useChangelog();

  return (
    <div style={{ display: "flex" }}>
      <Navigation />
      <BaseStyles style={{ flex: "auto" }}>
        <AppLayout>
          <SliceHandler>
            {libraries?.length ? <>{children}</> : <MissingLibraries />}
          </SliceHandler>
        </AppLayout>
        <LoginModal />
        <ReviewModal />
        <ToastContainer />
      </BaseStyles>
    </div>
  );
};

export default SliceMachineApp;
