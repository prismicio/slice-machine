import { validateUserAuth } from "../services/validateUserAuth";

type ValidateResponse = {
  connected: boolean;
  reason: string;
  err?: any;
};

export default async function handler(): Promise<ValidateResponse> {
  return validateUserAuth();
}
