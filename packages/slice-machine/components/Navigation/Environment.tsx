import { useEffect } from "react";

import { useEnvironments } from "@src/features/environments/useEnvironments";
import { SideNavEnvironmentSelector } from "@src/components/SideNav";

export function Environment() {
  const environments = useEnvironments();

  useEffect(() => {
    console.log({ environments });
  }, [environments]);

  return (
    <SideNavEnvironmentSelector
      environments={[
        {
          name: "Production",
          domain: "example-prismic-repo",
          kind: "prod",
        },
        {
          name: "Staging",
          domain: "example-prismic-repo-staging",
          kind: "stage",
        },
        {
          name: "Development",
          domain: "example-prismic-repo-development",
          kind: "dev",
        },
      ]}
      activeEnvironmentDomain="example-prismic-repo"
    />
  );
}
