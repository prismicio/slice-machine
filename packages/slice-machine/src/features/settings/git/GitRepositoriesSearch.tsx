import type { GitOwner } from "@slicemachine/manager";
import { type FC, Suspense, useState } from "react";

import { FieldSetContent, FieldSetHeader } from "@/components/FieldSet";
import { ConnectGitRepositoryBlankSlate } from "@/features/settings/git/ConnectGitRepositoryBlankSlate";
import { GitOwnerSelect } from "@/features/settings/git/GitOwnerSelect";
import {
  GitRepositoriesList,
  GitRepositoriesListSkeleton,
} from "@/features/settings/git/GitRepositoriesList";
import { useGitRepos } from "@/features/settings/git/useGitRepos";

type GitRepositoriesSearchProps = { owners: GitOwner[] };

export const GitRepositoriesSearch: FC<GitRepositoriesSearchProps> = ({
  owners,
}) => {
  const [selectedOwner, setSelectedOwner] = useState(owners[0]);
  return (
    <>
      <FieldSetHeader>
        <GitOwnerSelect
          owners={owners}
          selectedOwner={selectedOwner}
          onSelectedOwnerChange={setSelectedOwner}
          sx={{ width: "calc(50% - 8px)" }}
        />
      </FieldSetHeader>
      <Suspense
        fallback={<GitRepositoriesSearchSkeleton gitOwnerSelect={false} />}
      >
        <GitRepositoriesSearchResults owner={selectedOwner} />
      </Suspense>
    </>
  );
};

type GitRepositoriesSearchResultsProps = { owner: GitOwner };

const GitRepositoriesSearchResults: FC<GitRepositoriesSearchResultsProps> = ({
  owner,
}) => {
  const repos = useGitRepos({ provider: owner.provider, owner: owner.name });
  return repos.length > 0 ? (
    <GitRepositoriesList mode="link" repos={repos} />
  ) : (
    <FieldSetContent>
      <ConnectGitRepositoryBlankSlate
        title="No Results Found"
        description="Try selecting a different Git account or organization on the top left."
      />
    </FieldSetContent>
  );
};

type GitRepositoriesSearchSkeletonProps = { gitOwnerSelect: boolean };

export const GitRepositoriesSearchSkeleton: FC<
  GitRepositoriesSearchSkeletonProps
> = ({ gitOwnerSelect }) => (
  <>
    {gitOwnerSelect ? (
      <FieldSetHeader>
        <GitOwnerSelect disabled sx={{ width: "calc(50% - 8px)" }} />
      </FieldSetHeader>
    ) : undefined}
    <GitRepositoriesListSkeleton />
  </>
);
