/** Status Auth routes SM API contract */

export type CheckAuthStatusResponse = {
  status: "error" | "ok" | "pending";
  shortId?: string;
  intercomHash?: string;
};
