import { IconButton } from "theme-ui";
import { IconButtonProps } from "@theme-ui/components";
import { IconType } from "react-icons/lib";

const defaultActiveSx = (active: boolean, hasError: boolean | null): object => {
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  if (hasError) {
    return {
      border: ({ colors }: { colors: Record<string, string> }) =>
        `1px solid ${colors.error}`,
    };
  }
  return active
    ? {
        border: ({ colors }: { colors: Record<string, string> }) =>
          `1px solid ${colors.primary}`,
      }
    : {
        border: ({ colors }: { colors: Record<string, string> }) =>
          `1px solid ${colors.borders}`,
      };
};

export type SliceMachineIconButtonProps = IconButtonProps & {
  label?: string;
  size?: number;
  error?: boolean;
  fitButton?: boolean;
  active?: boolean;
  useActive?: boolean;
  Icon: IconType;
  activeSx?: (active: boolean, hasError: boolean | null) => object;
};

const SliceMachineIconButton: React.FunctionComponent<
  SliceMachineIconButtonProps
> = ({
  sx = null,
  onClick = () => null,
  label,
  Icon,
  error = null,
  size = 16,
  fitButton = false,
  active = false,
  useActive = false,
  activeSx = defaultActiveSx,
  ...rest
}) => (
  <IconButton
    onClick={onClick}
    aria-label={label}
    type="button"
    sx={{
      ...(fitButton ? { width: size, height: size } : null),
      ...(useActive && activeSx(active, error)),
      ...sx,
    }}
    {...rest}
  >
    <Icon size={size} />
  </IconButton>
);

export default SliceMachineIconButton;
