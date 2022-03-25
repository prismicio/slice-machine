import { getBackendState } from "../state";
import { pushSlice } from "../slices/push";

import { onError } from "../common/error";
import Files from "@lib/utils/files";
import { CustomTypesPaths } from "@lib/models/paths";
import DefaultClient from "@lib/models/common/http/DefaultClient";
import FakeClient from "@lib/models/common/http/FakeClient";
import { ApiResult } from "@lib/models/server/ApiResult";

import { ComponentUI } from "@lib/models/common/ComponentUI";
import { Tab } from "@lib/models/common/CustomType/tab";
import { RequestWithEnv } from "../http/common";
import {
  CustomTypes,
  CustomTypeSM,
} from "@slicemachine/core/build/models/CustomType/index";

const createOrUpdate = (
  client: DefaultClient | FakeClient,
  smModel: CustomTypeSM,
  remoteCustomType: CustomTypeSM | undefined
) => {
  const model = CustomTypes.fromSM(smModel);
  if (remoteCustomType) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return client.updateCustomType(model);
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-argument
  return client.insertCustomType(model);
};

export default async function handler(req: RequestWithEnv): Promise<ApiResult> {
  const { id } = req.query;

  const state = await getBackendState(req.errors, req.env);

  if (!state.libraries) {
    const code = 400;
    const message = `Error ${code}: Slice libraries needs to be define in your sm.json file.`;

    return {
      err: new Error(message),
      reason: message,
      status: code,
    };
  }

  if (state.clientError || !state.env.isUserLoggedIn) {
    const isAnAuthenticationError =
      !state.env.isUserLoggedIn ||
      (state.clientError && state.clientError.status === 403);
    const errorExplanation = isAnAuthenticationError
      ? "Please log in to Prismic!"
      : // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        `You don\'t have access to the repo \"${state.env.repo}\"`;

    const errorCode = !state.env.isUserLoggedIn
      ? 403
      : state.clientError
      ? state.clientError.status
      : 403;
    const message = `Error ${errorCode}: Could not fetch remote custom types. ${errorExplanation}`;

    return {
      err: new Error(message),
      reason: message,
      status: errorCode,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const modelPath = CustomTypesPaths(state.env.cwd)
    .customType(id as string)
    .model();

  let model: CustomTypeSM;
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
    model = CustomTypes.toSM(Files.readJson(modelPath));
  } catch (e) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    const msg = `[custom-types/push] Model ${id} is invalid.`;
    console.error(msg);
    return onError(null, msg);
  }

  const remoteCustomType = state.remoteCustomTypes.find(
    (e: { id: string }) => e.id === id
  );
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  if (remoteCustomType && remoteCustomType.repeatable !== model.repeatable) {
    const msg = `[custom-types/push] Model not pushed: property "repeatable" in local Model differs from remote source`;
    console.error(msg);
    return onError(null, msg);
  }

  const sliceKeysToPush: string[] = [];
  for (const [, tab] of Object.entries(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
    model.tabs
  )) {
    const { sliceZone } = Tab.organiseFields(tab);
    if (sliceZone?.value) {
      sliceKeysToPush.push(...new Set(sliceZone.value.map((e) => e.key)));
    }
  }

  const localSlices: { [x: string]: ComponentUI } = state.libraries
    .filter((e) => e.isLocal)
    .reduceRight((acc, curr) => {
      return {
        ...acc,
        ...curr.components.reduce(
          (acc, curr) => ({
            ...acc,
            [curr.model.id]: curr,
          }),
          {}
        ),
      };
    }, {});

  for await (const sliceKey of sliceKeysToPush) {
    const slice = localSlices[sliceKey];
    if (slice) {
      try {
        console.log("[custom-types/push] Pushing slice", sliceKey);
        await pushSlice(state.env, state.remoteSlices, {
          sliceName: slice.model.name,
          from: slice.from,
        });
      } catch (e) {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        console.error(`[custom-types/push] Full error: ${e}`);
      }
    }
  }

  console.log("[custom-types/push] Pushing Custom Type...");

  const res = await createOrUpdate(state.env.client, model, remoteCustomType);
  if (res.status > 209) {
    const message = res.text ? await res.text() : res.status.toString();
    const msg = `[custom-types/push] Unexpected error returned. Server message: ${message}`;
    console.error(msg);
    return onError(null, msg);
  }

  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  console.log(`[custom-types/push] Custom Type ${id} was pushed!`);
  return {};
}
