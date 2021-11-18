import { useEffect } from "react";

import { useSelector } from "react-redux";
import { userHasDoneTheOnboarding } from "@src/modules/userContext";
import { useRouter } from "next/router";

const useOnboardingRedirection = () => {
  const router = useRouter();

  const isOnboarded = useSelector(userHasDoneTheOnboarding);

  useEffect(() => {
    if (!isOnboarded && router.pathname !== "/onboarding") {
      router.replace("/onboarding");
    }
  }, []);

  return;
};

export default useOnboardingRedirection;
