import { useEffect } from "react";
import { useEnvironments } from "@src/features/environments/useEnvironments";

export function Environments() {
  const environments = useEnvironments();

  useEffect(() => {
    console.log({ environments });
  }, [environments]);

  return null;
}
