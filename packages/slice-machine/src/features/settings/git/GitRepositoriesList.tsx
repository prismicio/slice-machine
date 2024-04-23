import { Button, Skeleton, Text } from "@prismicio/editor-ui";
import type { GitRepo, GitRepoSpecifier } from "@slicemachine/manager";
import type { FC } from "react";

import { FieldSetList, FieldSetListItem } from "@/components/FieldSet";
import { RelativeTime } from "@/components/RelativeTime";
import { GitRepositoryConnectDialog } from "@/features/settings/git/GitRepositoryConnectDialog";
import { GitRepositoryDisconnectDialog } from "@/features/settings/git/GitRepositoryDisconnectDialog";
import { useLinkedGitRepos } from "@/features/settings/git/useLinkedGitRepos";

type GitRepositoriesListProps =
  | { mode: "link"; repos: GitRepo[] }
  | { mode: "unlink"; repos: GitRepoSpecifier[] };

export const GitRepositoriesList: FC<GitRepositoriesListProps> = ({
  mode,
  repos,
}) => {
  const { linkRepo, unlinkRepo } = useLinkedGitRepos();
  return (
    <FieldSetList>
      {mode === "link"
        ? repos.map((repo) => (
            <FieldSetListItem
              action={
                <GitRepositoryConnectDialog
                  linkRepo={linkRepo}
                  repo={repo}
                  trigger={<Button color="grey">Connect</Button>}
                />
              }
              key={`${repo.provider}@${repo.id}`}
            >
              {repo.name}
              <Text color="grey11">
                {" • "}
                <RelativeTime date={repo.pushedAt} />
              </Text>
            </FieldSetListItem>
          ))
        : repos.map((repo) => (
            <FieldSetListItem
              action={
                <GitRepositoryDisconnectDialog
                  repo={repo}
                  trigger={<Button color="grey">Disconnect</Button>}
                  unlinkRepo={unlinkRepo}
                />
              }
              key={`${repo.provider}@${repo.owner}/${repo.name}`}
            >
              {repo.name}
            </FieldSetListItem>
          ))}
    </FieldSetList>
  );
};

export const GitRepositoriesListSkeleton: FC = () => (
  <FieldSetList>
    {[...Array(4).keys()].map((index) => (
      <FieldSetListItem
        action={<Skeleton height={32} width={67.59} />}
        key={index}
      >
        <Skeleton
          height={24}
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore TODO(DT-1918): add `verticalAlign: "middle"` to the `sx` prop.
          sx={{ verticalAlign: "middle" }}
          width={129.92}
        />
      </FieldSetListItem>
    ))}
  </FieldSetList>
);
