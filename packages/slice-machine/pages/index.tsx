import Link from "next/link";
import { useRouter } from "next/router";
import React, { Fragment } from "react";
import { GoPlus } from "react-icons/go";
import {
  Box,
  Button,
  Card as ThemeCard,
  Flex,
  Heading,
  Link as ThemeLink,
  Text,
} from "theme-ui";
import { FiLayout } from "react-icons/fi";

import Container from "components/Container";
import CreateCustomTypeModal from "components/Forms/CreateCustomTypeModal";
import Grid from "components/Grid";
import Header from "components/Header";
import EmptyState from "components/EmptyState";
import { CustomType, ObjectTabs } from "@lib/models/common/CustomType";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { selectLocalCustomTypes } from "@src/modules/customTypes";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import { isModalOpen } from "@src/modules/modal";
import { ModalKeysEnum } from "@src/modules/modal/types";

export interface CtPayload {
  repeatable: boolean;
  id: string;
  previewUrl: string;
  label: string;
}

// To isolate later
const CTName: React.FunctionComponent<{ ctName: string }> = ({ ctName }) => {
  return (
    <Heading sx={{ flex: 1, lineHeight: 20 }} as="h6">
      {ctName}
    </Heading>
  );
};

// To isolate later
const CTRepeatble: React.FunctionComponent<{ repeatable: boolean }> = ({
  repeatable,
}) => {
  return (
    <Text sx={{ fontSize: 0, color: "textClear", lineHeight: "20px" }}>
      {repeatable ? "Repeatable" : "Single"} Type
    </Text>
  );
};

// To isolate later
const CTThumbnail = ({
  heightInPx,
  preview = null,
  withShadow = true,
}: {
  heightInPx: string;
  preview: { url: string } | null;
  withShadow?: boolean;
}) => {
  return (
    <Box
      sx={{
        backgroundColor: "headSection",
        backgroundRepeat: "repeat",
        backgroundSize: "15px",
        backgroundImage: "url(/pattern.png)",
        height: heightInPx,
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "6px",
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        border: (t) => `1px solid ${t.colors?.borders}`,
        boxShadow: withShadow ? "0px 8px 14px rgba(0, 0, 0, 0.1)" : "none",
      }}
    >
      <Box
        sx={{
          width: "100%",
          height: "100%",
          backgroundSize: "contain",
          backgroundPosition: "50%",
          backgroundRepeat: "no-repeat",
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          backgroundImage: "url(" + `${preview?.url}` + ")",
        }}
      />
    </Box>
  );
};
// To isolate later
const Card: React.FunctionComponent<{ ct: CtPayload }> = ({ ct }) => (
  <Link href={`/cts/${ct.id}`} passHref>
    <ThemeLink variant="links.invisible">
      <ThemeCard
        role="button"
        aria-pressed="false"
        sx={{
          bg: "transparent",
          border: "none",
          transition: "all 100ms cubic-bezier(0.215,0.60,0.355,1)",
        }}
      >
        <CTThumbnail preview={{ url: ct.previewUrl }} heightInPx="287px" />
        <Flex
          mt={3}
          sx={{ alignItems: "center", justifyContent: "space-between" }}
        >
          <CTName ctName={ct.label} />
          <CTRepeatble repeatable={ct.repeatable} />
        </Flex>
      </ThemeCard>
    </ThemeLink>
  </Link>
);

const CustomTypes: React.FunctionComponent = () => {
  const router = useRouter();
  const {
    createCustomTypes,
    openCreateCustomTypeModal,
    closeCreateCustomTypeModal,
  } = useSliceMachineActions();
  const { customTypes, isCreateCustomTypeModalOpen } = useSelector(
    (store: SliceMachineStoreType) => ({
      customTypes: selectLocalCustomTypes(store),
      isCreateCustomTypeModalOpen: isModalOpen(
        store,
        ModalKeysEnum.CREATE_CUSTOM_TYPE
      ),
    })
  );

  const _onCreate = ({ id, label, repeatable }: CtPayload): void => {
    createCustomTypes(id, label, repeatable);
    void router.push(`/cts/${id}`);
  };

  return (
    <Container sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <Header
        ActionButton={
          customTypes.length ? (
            <Button
              data-cy="create-ct"
              onClick={openCreateCustomTypeModal}
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                borderRadius: "50%",
                height: "48px",
                width: "48px",
              }}
            >
              <GoPlus size={"2em"} />
            </Button>
          ) : undefined
        }
        MainBreadcrumb={
          <Fragment>
            <FiLayout /> <Text ml={2}>Custom Types</Text>
          </Fragment>
        }
        breadrumbHref="/"
      />
      {customTypes.length === 0 ? (
        <EmptyState
          title={"Create your first Custom Type"}
          explanations={[
            "Click the + button on the top right to create your first custom type.",
            "It will be stored locally. You will then be able to push it to Prismic.",
          ]}
          onCreateNew={openCreateCustomTypeModal}
          buttonText={"Create your first Custom Type"}
          documentationComponent={
            <>
              Go to our{" "}
              <ThemeLink
                target={"_blank"}
                href={"https://prismic.io/docs/core-concepts/custom-types "}
                sx={(theme) => ({ color: theme?.colors?.primary })}
              >
                documentation
              </ThemeLink>{" "}
              to learn more about Custom Types.
            </>
          }
        />
      ) : (
        <Grid // The CtPayload should be used here once the Context has been changed.
          elems={customTypes}
          defineElementKey={(ct: CustomType<ObjectTabs>) => ct.id}
          renderElem={(ct: CustomType<ObjectTabs>) => (
            <Link passHref href={`/cts/${ct.id}`} key={ct.id}>
              <Card ct={ct as CtPayload} />
            </Link>
          )}
        />
      )}
      <CreateCustomTypeModal
        isOpen={isCreateCustomTypeModalOpen}
        onSubmit={_onCreate}
        customTypes={customTypes}
        close={closeCreateCustomTypeModal}
      />
    </Container>
  );
};

export default CustomTypes;
