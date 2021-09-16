import Auth from "./Auth";
import ErrorWithStatus from "./ErrorWithStatus";

export default interface PrismicData {
  base: string;
  auth?: Auth;
  authError?: ErrorWithStatus;
}
