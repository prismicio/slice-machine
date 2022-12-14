import React from "react";
import { Flex, Text, Card, Link } from "theme-ui";

export type CustomtypeDocuments = {
  ctName: string;
  numberOfDocuments: number;
  link: string;
};

type AssociatedDocumentsCardProps = {
  ctDocuments: CustomtypeDocuments;
  isOverLimit?: boolean;
};

export const AssociatedDocumentsCard: React.FC<
  AssociatedDocumentsCardProps
> = ({ ctDocuments, isOverLimit }) => (
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
      <Text>{ctDocuments.ctName}</Text>
      <Text
        sx={{
          color: "textClear",
          fontSize: "12px",
          lineHeight: "16px",
        }}
      >
        {ctDocuments.numberOfDocuments} documents
      </Text>
    </Flex>
    <Link
      href={ctDocuments.link}
      target="_blank"
      variant="cardSmall"
      sx={{ color: isOverLimit ? "danger" : "purple08" }}
    >
      View documents
    </Link>
  </Card>
);
