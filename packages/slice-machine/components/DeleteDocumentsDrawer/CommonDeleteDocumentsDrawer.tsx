import React from "react";
import Drawer from "rc-drawer";
import { Close, Flex, Heading } from "theme-ui";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import Card from "@components/Card";
import { AssociatedDocumentsCard } from "./AssociatedDocumentsCard";
import { RemoteOnlyCustomType, getModelId } from "@lib/models/common/ModelData";
import type { Limit } from "@slicemachine/client";

export const CommonDeleteDocumentsDrawer: React.FunctionComponent<{
  isOverLimit: boolean;
  isOpen: boolean;
  remoteOnlyCustomTypes: RemoteOnlyCustomType[];
  modalData: Readonly<Limit>;
  title: string;
  footer: React.ReactNode;
  explanations: React.ReactNode;
}> = ({
  isOverLimit,
  isOpen,
  remoteOnlyCustomTypes,
  modalData,
  title,
  footer,
  explanations,
}) => {
  const { closeModals } = useSliceMachineActions();

  if (!isOpen) return null;

  const associatedDocumentsCards = modalData.details.customTypes.map(
    (customTypeDetail) => {
      const customType = remoteOnlyCustomTypes.find(
        (customType) => getModelId(customType) === customTypeDetail.id
      );
      if (customType === undefined) return null;

      return (
        <AssociatedDocumentsCard
          isOverLimit={isOverLimit}
          key={customTypeDetail.id}
          ctName={customType.remote.label ?? customType.remote.id}
          link={customTypeDetail.url}
          numberOfDocuments={customTypeDetail.numberOfDocuments}
        />
      );
    }
  );

  return (
    <Drawer
      placement="right"
      open={isOpen}
      level={null}
      onClose={closeModals}
      width={496}
    >
      <Card
        radius={"0px"}
        bodySx={{
          bg: "white",
          padding: 24,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "scroll",
        }}
        footerSx={{
          p: 0,
        }}
        sx={{
          flexDirection: "column",
          display: "flex",
          height: "100%",
          border: "none",
        }}
        borderFooter
        Header={() => (
          <Flex
            sx={{
              p: "16px",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: (t) => `1px solid ${String(t.colors?.borders)}`,
            }}
          >
            <Flex sx={{ alignItems: "center" }}>
              <Heading sx={{ fontSize: "14px", fontWeight: "bold", ml: 1 }}>
                {title}
              </Heading>
            </Flex>
            <Close type="button" onClick={() => closeModals()} />
          </Flex>
        )}
        Footer={() => (
          <Flex
            sx={{
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              paddingRight: 16,
              borderTop: (t) => `1px solid ${String(t.colors?.darkBorders)}`,
              backgroundColor: "white",
              padding: 20,
            }}
          >
            {footer}
          </Flex>
        )}
      >
        {explanations}
        {associatedDocumentsCards}
      </Card>
    </Drawer>
  );
};
