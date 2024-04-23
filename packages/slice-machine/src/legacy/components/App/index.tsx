import type { FC, ReactNode } from "react";
import { useSelector } from "react-redux";
import { BaseStyles } from "theme-ui";

import useServerState from "@/hooks/useServerState";
import useSMTracker from "@/hooks/useSMTracker";
import { AppLayout, AppLayoutContent } from "@/legacy/components/AppLayout";
import LoginModal from "@/legacy/components/LoginModal";
import { MissingLibraries } from "@/legacy/components/MissingLibraries";
import { ReviewModal } from "@/legacy/components/ReviewModal";
import { getLibraries } from "@/modules/slices";
import { SliceMachineStoreType } from "@/redux/type";

type Props = Readonly<{
  children?: ReactNode;
}>;

const SliceMachineApp: FC<Props> = ({ children }) => {
  const { libraries } = useSelector((state: SliceMachineStoreType) => ({
    libraries: getLibraries(state),
  }));

  useSMTracker();
  useServerState();

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
