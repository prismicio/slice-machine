import { Button } from "@prismicio/editor-ui";
import { Video } from "cloudinary-react";
import { clsx } from "clsx";
import {
  createContext,
  createElement,
  type FC,
  type ImgHTMLAttributes,
  type PropsWithChildren,
  useCallback,
  useContext,
  useState,
  type VideoHTMLAttributes,
} from "react";

import { useDelayedAction } from "@/hooks/useDelayedAction";
import { CloseIcon } from "@/icons/CloseIcon";

import { BaseHoverCard, type BaseHoverCardProps } from "../BaseHoverCard";
import styles from "./HoverCard.module.css";

type HoverCardProps = PropsWithChildren<{
  align?: BaseHoverCardProps["align"];
  alignOffset?: BaseHoverCardProps["alignOffset"];
  arrowSize?: BaseHoverCardProps["arrowSize"];
  collisionPadding?: BaseHoverCardProps["collisionPadding"];
  onClose?: () => void;
  open: BaseHoverCardProps["open"];
  openDelay?: BaseHoverCardProps["openDelay"];
  side?: BaseHoverCardProps["side"];
  sideOffset?: BaseHoverCardProps["sideOffset"];
  trigger: BaseHoverCardProps["trigger"];
}>;

export const HoverCard: FC<HoverCardProps> = ({
  align,
  alignOffset,
  arrowSize,
  children,
  collisionPadding,
  onClose,
  open,
  openDelay = 5000,
  side,
  sideOffset,
  trigger,
}) => {
  const [isOpen, setOpen] = useState<boolean>(false);

  const handleClose = useCallback(() => {
    onClose && onClose();
    setOpen(false);
  }, [onClose, setOpen]);

  const handleChange = (value: boolean) => {
    if (value === true && open === true) {
      setOpen(value);
    }
  };

  const handleDefaultOpening = useCallback(
    () => setOpen((wasOpen) => wasOpen === false),
    [setOpen],
  );

  useDelayedAction({
    condition: open === true,
    action: handleDefaultOpening,
    delay: openDelay,
  });

  return (
    <BaseHoverCard
      align={align}
      alignOffset={alignOffset}
      arrowSize={arrowSize}
      collisionPadding={collisionPadding}
      onOpenChange={handleChange}
      open={isOpen}
      openDelay={openDelay}
      side={side}
      sideOffset={sideOffset}
      trigger={trigger}
    >
      <HoverCardWrapper handleClose={handleClose}>{children}</HoverCardWrapper>
    </BaseHoverCard>
  );
};

type HoverCardWrapperProps = PropsWithChildren<{
  handleClose: () => void;
}>;

const HoverCardWrapper = ({ handleClose, children }: HoverCardWrapperProps) => {
  return (
    <HoverCardContext.Provider
      value={{
        handleClose,
      }}
    >
      <div className={styles.root}>{children}</div>
    </HoverCardContext.Provider>
  );
};

type HoverCardContextValue = {
  handleClose: () => void;
};

const HoverCardContext = createContext<HoverCardContextValue>({
  handleClose: () => void 0,
});

function useHoverCardContextValue() {
  return useContext(HoverCardContext);
}

export const HoverCardTitle: FC<PropsWithChildren> = ({ children }) => {
  const { handleClose } = useHoverCardContextValue();

  return (
    <div className={styles.title}>
      <span>{children}</span>

      <button className={styles.titleCloseIcon} onClick={handleClose}>
        <CloseIcon />
      </button>
    </div>
  );
};

type HoverCardMediaProps =
  | ({ component: "video" } & VideoHTMLAttributes<HTMLVideoElement> & {
        cloudName: string;
        publicId: string;
      })
  | ({ component: "image" } & ImgHTMLAttributes<HTMLImageElement>);

export const HoverCardMedia: FC<HoverCardMediaProps> = ({
  component,
  ...otherProps
}) => {
  const ReactComponent = component === "image" ? "img" : Video;

  return (
    <div className={styles.mediaContainer}>
      {createElement(ReactComponent, {
        ...otherProps,
        className: clsx(styles.media, otherProps.className),
      })}
    </div>
  );
};

export const HoverCardDescription: FC<PropsWithChildren> = ({ children }) => {
  return <div className={styles.description}>{children}</div>;
};

export const HoverCardCloseButton: FC<PropsWithChildren> = ({ children }) => {
  const { handleClose } = useHoverCardContextValue();

  return (
    <div className={styles.closeButtonContainer}>
      <Button sx={{ width: "100%" }} onClick={handleClose}>
        {children}
      </Button>
    </div>
  );
};
