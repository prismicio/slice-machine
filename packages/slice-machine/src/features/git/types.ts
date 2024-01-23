export type PrismicRepoSpecifier = {
  domain: string;
};

export type GitRepoSpecifier = {
  provider: "gitHub";
  owner: string;
  name: string;
};
