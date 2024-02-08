import {
  Button,
  ErrorBoundary,
  IconButton,
  Tooltip,
} from "@prismicio/editor-ui";
import { isUnauthorizedError } from "@slicemachine/manager/client";
import { type FC, type ReactNode, Suspense } from "react";

import {
  FieldSet,
  FieldSetContent,
  FieldSetFooter,
  FieldSetLegend,
} from "@src/components/FieldSet";
import { ConnectGitRepositoryBlankSlate } from "@src/features/settings/git/ConnectGitRepositoryBlankSlate";
import { GitProviderConnectButtons } from "@src/features/settings/git/GitProviderConnectButtons";
import { GitRepositoriesList } from "@src/features/settings/git/GitRepositoriesList";
import {
  GitRepositoriesSearch,
  GitRepositoriesSearchSkeleton,
} from "@src/features/settings/git/GitRepositoriesSearch";
import { useGitOwners } from "@src/features/settings/git/useGitOwners";
import { useLinkedGitRepos } from "@src/features/settings/git/useLinkedGitRepos";
import { useUser } from "@src/hooks/useUser";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";

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
  // TODO(TD-1952): this hook isn't necessary and changes to the Redux
  // authentication status should reset the Suspense cache.
  const { isLoggedIn } = useUser();
  return isLoggedIn ? <LoggedInContent /> : <UnauthenticatedErrorContent />;
};

const LoggedInContent: FC = () => {
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
  if (isUnauthorizedError(error)) {
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
