import router from "next/router";
import { Text, Flex, Switch, Label } from "theme-ui";

import VarationsPopover from "@lib/builders/SliceBuilder/Header/VariationsPopover";
import * as Models from "@slicemachine/core/build/models";
import { ComponentUI } from "@lib/models/common/ComponentUI";

import { Button } from "@components/Button";
import SliceMachineLogo from "@components/AppLayout/Navigation/Icons/SliceMachineLogo";
import { useSelector } from "react-redux";
import { selectSavingMock } from "@src/modules/simulator";

import * as Links from "@lib/builders/SliceBuilder/links";
import { SliceMachineStoreType } from "@src/redux/type";

const redirect = (
  model: ComponentUI,
  variation: { id: string } | undefined,
  isSimulator?: boolean
): void => {
  if (!variation) {
    void router.push(`/${model.href}/${model.model.name}`);
    return;
  }
  const params = Links.variation({
    lib: model.href,
    sliceName: model.model.name,
    variationId: variation?.id,
    isSimulator,
  });
  void router.push(params.href, params.as, params.options);
};

type PropTypes = {
  slice: ComponentUI;
  variation: Models.VariationSM;
  isDisplayEditor: boolean;
  toggleIsDisplayEditor: () => void;
  onSaveMock: () => void;
  actionsDisabled: boolean;
};

const Header: React.FunctionComponent<PropTypes> = ({
  slice,
  variation,
  isDisplayEditor,
  toggleIsDisplayEditor,
  onSaveMock,
  actionsDisabled,
}) => {
  const { savingMock } = useSelector((state: SliceMachineStoreType) => ({
    savingMock: selectSavingMock(state),
  }));
  return (
    <Flex
      sx={{
        p: "16px 16px 16px 24px",
        display: "flex",
        bg: "grey07",
        gridTemplateRows: "1fr",
        borderBottom: "1px solid #DCDBDD",
        justifyContent: "space-between",
      }}
    >
      <Flex
        sx={{
          alignItems: "center",
        }}
      >
        <SliceMachineLogo height={"40px"} width={"40px"} fill="#1A1523" />
        <Text
          sx={{
            ml: 2,
            mr: "12px",
            fontSize: "14px",
            color: "#1A1523",
            fontWeight: "600",
            letterSpacing: "-0.15px",
          }}
        >
          {slice.model.name}
        </Text>
        <VarationsPopover
          defaultValue={variation}
          variations={slice.model.variations}
          onChange={(v) => redirect(slice, v, true)}
          disabled={slice.model.variations.length <= 1 || actionsDisabled}
        />
      </Flex>
      <Flex sx={{ alignItems: "center", justifyContent: "space-between" }}>
        <Flex sx={{ alignItems: "center", justifyContent: "space-around" }}>
          <Flex sx={{ alignItems: "center", mr: 4 }}>
            <Label
              htmlFor="show-mock-editor"
              sx={{
                color: "#6F6E77",
                lineHeight: "16px",
                fontSize: "12px",
                fontWeight: "600",
                letterSpacing: "0px",
              }}
            >
              Editor
            </Label>
            <Switch
              id="show-mock-editor"
              checked={isDisplayEditor}
              onChange={toggleIsDisplayEditor}
              disabled={actionsDisabled}
              sx={{
                height: "24px",
                width: "45px",
                bg: "#EDECEE",
                "input:checked ~ &": {
                  bg: "#6E56CF",
                },
                "input ~ & > div": {
                  height: "20px",
                  width: "20px",
                  border: "1px solid #DCDBDD",
                  padding: "2px",
                  boxShadow: "0px 1px 0px rgba(0, 0, 0, 0.04)",
                },
                "input:checked ~ & > div": {
                  height: "20px",
                  width: "20px",
                  border: "1px solid #5842C3",
                  padding: "2px",
                  boxShadow: "0px 1px 0px rgba(0, 0, 0, 0.04)",
                },
                "input:checked ~ &:hover": {
                  bg: "#5842C3",
                },
                "input:checked ~ & > div:focus": {
                  boxShadow: "0px 0px 0px 3px rgba(124, 102, 220, 0.3)",
                },
              }}
            />
          </Flex>
        </Flex>
        <Button
          data-cy="save-mock"
          onClick={onSaveMock}
          label="Save mock content"
          disabled={savingMock}
          sx={{
            padding: "8px 16px",
            borderRadius: "6px",
            fontSize: "14px",
            lineHeight: "24px",
            letterSpacing: "-0.15px",
            color: "#F1EEFE",
            border: "1px solid #5842C3",
            backgroundColor: "#6E56CF",
            boxShadow: "0px 1px 0px rgba(0, 0, 0, 0.04)",
            "&:focus": {
              boxShadow: "0px 0px 0px 3px rgba(124, 102, 220, 0.3)",
            },
            "&:hover": {
              backgroundColor: "#5842C3",
            },
            "&:active": {
              backgroundColor: "#5842C3",
              boxShadow: "inset 0px 2px 0px rgba(0, 0, 0, 0.08)",
            },
            "&:disabled": {
              opacity: "30%",
            },
          }}
        />
      </Flex>
    </Flex>
  );
};

export default Header;
