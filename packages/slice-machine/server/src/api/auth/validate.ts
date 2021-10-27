import { validate } from "@lib/env/client";

type ValidateResponse = {
  connected: boolean;
  reason: string;
  err?: any; // eslint-disable-line
};
export default async function handler(): Promise<ValidateResponse> {
  return validate();
}
