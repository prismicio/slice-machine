import { Button, Skeleton, Tooltip } from "@prismicio/editor-ui";
import {
  type ComponentPropsWithoutRef,
  type ElementRef,
  type FC,
  type ReactNode,
  Suspense,
  forwardRef,
} from "react";

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
  return linkedGitRepos.length > 0 ? (
    <Tooltip
      content="This repository has been set up to use the Git workflow."
      side="bottom"
    >
      <BarePushChangesButton disabled />
    </Tooltip>
  ) : (
    <BarePushChangesButton {...props} />
  );
};

type BarePushChangesButtonProps = Pick<
  ComponentPropsWithoutRef<typeof Button>,
  "disabled" | "loading" | "onClick"
>;

const BarePushChangesButton = forwardRef<
  ElementRef<typeof Button>,
  BarePushChangesButtonProps
>((props, ref) => (
  <Button {...props} data-cy="push-changes" ref={ref} startIcon="upload">
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
