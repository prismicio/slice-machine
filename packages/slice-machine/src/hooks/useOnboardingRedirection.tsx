import { useEffect } from "react";

import { useSelector } from "react-redux";
import { userHasDoneTheOnboarding } from "@src/modules/userContext";
import { useRouter } from "next/router";

const useOnboardingRedirection = (): void => {
  const router = useRouter();

  const isOnboarded = useSelector(userHasDoneTheOnboarding);

  useEffect((): void => {
    if (!isOnboarded && router.pathname !== "/onboarding") {
      router.replace("/onboarding");
    }
  }, []);

  return;
};

export default useOnboardingRedirection;
