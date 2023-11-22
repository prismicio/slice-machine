import { managerClient } from "@src/managerClient";

export async function getEnvironments() {
  try {
    return await managerClient.prismicRepository.fetchEnvironments();
  } catch (error) {
    throw error;
  }
}
