import { PropsWithChildren, Suspense, useState } from "react";
import {
  Button,
  ErrorBoundary,
  ProgressCircle,
  Select,
  SelectItem,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Text,
} from "@prismicio/editor-ui";

import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { managerClient } from "@src/managerClient";
import { useSliceMachineConfig } from "@src/hooks/useSliceMachineConfig";
import { useUser } from "@src/hooks/useUser";

import { useGitOwners } from "../useGitOwners";
import { useGitRepos } from "../useGitRepos";
import { useLinkedGitRepos } from "../useLinkedGitRepos";
import { useLinkedGitReposActions } from "../useLinkedGitReposActions";

import * as styles from "./ConnectGitRepository.module.css";

// TODO: Export types from `@slicemachine/manager`
type GitOwner = Awaited<
  ReturnType<(typeof managerClient)["git"]["fetchOwners"]>
>[number];
type GitRepo = Awaited<
  ReturnType<(typeof managerClient)["git"]["fetchRepos"]>
>[number];

type ConnectButtonBaseProps = PropsWithChildren<{
  provider: "gitHub" | "gitLab" | "bitbucket";
  disabled?: boolean;
}>;

function ConnectButton(props: ConnectButtonBaseProps) {
  const { provider, children, disabled } = props;

  const [isLoading, setIsLoading] = useState(false);

  const connect = async () => {
    switch (provider) {
      case "gitHub": {
        setIsLoading(true);

        const state = await managerClient.git.createGitHubAuthState();

        const url = new URL(
          "https://github.com/apps/prismic-push-models-poc/installations/new",
        );
        url.searchParams.set("state", state.key);

        window.open(url, "git-hub-app-installation");

        return;
      }
    }
  };

  return (
    <Button
      onClick={() => void connect()}
      loading={isLoading}
      disabled={disabled}
      sx={{ width: "100%" }}
    >
      {children}
    </Button>
  );
}

function ConnectButtons() {
  return (
    <ul className={styles.buttons}>
      <li>
        <ConnectButton provider="gitHub">GitHub</ConnectButton>
      </li>
      <li>
        <ConnectButton provider="gitLab" disabled>
          GitLab (soon)
        </ConnectButton>
      </li>
      <li>
        <ConnectButton provider="bitbucket" disabled>
          Bitbucket (soon)
        </ConnectButton>
      </li>
    </ul>
  );
}

type SelectOwnerBaseProps = {
  owners: GitOwner[];
  onSelect: (owner: GitOwner) => void;
};

function SelectOwnerBase(props: SelectOwnerBaseProps) {
  const { owners, onSelect } = props;

  const onValueChange = (value: string) => {
    const [provider, id] = value.split("@");
    const owner = owners.find((o) => o.provider === provider && o.id === id);

    if (owner) {
      onSelect(owner);
    }
  };

  return (
    <Select
      color="grey"
      placeholder="Select user/org"
      onValueChange={onValueChange}
    >
      {owners.map((owner) => {
        return (
          <SelectItem key={owner.id} value={`${owner.provider}@${owner.id}`}>
            [{owner.provider}] {owner.name}
          </SelectItem>
        );
      })}
    </Select>
  );
}

function SelectOwner(props: SelectOwnerBaseProps) {
  return (
    <Suspense fallback={<ProgressCircle />}>
      <SelectOwnerBase {...props} />
    </Suspense>
  );
}

type SelectRepoBaseProps = {
  owner?: {
    provider: "gitHub";
    name: string;
  };
  onSelect: (repo: GitRepo) => void;
};

function SelectRepoBase(props: SelectRepoBaseProps) {
  const { onSelect } = props;

  const repos = useGitRepos(
    props.owner
      ? {
          provider: props.owner?.provider,
          owner: props.owner?.name,
        }
      : undefined,
  );

  return (
    <Table columnLayout="1fr auto" isInteractive={false}>
      <TableBody>
        {repos?.map((repo) => {
          return (
            <TableRow key={repo.id}>
              <TableCell>
                <Text variant="bold" color="grey12">
                  {repo.name}
                </Text>
              </TableCell>
              <TableCell>
                <Button color="grey" onClick={() => onSelect(repo)}>
                  Connect
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

function SelectRepo(props: SelectRepoBaseProps) {
  return (
    <Suspense fallback={<ProgressCircle />}>
      <SelectRepoBase {...props} />
    </Suspense>
  );
}

function RepoSelector() {
  const [config] = useSliceMachineConfig();
  const owners = useGitOwners();
  const { linkRepo } = useLinkedGitReposActions({
    prismic: { domain: config.repositoryName },
  });

  const [selectedOwner, setSelectedOwner] = useState<GitOwner>();

  if (owners.length < 1) {
    return <ConnectButtons />;
  }

  return (
    <div>
      <label>Owners</label>
      <SelectOwner
        owners={owners}
        onSelect={(owner) => setSelectedOwner(owner)}
      />
      <label>Repos</label>
      {selectedOwner ? (
        <SelectRepo
          owner={selectedOwner}
          onSelect={(repo) => void linkRepo(repo)}
        />
      ) : (
        <div>Select a user/owner first</div>
      )}
    </div>
  );
}

function LoggedInContents() {
  const [config] = useSliceMachineConfig();
  const linkedGitRepos = useLinkedGitRepos({
    prismic: { domain: config.repositoryName },
  });
  const { unlinkRepo } = useLinkedGitReposActions({
    prismic: { domain: config.repositoryName },
  });

  if ("error" in linkedGitRepos) {
    return <div>TODO: Handle error</div>;
  }

  if (linkedGitRepos.repos.length === 0) {
    return <RepoSelector />;
  }

  const linkedRepo = linkedGitRepos.repos[0];

  return (
    <div>
      Linked: [{linkedRepo.provider}] {linkedRepo.owner}/{linkedRepo.name}
      <Button onClick={() => void unlinkRepo(linkedRepo)}>Disconnect</Button>
    </div>
  );
}

function LoggedOutContents() {
  const { openLoginModal } = useSliceMachineActions();

  return (
    <div>
      You must be logged in to connect a Git repository.
      <Button onClick={() => openLoginModal()}>Log in to Prismic</Button>
    </div>
  );
}

function Contents() {
  const { isLoggedIn } = useUser();

  if (!isLoggedIn) {
    return <LoggedOutContents />;
  }

  return <LoggedInContents />;
}

export function ConnectGitRepository() {
  return (
    <fieldset className={styles.root}>
      <legend>Connected Git Repository</legend>
      <ErrorBoundary
        renderError={() => {
          return <div>Error</div>;
        }}
      >
        <Suspense fallback={<ProgressCircle />}>
          <Contents />
        </Suspense>
      </ErrorBoundary>
    </fieldset>
  );
}
