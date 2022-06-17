import { CustomType } from "@prismicio/types-internal/lib/customtypes";
import { Slices, SliceSM } from "@slicemachine/core/build/models";
import axios from "axios";
import { logs } from "../../utils";
import type { ApiEndpoints } from "./endpoints";

export function handleErrors(prefix: string, err: unknown) {
  if (axios.isAxiosError(err) && err.response) {
    logs.writeError(
      `${prefix} | [${err.response.status}]: ${err.response.statusText}`
    );
  } else if (err instanceof Error) {
    logs.writeError(`${prefix} ${err.message}`);
  } else {
    logs.writeError(`${prefix} ${String(err)}`);
  }
}

export async function getRemoteSliceIds(
  customTypeApiEndpoint: ApiEndpoints["Models"],
  repository: string,
  authorization: string
): Promise<Array<string>> {
  const addr = `${stripLastSlash(customTypeApiEndpoint)}/slices`;
  return axios
    .get<Array<{ id: string }>>(addr, {
      headers: {
        Authorization: `Bearer ${authorization}`,
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
        Authorization: `Bearer ${authorization}`,
        repository,
      },
    })
    .then(() => {
      return;
    })
    .catch((err) => {
      handleErrors(
        `sending slice ${model.id},  please try again. If the problem persists, contact us.`,
        err
      );
      throw err;
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
  )
    .then(() => {
      return;
    })
    .catch(() => {
      process.exit(1);
    });
}

function stripLastSlash(str: string) {
  return str.replace(/\/*$/g, "");
}

export function getRemoteCustomTypeIds(
  customTypeApiEndpoint: ApiEndpoints["Models"],
  repository: string,
  authorization: string
): Promise<Array<string>> {
  const addr = `${stripLastSlash(customTypeApiEndpoint)}/customtypes`;
  return axios
    .get<CustomType[]>(addr, {
      headers: {
        Authorization: `Bearer ${authorization}`,
        repository,
      },
    })
    .then((res) => {
      return Array.isArray(res.data) ? res.data.map((ct) => ct.id) : [];
    });
}

async function sendCustomTypeToPrismic(
  repository: string,
  authorization: string,
  customTypeApiEndpoint: string,
  remoteCustomTypeIds: Array<string>,
  customType: CustomType
): Promise<void> {
  const shouldUpdate = remoteCustomTypeIds.includes(customType.id);
  const addr = `${stripLastSlash(customTypeApiEndpoint)}/customtypes/${
    shouldUpdate ? "update" : "insert"
  }`;

  return axios
    .post(addr, customType, {
      headers: {
        repository,
        Authorization: `Bearer ${authorization}`,
      },
    })
    .then(() => {
      return;
    })
    .catch((err) => {
      handleErrors(
        `sending custom type ${customType.id}, please try again. If the problem persists, contact us.`,
        err
      );
      throw err;
    });
}

export async function sendManyCustomTypesToPrismic(
  repository: string,
  authorization: string,
  customTypeApiEndpoint: string,
  remoteCustomTypeIds: Array<string>,
  customTypes: Array<CustomType>
): Promise<void> {
  return Promise.all(
    customTypes.map((customType) =>
      sendCustomTypeToPrismic(
        repository,
        authorization,
        customTypeApiEndpoint,
        remoteCustomTypeIds,
        customType
      )
    )
  )
    .then(() => {
      return;
    })
    .catch(() => {
      process.exit(1);
    });
}
