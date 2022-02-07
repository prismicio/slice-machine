import { validateUserAuth } from "../services/validateUserAuth";

type ValidateResponse = {
  connected: boolean;
  reason: string;
};

export default async function handler(): Promise<ValidateResponse> {
  return validateUserAuth();
}
