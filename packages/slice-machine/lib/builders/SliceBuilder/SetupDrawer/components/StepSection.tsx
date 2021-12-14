import React, { useRef } from "react";
import { Flex, Text } from "theme-ui";
import { MdArrowBackIos, MdCheck } from "react-icons/md";
import { RiErrorWarningLine } from "react-icons/ri";
import { ThemeUIStyleObject } from "@theme-ui/css";

type StepSectionProps = {
  stepNumber: number;
  title: string;
  isOpen: boolean;
  onOpenStep: () => void;
  status?: null | "complete" | "warning";
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
    status === "complete"
      ? {
          textDecoration: "line-through",
          color: "grey04",
        }
      : {};

  return (
    <Flex
      sx={{
        flexDirection: "column",
        borderBottom: (t) => `1px solid ${t.colors?.borders}`,
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
          <StepNumber status={status} stepNumber={stepNumber} sx={{ mr: 2 }} />
          <Text
            sx={{ fontWeight: 500, fontSize: 2, ...additionalStepTitleStyle }}
          >
            {title}
          </Text>
        </Flex>
        <Flex
          sx={{
            transform: isOpen ? "rotate(90deg)" : "rotate(-90deg)",
            transition: "200ms",
          }}
        >
          <MdArrowBackIos color={"#4E4E55"} />
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
  status: null | "complete" | "warning";
};

const StepNumber: React.FunctionComponent<StepNumberProps> = ({
  stepNumber,
  sx,
  status = null,
}) => {
  let style: ThemeUIStyleObject = {
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
  };

  switch (status) {
    case "complete":
      style = {
        ...style,
        backgroundColor: "greenLighter",
        borderColor: "greenLighter",
      };
      break;
    case "warning":
      style = {
        ...style,
        backgroundColor: "orangeLighter",
        borderColor: "orangeLighter",
      };
      break;
    case null:
    default:
      break;
  }

  return (
    <Flex sx={style}>
      {!status && `${stepNumber}`}
      {status === "complete" && <MdCheck color="#3AB97A" />}
      {status === "warning" && <RiErrorWarningLine color="#F2994A" />}
    </Flex>
  );
};

export default StepSection;
