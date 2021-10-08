import { validate } from "@lib/env/client";

type ValidateResponse = {
  connected: boolean;
  reason: string;
};
export default async function handler(): Promise<ValidateResponse> {
  return validate();
}
