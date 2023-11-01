import {
  Box,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  Icon,
  Text,
} from "@prismicio/editor-ui";
import { Environment } from "@slicemachine/manager/client";
import type { FC } from "react";
import clsx from "clsx";

import { getEnvironment, sortEnvironments } from "@src/domain/environment";
import LogoIcon from "@src/icons/LogoIcon";

import * as styles from "./SideNavEnvironmentSelector.css";

type SideNavEnvironmentSelectorProps = {
  environments: Environment[];
  activeEnvironmentDomain: string;
  onSelect?: (environment: Environment) => void;
};

export const SideNavEnvironmentSelector: FC<SideNavEnvironmentSelectorProps> = (
  props,
) => {
  const { environments, activeEnvironmentDomain, onSelect } = props;

  const activeEnvironment = getEnvironment(
    environments,
    activeEnvironmentDomain,
  );

  return (
    <Box alignItems="center" gap={16}>
      <Box position="relative">
        <LogoIcon className={styles.logo} />
        <EnvironmentDot
          kind={activeEnvironment.kind}
          className={styles.activeEnvironmentDot}
        />
      </Box>
      <Box flexGrow={1} flexDirection="column">
        <Text component="span" variant="small" color="grey11">
          Environment
        </Text>
        <Text component="span" className={styles.activeEnvironmentName}>
          {activeEnvironment.name}
        </Text>
      </Box>
      <EnvironmentDropdownMenu
        environments={environments}
        activeEnvironmentDomain={activeEnvironmentDomain}
        onSelect={onSelect}
      />
    </Box>
  );
};

type EnvironmentDropdownMenuProps = Pick<
  SideNavEnvironmentSelectorProps,
  "environments" | "activeEnvironmentDomain" | "onSelect"
>;

const EnvironmentDropdownMenu: FC<EnvironmentDropdownMenuProps> = (props) => {
  const { environments, activeEnvironmentDomain, onSelect } = props;

  const sortedEnvironments = sortEnvironments(environments);

  return (
    <DropdownMenu modal>
      <DropdownMenuTrigger>
        <Button startIcon="unfoldMore" variant="secondary" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Regular Environments</DropdownMenuLabel>
        {sortedEnvironments.map((environment) =>
          environment.kind !== "dev" ? (
            <EnvironmentDropdownMenuItem
              key={environment.domain}
              environment={environment}
              onSelect={onSelect}
              isActive={environment.domain === activeEnvironmentDomain}
            />
          ) : (
            <>
              <DropdownMenuLabel>Personal Environment</DropdownMenuLabel>
              <EnvironmentDropdownMenuItem
                key={environment.domain}
                environment={environment}
                onSelect={onSelect}
                isActive={environment.domain === activeEnvironmentDomain}
              />
            </>
          ),
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

type EnvironmentDropdownMenuItemProps = {
  environment: Environment;
  isActive?: boolean;
} & Pick<SideNavEnvironmentSelectorProps, "onSelect">;

const EnvironmentDropdownMenuItem: FC<EnvironmentDropdownMenuItemProps> = (
  props,
) => {
  const { environment, onSelect, isActive } = props;

  return (
    <DropdownMenuItem
      startIcon={
        <EnvironmentDot
          kind={environment.kind}
          className={styles.menuItemEnvironmentDot}
        />
      }
      endIcon={Boolean(isActive) ? <Icon name="check" /> : undefined}
      onSelect={() => onSelect?.(environment)}
    >
      {environment.name}
    </DropdownMenuItem>
  );
};

type EnvironmentDotProps = {
  kind: Environment["kind"];
  className?: string;
};

const EnvironmentDot: FC<EnvironmentDotProps> = (props) => {
  const { kind, className } = props;

  return <div className={clsx(styles.environmentDot[kind], className)} />;
};
