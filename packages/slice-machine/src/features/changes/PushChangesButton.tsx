import { Button, Skeleton, Tooltip } from "@prismicio/editor-ui";
import {
  type ComponentPropsWithoutRef,
  type ElementRef,
  type FC,
  type ReactNode,
  Suspense,
  forwardRef,
} from "react";

import { gitProviderToConfig } from "@src/features/settings/git/GitProvider";
import { useGitIntegrationExperiment } from "@src/features/settings/git/useGitIntegrationExperiment";
import { useLinkedGitRepos } from "@src/features/settings/git/useLinkedGitRepos";
import { ErrorBoundary } from "@src/ErrorBoundary";

type PushChangesButtonProps = Required<BarePushChangesButtonProps>;

export const PushChangesButton: FC<PushChangesButtonProps> = (props) => (
  <ErrorBoundary renderError={renderError}>
    <Suspense fallback={<PushChangesButtonSkeleton />}>
      <PushChangesButtonUsingGitIntegrationExperiment {...props} />
    </Suspense>
  </ErrorBoundary>
);

const PushChangesButtonUsingGitIntegrationExperiment: FC<
  PushChangesButtonProps
> = (props) => {
  const gitIntegrationExperiment = useGitIntegrationExperiment();
  return gitIntegrationExperiment.eligible ? (
    <PushChangesButtonUsingLinkedGitRepos {...props} />
  ) : (
    <BarePushChangesButton {...props} />
  );
};

const PushChangesButtonUsingLinkedGitRepos: FC<PushChangesButtonProps> = (
  props,
) => {
  const { linkedGitRepos } = useLinkedGitRepos();
  if (linkedGitRepos.length > 0) {
    const providerConfig = gitProviderToConfig[linkedGitRepos[0].provider];
    return (
      <Tooltip
        content={`This project uses the Git workflow. Update Prismic by pushing your changes to ${providerConfig.name}.`}
        side="bottom"
      >
        <BarePushChangesButton disabled />
      </Tooltip>
    );
  } else {
    return <BarePushChangesButton {...props} />;
  }
};

type BarePushChangesButtonProps = Pick<
  ComponentPropsWithoutRef<typeof Button>,
  "disabled" | "loading" | "onClick"
>;

const BarePushChangesButton = forwardRef<
  ElementRef<typeof Button>,
  BarePushChangesButtonProps
>((props, ref) => (
  <Button {...props} ref={ref} startIcon="upload">
    Push
  </Button>
));

function renderError(): ReactNode {
  return (
    <Tooltip
      content="An error occurred while fetching the list of connected Git repositories."
      side="bottom"
    >
      <BarePushChangesButton disabled />
    </Tooltip>
  );
}

const PushChangesButtonSkeleton: FC = () => (
  <Skeleton height={32} width={71.32} />
);
