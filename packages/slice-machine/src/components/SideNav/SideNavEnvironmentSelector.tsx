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

import {
  buildProductionEnvironmentFallback,
  sortEnvironments,
} from "@src/domain/environment";
import LogoIcon from "@src/icons/LogoIcon";

import * as styles from "./SideNavEnvironmentSelector.css";

type SideNavEnvironmentSelectorProps = {
  environments: Environment[] | undefined;
  activeEnvironmentDomain: string | undefined;
  productionEnvironmentDomain: Environment["domain"];
  onSelect?: (environment: Environment) => void | Promise<void>;
};

export const SideNavEnvironmentSelector: FC<SideNavEnvironmentSelectorProps> = (
  props,
) => {
  const {
    environments,
    activeEnvironmentDomain,
    productionEnvironmentDomain,
    onSelect,
  } = props;

  const activeEnvironment = environments?.find(
    (environment) => environment.domain === activeEnvironmentDomain,
  );

  return (
    <Box alignItems="center" gap={16}>
      <Box position="relative">
        <LogoIcon className={styles.logo} />
        <EnvironmentDot
          kind={activeEnvironment?.kind ?? "prod"}
          className={styles.activeEnvironmentDot}
        />
      </Box>
      <Box flexGrow={1} flexDirection="column">
        <Text component="span" variant="small" color="grey11">
          Environment
        </Text>
        <Text component="span" className={styles.activeEnvironmentName}>
          {activeEnvironment?.name ?? "Production"}
        </Text>
      </Box>
      <EnvironmentDropdownMenu
        environments={environments}
        activeEnvironmentDomain={activeEnvironmentDomain}
        productionEnvironmentDomain={productionEnvironmentDomain}
        onSelect={onSelect}
      />
    </Box>
  );
};

type EnvironmentDropdownMenuProps = Pick<
  SideNavEnvironmentSelectorProps,
  | "environments"
  | "activeEnvironmentDomain"
  | "productionEnvironmentDomain"
  | "onSelect"
>;

const EnvironmentDropdownMenu: FC<EnvironmentDropdownMenuProps> = (props) => {
  const {
    productionEnvironmentDomain,
    environments = [
      buildProductionEnvironmentFallback(productionEnvironmentDomain),
    ],
    activeEnvironmentDomain,
    onSelect,
  } = props;

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
              isActive={
                activeEnvironmentDomain === undefined
                  ? environment.kind === "prod"
                  : environment.domain === activeEnvironmentDomain
              }
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
      onSelect={() => void onSelect?.(environment)}
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
