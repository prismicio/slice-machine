import type { FC, ReactNode } from "react";
import { useSelector } from "react-redux";
import { BaseStyles } from "theme-ui";

import { AppLayout, AppLayoutContent } from "@components/AppLayout";
import LoginModal from "@components/LoginModal";
import ReviewModal from "@components/ReviewModal";
import { MissingLibraries } from "@components/MissingLibraries";
import useServerState from "@src/hooks/useServerState";
import { SliceMachineStoreType } from "@src/redux/type";
import { getLibraries } from "@src/modules/slices";
import useSMTracker from "@src/hooks/useSMTracker";
import { useChangelog } from "@src/hooks/useChangelog";

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
    <>
      {libraries.length > 0 ? (
        children
      ) : (
        <AppLayout>
          <AppLayoutContent>
            <BaseStyles>
              <MissingLibraries />
            </BaseStyles>
          </AppLayoutContent>
        </AppLayout>
      )}
      <LoginModal />
      <ReviewModal />
    </>
  );
};

export default SliceMachineApp;
