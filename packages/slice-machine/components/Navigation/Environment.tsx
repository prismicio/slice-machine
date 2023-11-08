import { useEnvironments } from "@src/features/environments/useEnvironments";
import { SideNavEnvironmentSelector } from "@src/components/SideNav";
import { useRepositoryName } from "@src/features/repository/useRepositoryName";

export function Environment() {
  const { environments, activeEnvironmentDomain, setEnvironment } =
    useEnvironments();
  const repositoryName = useRepositoryName();

  return (
    <SideNavEnvironmentSelector
      environments={environments}
      activeEnvironmentDomain={activeEnvironmentDomain}
      productionEnvironmentDomain={repositoryName}
      onSelect={async (environment) => {
        await setEnvironment(environment);
      }}
    />
  );
}
