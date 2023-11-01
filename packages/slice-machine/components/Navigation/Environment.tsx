import { useEnvironments } from "@src/features/environments/useEnvironments";
import { SideNavEnvironmentSelector } from "@src/components/SideNav";

export function Environment() {
  const environments = useEnvironments();

  return (
    <SideNavEnvironmentSelector
      environments={environments}
      activeEnvironmentDomain="example-prismic-repo"
      onSelect={(environment) => {
        console.log(environment);
      }}
    />
  );
}
