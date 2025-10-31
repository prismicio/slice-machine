import { managerClient } from "@/managerClient";

export async function getEnvironments() {
  try {
    const { environments } =
      await managerClient.prismicRepository.fetchEnvironments();

    return { environments };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    return { error: err };
  }
}
