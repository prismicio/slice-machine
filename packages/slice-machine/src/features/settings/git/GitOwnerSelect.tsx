import { Select, SelectItem, theme } from "@prismicio/editor-ui";
import type { GitOwner } from "@slicemachine/manager";
import type { ComponentPropsWithoutRef, FC } from "react";

import { gitProviderToConfig } from "@/features/settings/git/GitProvider";

type GitOwnerSelectProps = {
  disabled?: boolean;
  owners?: GitOwner[];
  selectedOwner?: GitOwner;
  onSelectedOwnerChange?: (selectedOwner: GitOwner) => void;
  sx?: SX;
};

export const GitOwnerSelect: FC<GitOwnerSelectProps> = ({
  disabled,
  owners = [],
  selectedOwner,
  onSelectedOwnerChange,
  sx,
}) => (
  <Select
    color="grey"
    constrainContentWidth
    disabled={disabled}
    flexContent
    onValueChange={(value) => {
      const [provider, id] = parseGitOwnerKey(value);
      const selectedOwner = owners.find(
        (owner) => owner.provider === provider && owner.id === id,
      );
      if (selectedOwner) {
        onSelectedOwnerChange?.(selectedOwner);
      }
    }}
    placeholder="Owner"
    renderStartIcon={() => <GitOwnerIcon owner={selectedOwner} />}
    size="large"
    sx={sx}
    value={selectedOwner ? formatGitOwnerKey(selectedOwner) : undefined}
  >
    {owners.map((owner) => (
      <SelectItem
        key={formatGitOwnerKey(owner)}
        renderStartIcon={() => <GitOwnerIcon owner={owner} />}
        size="large"
        value={formatGitOwnerKey(owner)}
      >
        {owner.name}
      </SelectItem>
    ))}
  </Select>
);

type GitOwnerIconProps = { owner: GitOwner | undefined };

const GitOwnerIcon: FC<GitOwnerIconProps> = ({ owner }) => {
  const { Icon } = gitProviderToConfig[owner?.provider ?? "gitHub"];
  return <Icon color={theme.color.grey11} />;
};

function formatGitOwnerKey(owner: GitOwner): string {
  return `${owner.provider}@${owner.id}`;
}

function parseGitOwnerKey(key: string): string[] {
  return key.split("@");
}

// TODO(DT-1928): export the `SX` type from `@prismicio/editor-ui`.
type SX = ComponentPropsWithoutRef<typeof Select>["sx"];
