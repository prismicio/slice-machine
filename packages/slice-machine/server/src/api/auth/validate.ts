import { validate } from "@lib/env/client";

type ValidateResponse = {
  connected: boolean;
  reason: string;
  err?: any;
};
export default async function handler(): Promise<ValidateResponse> {
  return validate();
}
