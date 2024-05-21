import { keys } from "@prismicio/editor-support/Object";
import { Button, ButtonGroup, Text, tokens } from "@prismicio/editor-ui";
import { type ComponentPropsWithoutRef, type FC, useState } from "react";
import { toast } from "react-toastify";

import { gitProviderToConfig } from "@/features/settings/git/GitProvider";

export const GitProviderConnectButtons: FC = () => (
  <ButtonGroup>
    {keys(gitProviderToConfig).map((provider) => (
      <GitProviderConnectButton
        key={provider}
        provider={provider}
        sx={{ flexBasis: 0, flexGrow: 1 }}
      />
    ))}
  </ButtonGroup>
);

type GitProviderConnectButtonProps = {
  provider: keyof typeof gitProviderToConfig;
  sx?: SX;
};

const GitProviderConnectButton: FC<GitProviderConnectButtonProps> = ({
  provider,
  sx,
}) => {
  const { connect, Icon, name, supported } = gitProviderToConfig[provider];
  const [loading, setLoading] = useState(false);
  return (
    <Button
      color="grey"
      disabled={!supported}
      loading={loading}
      onClick={() => {
        void (async () => {
          setLoading(true);
          try {
            await connect();
          } catch (error) {
            const message = `Could not connect to ${name}`;
            console.error(message, error);
            toast.error(message);
            setLoading(false);
          }
        })();
      }}
      renderStartIcon={() => <Icon color={tokens.color.greyLight11} />}
      sx={sx}
    >
      {name}
      {supported ? undefined : (
        <Text color="inherit" variant="small">
          {" (soon)"}
        </Text>
      )}
    </Button>
  );
};

// TODO(DT-1928): export the `SX` type from `@prismicio/editor-ui`.
type SX = ComponentPropsWithoutRef<typeof Button>["sx"];
