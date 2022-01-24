import { validateUserAuth } from "../services/validateUserAuth";

type ValidateResponse = {
  connected: boolean;
  reason: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  err?: any;
};

export default async function handler(): Promise<ValidateResponse> {
  return validateUserAuth();
}
