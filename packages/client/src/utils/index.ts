import axios, { AxiosPromise } from 'axios';
import * as t from 'io-ts';
import { getOrElseW } from "fp-ts/Either";

export function getAndValidateResponse<Expected>(
  getRequest: AxiosPromise,
  ressource: string,
  decoder: t.Decoder<unknown, Expected>
): Promise<Expected> {
  return getRequest
    .then(response => {
      return getOrElseW(() =>
        Promise.reject(`Unable to parse ${ressource}: ${JSON.stringify(response.data)}`)
      )(decoder.decode(response.data));
    })
    .catch((error: Error) => {
      if (axios.isAxiosError(error) && error.response) return Promise.reject(`Unable to retrieve ${ressource} with status code ${error.response.status}`);
      else return Promise.reject(`Unable to retrieve ${ressource}: ${error.message}`);
    });
};