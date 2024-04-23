import { managerClient } from "@/managerClient";

export async function getEnvironments() {
  try {
    const { environments } =
      await managerClient.prismicRepository.fetchEnvironments();

    return { environments };
  } catch (error) {
    return { error };
  }
}
