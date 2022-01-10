import React, { useRef } from "react";
import { Flex, Text } from "theme-ui";
import { MdArrowBackIos, MdCheck } from "react-icons/md";
import { ThemeUIStyleObject } from "@theme-ui/css";
import WarningBadge from "./WarningBadge";

type StepSectionProps = {
  stepNumber?: number;
  title: string;
  isOpen: boolean;
  onOpenStep: () => void;
  status?: null | "ok" | "ko";
};

const StepSection: React.FunctionComponent<StepSectionProps> = ({
  title,
  stepNumber,
  isOpen,
  onOpenStep,
  children,
  status = null,
}) => {
  const stepSectionContainer = useRef<HTMLDivElement>(null);
  const contentHeight: number =
    !!stepSectionContainer && !!stepSectionContainer.current
      ? stepSectionContainer.current.scrollHeight
      : 0;

  const additionalStepTitleStyle: ThemeUIStyleObject =
    status === "ok"
      ? {
          textDecoration: "line-through",
          color: "grey04",
        }
      : {};

  return (
    <Flex
      sx={{
        flexDirection: "column",
        borderBottomWidth: "1px",
        borderBottomStyle: "solid",
        borderBottomColor: (t) => t.colors?.borders,
        overflow: "hidden",
        pb: isOpen ? 24 : 0,
      }}
    >
      <Flex
        sx={{
          flex: 1,
          alignItems: "center",
          justifyContent: "space-between",
          paddingY: 24,
          cursor: "pointer",
        }}
        onClick={onOpenStep}
      >
        <Flex sx={{ alignItems: "center" }}>
          {!!stepNumber && (
            <StepNumber stepNumber={stepNumber} sx={{ mr: 2 }} />
          )}
          <Text
            sx={{ fontWeight: 500, fontSize: 2, ...additionalStepTitleStyle }}
          >
            {title}
          </Text>
        </Flex>
        <Flex
          sx={{
            justifyContent: "center",
          }}
        >
          {status === "ok" && (
            <Flex
              sx={{
                height: 20,
                width: 20,
                justifyContent: "center",
                alignItems: "center",
                borderRadius: "50%",
                borderStyle: "solid",
                backgroundColor: "lightGreen",
                borderColor: "lightGreen",
                borderWidth: 1,
                mr: 2,
              }}
            >
              <MdCheck color="#3AB97A" />
            </Flex>
          )}
          {status === "ko" && <WarningBadge sx={{ mr: 2 }} />}
          <Flex
            sx={{
              transform: isOpen
                ? "rotate(90deg) translate(5px)"
                : "rotate(-90deg) translate(5px)",
              transition: "all 0.2s ease-out",
            }}
          >
            <MdArrowBackIos color={"#4E4E55"} />
          </Flex>
        </Flex>
      </Flex>
      <Flex
        ref={stepSectionContainer}
        sx={{
          overflow: "hidden",
          opacity: isOpen ? 1 : 0,
          paddingX: 24,
          willChange: "max-height",
          transition: "all 0.2s ease-out",
          maxHeight: isOpen ? contentHeight : 0,
        }}
      >
        {children}
      </Flex>
    </Flex>
  );
};

type StepNumberProps = {
  stepNumber: number;
  sx: ThemeUIStyleObject;
};

const StepNumber: React.FunctionComponent<StepNumberProps> = ({
  stepNumber,
  sx,
}) => (
  <Flex
    sx={{
      height: 20,
      width: 20,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: "50%",
      borderStyle: "solid",
      borderColor: (t) => t.colors?.textGray,
      borderWidth: 1,
      color: (t) => t.colors?.textGray,
      ...sx,
    }}
  >
    {stepNumber}
  </Flex>
);

export default StepSection;
