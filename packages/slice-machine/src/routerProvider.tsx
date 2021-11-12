import React, { useEffect } from "react";

import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import { userHasDoneTheOnboarding } from "@src/modules/userContext";
import { useRouter } from "next/router";

const RouterProvider: React.FunctionComponent = ({ children }) => {
  const router = useRouter();

  const { isOnboarded } = useSelector((store: SliceMachineStoreType) => ({
    isOnboarded: userHasDoneTheOnboarding(store),
  }));

  useEffect(() => {
    if (!isOnboarded && router.pathname !== "/onboarding") {
      router.replace("/onboarding");
    }
  }, []);

  return <>{children}</>;
};

export default RouterProvider;
