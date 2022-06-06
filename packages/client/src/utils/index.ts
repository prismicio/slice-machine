import axios, { AxiosPromise } from "axios";
import * as t from "io-ts";
import { getOrElseW } from "fp-ts/Either";
import { ClientError, getStatus } from "../models/ClientError";

export function getAndValidateResponse<Expected>(
  getRequest: AxiosPromise,
  ressource: string,
  decoder: t.Decoder<unknown, Expected>
): Promise<Expected> {
  return getRequest
    .then((response) => {
      return getOrElseW(() =>
        Promise.reject(
          `Unable to parse ${ressource}: ${JSON.stringify(response.data)}`
        )
      )(decoder.decode(response.data));
    })
    .catch((error: Error | string) => {
      const status: number = typeof error == "string" ? 500 : getStatus(error);

      const message: string =
        axios.isAxiosError(error) && error.response
          ? `Unable to retrieve ${ressource} with status code ${error.response.status}`
          : typeof error == "string"
          ? error
          : `Unable to retrieve ${ressource}: ${error.message}`;

      // Making sure the error is typed
      const clientError: ClientError = { status, message };
      return Promise.reject(clientError);
    });
}
