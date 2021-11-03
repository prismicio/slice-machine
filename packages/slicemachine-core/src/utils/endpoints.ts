interface Endpoints {
  Dashboard: {
    index: string;
    cliLogin: string;
    cliSignup: string;
  };
}

export function buildEndpoints(base: string): Endpoints {
  const endpoint = (path: string) => `${base}${path}`;

  return {
    Dashboard: {
      index: endpoint("/dashboard"),
      cliLogin: endpoint("/dashboard/cli/login"),
      cliSignup: endpoint("/dashboard/cli/signup"),
    },
  };
}

export type Base = `${"http" | "https"}://${string}${"/" | ""}`;
export type ApiEndpoint = `https://${string}/api/v2`;

export function extractDomainFromBase(base: Base): string {
  const withoutHttp = base.split("://")[1];
  const result = withoutHttp.split("/")[0];
  return result;
}

export function buildRepositoryEndpoint(base: Base, domain: string): string {
  return `https://${domain}.${extractDomainFromBase(base)}/api/v2`;
}
