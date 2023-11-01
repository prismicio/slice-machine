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
import type { FC } from "react";
import clsx from "clsx";

import {
  Environment,
  getEnvironment,
  sortEnvironments,
} from "@src/domain/environment";
import LogoIcon from "@src/icons/LogoIcon";

import * as styles from "./SideNavEnvironmentSelector.css";

type SideNavEnvironmentSelectorProps = {
  environments: Environment[];
  activeEnvironmentDomain: string;
};

export const SideNavEnvironmentSelector: FC<SideNavEnvironmentSelectorProps> = (
  props,
) => {
  const { environments, activeEnvironmentDomain } = props;

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
      />
    </Box>
  );
};

type EnvironmentDropdownMenuProps = {
  environments: SideNavEnvironmentSelectorProps["environments"];
  activeEnvironmentDomain: Environment["domain"];
};

const EnvironmentDropdownMenu: FC<EnvironmentDropdownMenuProps> = (props) => {
  const { environments, activeEnvironmentDomain } = props;

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
              {...environment}
              key={environment.domain}
              isActive={environment.domain === activeEnvironmentDomain}
            />
          ) : (
            <>
              <DropdownMenuLabel>Personal Environment</DropdownMenuLabel>
              <EnvironmentDropdownMenuItem
                {...environment}
                key={environment.domain}
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
  name: Environment["name"];
  kind: Environment["kind"];
  domain: Environment["domain"];
  isActive?: boolean;
};

const EnvironmentDropdownMenuItem: FC<EnvironmentDropdownMenuItemProps> = (
  props,
) => {
  const { name, kind, domain, isActive } = props;

  return (
    <DropdownMenuItem
      startIcon={
        <EnvironmentDot kind={kind} className={styles.menuItemEnvironmentDot} />
      }
      endIcon={Boolean(isActive) ? <Icon name="check" /> : undefined}
      onSelect={() => {
        console.log(`Clicked ${name} (${domain})`);
      }}
    >
      {name}
    </DropdownMenuItem>
  );
};

type EnvironmentDotProps = {
  kind: EnvironmentDropdownMenuItemProps["kind"];
  className?: string;
};

const EnvironmentDot: FC<EnvironmentDotProps> = (props) => {
  const { kind, className } = props;

  return <div className={clsx(styles.environmentDot[kind], className)} />;
};
