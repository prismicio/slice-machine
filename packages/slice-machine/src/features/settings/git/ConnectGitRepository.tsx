import { Button, IconButton, Tooltip } from "@prismicio/editor-ui";
import {
  isUnauthenticatedError,
  isUnauthorizedError,
} from "@slicemachine/manager/client";
import { type FC, type ReactNode, Suspense } from "react";

import {
  FieldSet,
  FieldSetContent,
  FieldSetFooter,
  FieldSetLegend,
} from "@/components/FieldSet";
import { ErrorBoundary } from "@/ErrorBoundary";
import { ConnectGitRepositoryBlankSlate } from "@/features/settings/git/ConnectGitRepositoryBlankSlate";
import { GitProviderConnectButtons } from "@/features/settings/git/GitProviderConnectButtons";
import { GitRepositoriesList } from "@/features/settings/git/GitRepositoriesList";
import {
  GitRepositoriesSearch,
  GitRepositoriesSearchSkeleton,
} from "@/features/settings/git/GitRepositoriesSearch";
import { useGitOwners } from "@/features/settings/git/useGitOwners";
import { useLinkedGitRepos } from "@/features/settings/git/useLinkedGitRepos";
import useSliceMachineActions from "@/modules/useSliceMachineActions";

export const ConnectGitRepository: FC = () => (
  <FieldSet>
    <FieldSetLegend>Connected Git Repository</FieldSetLegend>
    <ErrorBoundary renderError={renderError}>
      <Suspense fallback={<GitRepositoriesSearchSkeleton gitOwnerSelect />}>
        <Content />
      </Suspense>
    </ErrorBoundary>
    <FieldSetFooter
      action={
        <Tooltip content="Documentation is coming soon." side="bottom">
          <IconButton disabled icon="openInNew" />
        </Tooltip>
      }
    >
      Learn more about Prismic for Git
    </FieldSetFooter>
  </FieldSet>
);

const Content: FC = () => {
  const { linkedGitRepos } = useLinkedGitRepos();
  return linkedGitRepos.length > 0 ? (
    <GitRepositoriesList mode="unlink" repos={linkedGitRepos} />
  ) : (
    <UnlinkedRepositoryContent />
  );
};

const UnlinkedRepositoryContent: FC = () => {
  const owners = useGitOwners();
  return owners.length > 0 ? (
    <GitRepositoriesSearch owners={owners} />
  ) : (
    <FieldSetContent>
      <GitProviderConnectButtons />
    </FieldSetContent>
  );
};

function renderError(error: unknown, reset: () => void): ReactNode {
  if (isUnauthenticatedError(error)) {
    return <UnauthenticatedErrorContent />;
  } else if (isUnauthorizedError(error)) {
    return <UnauthorizedErrorContent />;
  } else {
    return <UnknownErrorContent reset={reset} />;
  }
}

const UnauthenticatedErrorContent: FC = () => {
  const { openLoginModal } = useSliceMachineActions();
  return (
    <FieldSetContent>
      <ConnectGitRepositoryBlankSlate
        title="It seems like you are logged out"
        description="Log in to connect a Git repository."
        action={<Button onClick={openLoginModal}>Log in to Prismic</Button>}
      />
    </FieldSetContent>
  );
};

const UnauthorizedErrorContent: FC = () => (
  <FieldSetContent>
    <ConnectGitRepositoryBlankSlate
      title="It seems like you do not have permission"
      description="An owner or admin is required to connect a Git repository."
    />
  </FieldSetContent>
);

type UnknownErrorContentProps = { reset: () => void };

const UnknownErrorContent: FC<UnknownErrorContentProps> = ({ reset }) => (
  <FieldSetContent>
    <ConnectGitRepositoryBlankSlate
      title="Unable to fetch data"
      description="An error occurred while fetching the list of connected Git repositories."
      action={
        <Button color="grey" onClick={reset}>
          Retry
        </Button>
      }
    />
  </FieldSetContent>
);
