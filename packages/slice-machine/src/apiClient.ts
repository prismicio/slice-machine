const jsonHeaders = {
  Accept: "application/json",
  "Content-Type": "application/json",
};

/** Auth Routes **/

export const startAuth: () => Promise<Response> = async () =>
  await fetch("/api/auth/start", { headers: jsonHeaders, method: "POST" });

export const checkAuthStatus: () => Promise<Response> = async () => {
  const response = await fetch("/api/auth/status", {
    headers: jsonHeaders,
    method: "POST",
  });

  return response.json(); // eslint-disable-line
};
