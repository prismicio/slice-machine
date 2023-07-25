import type { FC, ReactNode } from "react";
import { useSelector } from "react-redux";
import { BaseStyles } from "theme-ui";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";

import LoginModal from "@components/LoginModal";
import ReviewModal from "@components/ReviewModal";
import { MissingLibraries } from "@components/MissingLibraries";
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

// TODO: Remove when we can move back <Navigation /> in AppLayout
const AsIs: { [x: string]: boolean } = {
  "/[lib]/[sliceName]/[variation]/simulator": true,
};

type Props = Readonly<{
  children?: ReactNode;
}>;

const SliceMachineApp: FC<Props> = ({ children }) => {
  const router = useRouter();
  const isSimulator = AsIs[router.asPath] || AsIs[router.pathname];
  const { libraries } = useSelector((state: SliceMachineStoreType) => ({
    libraries: getLibraries(state),
  }));

  useSMTracker();
  useServerState();
  useChangelog();

  return (
    <div style={!isSimulator ? { display: "flex" } : undefined}>
      {!isSimulator && <Navigation />}
      <BaseStyles style={{ flex: "auto" }}>
        <AppLayout>
          <SliceHandler>
            {libraries?.length ? <>{children}</> : <MissingLibraries />}
          </SliceHandler>
        </AppLayout>
        <LoginModal />
        <ReviewModal />
      </BaseStyles>
    </div>
  );
};

export default SliceMachineApp;
