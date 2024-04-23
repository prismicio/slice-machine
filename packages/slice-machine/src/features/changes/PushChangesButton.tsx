import { Button, Skeleton, Tooltip } from "@prismicio/editor-ui";
import {
  type ComponentPropsWithoutRef,
  type ElementRef,
  type FC,
  forwardRef,
  type ReactNode,
  Suspense,
} from "react";

import { ErrorBoundary } from "@/ErrorBoundary";
import { gitProviderToConfig } from "@/features/settings/git/GitProvider";
import { useGitIntegrationExperiment } from "@/features/settings/git/useGitIntegrationExperiment";
import { useLinkedGitRepos } from "@/features/settings/git/useLinkedGitRepos";

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
