import { generateRandomId } from "../utils";

export const gitOwners = [
  {
    id: generateRandomId(),
    name: "prismicio",
    provider: "gitHub",
    type: "team",
  },
];

export const gitRepos = [
  {
    id: generateRandomId(),
    name: "slice-machine",
    owner: "prismicio",
    provider: "gitHub",
    pushedAt: new Date(),
    url: "https://github.com/prismicio/slice-machine",
  },
] as const;

export const linkedRepos = [
  {
    id: generateRandomId(),
    name: "editor",
    owner: "prismicio",
    provider: "gitHub",
    pushedAt: new Date(),
    url: "https://github.com/prismicio/editor",
  },
] as const;

export const providerAppInstallURL =
  "https://github.com/apps/prismic-io/installations/new";
