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
      index: endpoint("dashboard"),
      cliLogin: endpoint("dashboard/cli/login?source=slice-machine"),
      cliSignup: endpoint("dashboard/cli/signup?source=slice-machine"),
    },
  };
}
