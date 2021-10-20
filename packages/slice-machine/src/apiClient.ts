const jsonHeaders = {
  Accept: "application/json",
  "Content-Type": "application/json",
};

/** Auth Routes **/

export const startAuth = async () =>
  await fetch("/api/auth/start", { headers: jsonHeaders, method: "POST" });

export const checkAuthStatus = async () => {
  const response = await fetch("/api/auth/status", {
    headers: jsonHeaders,
    method: "POST",
  });

  return response.json();
};
