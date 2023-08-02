import * as Tabs from "@radix-ui/react-tabs";
import * as styles from "./Window.css";
import { FC, HTMLAttributes, PropsWithChildren, useRef } from "react";
import { ScrollArea, IconButton } from "@prismicio/editor-ui";
import { HorozontalThreeDotsIcon } from "@src/icons/HorozontalThreeDotsIcon";

type DivProps = PropsWithChildren<HTMLAttributes<HTMLDivElement>>;

export const Window: FC<DivProps> = (props) => (
  <div {...props} className={styles.root} />
);

export const WindowFrame: FC<DivProps> = (props) => (
  <div {...props} className={styles.frame} />
);

export const WindowFrameDots: FC<DivProps> = (props) => (
  <div className={styles.frameIconContainer} {...props}>
    <HorozontalThreeDotsIcon className={styles.frameIcon} />
  </div>
);

export const WindowTabs: FC<Tabs.TabsProps> = (props) => (
  <Tabs.Root {...props} className={styles.tabs} />
);

export const WindowTabsListContainer: FC<DivProps> = (props) => (
  <div {...props} className={styles.listContainer} />
);

export const WindowTabsList: FC<Tabs.TabsListProps> = (props) => (
  <ScrollArea direction="horizontal" className={styles.scroll}>
    <Tabs.List {...props} className={styles.list} />
  </ScrollArea>
);

export const AddButton: FC<{ onClick?: () => void }> = (props) => (
  <div className={styles.addButton}>
    <IconButton {...props} icon="add" size="medium" />
  </div>
);

export const WindowTabsTrigger: FC<
  Tabs.TabsTriggerProps & {
    onClick?: () => void;
  }
> = ({ onClick, children, ...props }) => {
  return (
    <Tab {...props}>
      {children}
      <ThreeDotsButton onClick={onClick} />
    </Tab>
  );
};

export const ThreeDotsButton: FC<{ onClick?: () => void }> = (props) => (
  <IconButton icon="moreVert" {...props} />
);

export const Tab: FC<Tabs.TabsTriggerProps> = ({ children, ...props }) => {
  const ref = useRef<HTMLButtonElement>(null);
  const handleClick = () => {
    ref.current?.scrollIntoView({ behavior: "smooth", inline: "center" });
  };
  return (
    <Tabs.Trigger
      asChild
      ref={ref}
      className={styles.trigger}
      onClick={(event) => {
        handleClick();
        props.onClick && props.onClick(event);
      }}
      {...props}
    >
      <div>{children}</div>
    </Tabs.Trigger>
  );
};

export const WindowTabsContent: FC<Tabs.TabsContentProps> = (props) => (
  <Tabs.Content {...props} className={styles.content} />
);
