import { managerClient } from "@src/managerClient";

export async function getActiveEnvironmentDomain() {
  try {
    const { environment } = await managerClient.project.readEnvironment();

    return { activeEnvironmentDomain: environment };
  } catch (error) {
    return { error };
  }
}
