export const environments = [
  {
    kind: "prod",
    name: "Production",
    domain: "prod-domain",
    users: [],
  },
  {
    kind: "stage",
    name: "Foo",
    domain: "foo-domain",
    users: [],
  },
  {
    kind: "dev",
    name: "Bar",
    domain: "bar-domain",
    users: [],
  },
] as const;
