import { Slices, SliceSM } from "@slicemachine/core/build/models";
import axios from "axios";
import { logs } from "../../utils";
import type { ApiEndpoints } from "./endpoints";

export async function getRemoteSliceIds(
  customTypeApiEndpoint: ApiEndpoints["Models"],
  repository: string,
  authorization: string
): Promise<Array<string>> {
  return axios
    .get<Array<{ id: string }>>(customTypeApiEndpoint + "slices", {
      headers: {
        Authorization: authorization,
        repository,
      },
    })
    .then((res) => {
      return Array.isArray(res.data) ? res.data.map((model) => model.id) : [];
    });
}

async function sendModelToPrismic(
  repository: string,
  authorization: string,
  customTypesApiEndpoint: string,
  remoteSliceIds: Array<string>,
  model: SliceSM
): Promise<void> {
  const data = Slices.fromSM(model);
  const updateOrInsertUrl = `${customTypesApiEndpoint}slices/${
    remoteSliceIds.includes(model.id) ? "update" : "insert"
  }`;

  return axios
    .post(updateOrInsertUrl, data, {
      headers: {
        Authorization: authorization,
        repository,
      },
    })
    .then(() => {
      return;
    })
    .catch((err) => {
      if (axios.isAxiosError(err) && err.response) {
        logs.writeError(
          `SENDING SLICE ${model.id} | [${err.response.status}]: ${err.response.statusText}`
        );
      } else if (err instanceof Error) {
        logs.writeError(`SENDING SLICE ${model.id} ${err.message}`);
      } else {
        logs.writeError(`SENDING SLICE ${model.id} ${String(err)}`);
      }
    });
}

export async function sendManyModelsToPrismic(
  repository: string,
  authorization: string,
  customTypesApiEndpoint: string,
  remoteSliceIds: Array<string>,
  models: Array<SliceSM>
): Promise<void> {
  return Promise.all(
    models.map((model) =>
      sendModelToPrismic(
        repository,
        authorization,
        customTypesApiEndpoint,
        remoteSliceIds,
        model
      )
    )
  ).then(() => {
    return;
  });
}
