import useServerState from "@src/hooks/useServerState";
import useSMTracker from "@src/hooks/useSMTracker";
import { getLibraries } from "@src/modules/slices";
import { SliceMachineStoreType } from "@src/redux/type";
import type { FC, ReactNode } from "react";
import { useSelector } from "react-redux";
import { BaseStyles } from "theme-ui";

import { AppLayout, AppLayoutContent } from "@/legacy/components/AppLayout";
import LoginModal from "@/legacy/components/LoginModal";
import { MissingLibraries } from "@/legacy/components/MissingLibraries";
import { ReviewModal } from "@/legacy/components/ReviewModal";

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
