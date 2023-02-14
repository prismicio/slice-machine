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
> = ({ ctName, numberOfDocuments, link, isOverLimit = false }) => (
  <Card
    sx={{
      mb: 12,
    }}
    variant="drawerCard"
    data-cy="AssociatedDocumentsCard"
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

export const CustomTypesReferencesCard: React.FC<{
  name: string;
  id: string;
}> = ({ name, id }) => (
  <Card
    sx={{
      mb: 12,
    }}
    variant="drawerCard"
    data-cy="CustomTypesReferencesCard"
  >
    <Flex sx={{ flexDirection: "column" }}>
      <Text>{name}</Text>
      <Text
        sx={{
          color: "textClear",
          fontSize: "12px",
          lineHeight: "16px",
        }}
      >
        References to missing Slices
      </Text>
    </Flex>
    <Link href={`/cts/${id}`} key={id} target="_blank" variant="cardSmall">
      View Custom Type
    </Link>
  </Card>
);
