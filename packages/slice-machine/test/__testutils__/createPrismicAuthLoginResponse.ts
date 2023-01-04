type PrismicAuthLoginResponse = {
  email: string;
  cookies: string[];
};

export const createPrismicAuthLoginResponse = (
  loginResponse?: Partial<PrismicAuthLoginResponse>
): PrismicAuthLoginResponse => {
  return {
    email: `name@example.com`,
    cookies: ["prismic-auth=token", "SESSION=session"],
    ...loginResponse,
  };
};
