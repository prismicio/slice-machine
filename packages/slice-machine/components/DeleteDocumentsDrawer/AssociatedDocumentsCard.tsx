import React from "react";
import { Flex, Text, Card, Link } from "theme-ui";

type AssociatedDocumentsCardProps = {
  ctName: string;
  numberOfDocuments: number;
  link: string;
  isOverLimit?: boolean;
};

export const AssociatedDocumentsCard: React.FC<
  AssociatedDocumentsCardProps
> = ({ ctName, numberOfDocuments, link, isOverLimit }) => (
  <Card
    sx={{
      mb: 12,
      backgroundColor: "white",
      boxShadow: "0px 2px 1px rgba(0, 0, 0, 0.05)",
      borderRadius: 6,
      border: (t) => `1px solid ${String(t.colors?.borders)}`,
      px: 16,
      py: 2,
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    }}
  >
    <Flex sx={{ flexDirection: "column" }}>
      <Text>{ctName}</Text>
      <Text
        sx={{
          color: "textClear",
          fontSize: "12px",
          lineHeight: "16px",
        }}
      >
        {numberOfDocuments} documents
      </Text>
    </Flex>
    <Link
      href={link}
      target="_blank"
      variant="cardSmall"
      sx={{ color: isOverLimit ? "danger" : "purple08" }}
    >
      View documents
    </Link>
  </Card>
);
