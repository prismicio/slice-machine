import { CustomTypeFormat } from "@slicemachine/manager";
import React from "react";
import { Card, Flex, Link, Text } from "theme-ui";

import { CUSTOM_TYPES_CONFIG } from "@/features/customTypes/customTypesConfig";
import { CUSTOM_TYPES_MESSAGES } from "@/features/customTypes/customTypesMessages";

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
    data-testid={`AssociatedDocumentsCard-${ctName}`}
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
  format: CustomTypeFormat;
  id: string;
  name: string;
}> = ({ format, id, name }) => (
  <Card
    sx={{
      mb: 12,
    }}
    variant="drawerCard"
    data-testid={`CustomTypesReferencesCard-${name}`}
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
        Missing Slices
      </Text>
    </Flex>
    <Link
      href={CUSTOM_TYPES_CONFIG[format].getBuilderPagePathname(id)}
      key={id}
      target="_blank"
      variant="cardSmall"
    >
      View {CUSTOM_TYPES_MESSAGES[format].name({ start: false, plural: false })}
    </Link>
  </Card>
);
