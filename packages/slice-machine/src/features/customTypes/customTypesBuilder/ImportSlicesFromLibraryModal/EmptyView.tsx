import {
  BlankSlate,
  BlankSlateActions,
  BlankSlateDescription,
  BlankSlateIcon,
  BlankSlateTitle,
  Box,
  ThemeKeys,
} from "@prismicio/editor-ui";
import { ReactNode } from "react";

type EmptyViewProps = {
  title: string;
  description?: string;
  icon: "github" | "alert" | "logout" | "viewDay";
  color?: "purple" | "tomato";
  actions?: ReactNode;
};

export function EmptyView(props: EmptyViewProps) {
  const { title, description, icon, actions, color = "purple" } = props;

  let iconColor: ThemeKeys<"color">;
  let iconBackgroundColor: ThemeKeys<"color">;

  switch (color) {
    case "purple":
      iconColor = "purple11";
      iconBackgroundColor = "purple3";
      break;
    case "tomato":
      iconColor = "tomato11";
      iconBackgroundColor = "tomato3";
      break;
  }

  return (
    <Box
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      gap={16}
      flexGrow={1}
    >
      <BlankSlate>
        <BlankSlateIcon
          lineColor={iconColor}
          backgroundColor={iconBackgroundColor}
          name={icon}
        />
        <BlankSlateTitle size="medium">{title}</BlankSlateTitle>
        {description !== undefined && (
          <BlankSlateDescription>{description}</BlankSlateDescription>
        )}
        {actions !== undefined && (
          <BlankSlateActions>{actions}</BlankSlateActions>
        )}
      </BlankSlate>
    </Box>
  );
}
