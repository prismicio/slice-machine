export function buildEndpoints(base: string) {
  const endpoint = (path: string) => `${base}${path}`

  return {
    Dashboard: {
      index: endpoint('/dashboard'),
      cliLogin: endpoint('/dashboard/cli/login'),
      cliSignup: endpoint('/dashboard/cli/signup')
    }
  }
}