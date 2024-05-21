import router from "next/router";
import { Flex, Label, Switch, Text } from "theme-ui";

import SliceMachineLogo from "@/icons/SliceMachineLogo";
import { Button } from "@/legacy/components/Button";
import * as Links from "@/legacy/components/Simulator/components/Header/links";
import VariationsPopover from "@/legacy/components/Simulator/components/Header/VariationsPopover";
import { ComponentUI } from "@/legacy/lib/models/common/ComponentUI";
import { VariationSM } from "@/legacy/lib/models/common/Slice";

const redirect = (
  model: ComponentUI,
  variation: { id: string } | undefined,
  isSimulator?: boolean,
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
  variation: VariationSM;
  isDisplayEditor: boolean;
  toggleIsDisplayEditor: () => void;
  onSaveMock: () => void;
  actionsDisabled: boolean;
  isSavingMock: boolean;
};

const Header: React.FunctionComponent<PropTypes> = ({
  slice,
  variation,
  isDisplayEditor,
  toggleIsDisplayEditor,
  onSaveMock,
  actionsDisabled,
  isSavingMock,
}) => {
  return (
    <Flex
      sx={{
        p: "16px",
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
        <SliceMachineLogo height={"20px"} width={"20px"} fill="#1A1523" />
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
        <VariationsPopover
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
            />
          </Flex>
        </Flex>
        <Button
          data-testid="save-mock"
          onClick={onSaveMock}
          label="Save mock content"
          disabled={isSavingMock || actionsDisabled}
          variant="primary"
          sx={{
            borderRadius: "6px",
            color: "#F1EEFE",
            fontWeight: "bold",
            border: "1px solid #5842C3",
            backgroundColor: "#6E56CF",
            boxShadow: "0px 1px 0px rgba(0, 0, 0, 0.04)",
            "&:hover": {
              "&:not([disabled])": { backgroundColor: "#5842C3" },
            },
          }}
        />
      </Flex>
    </Flex>
  );
};

export default Header;
