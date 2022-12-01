import router from "next/router";
import { Text, Flex, Switch, Label } from "theme-ui";

import VarationsPopover from "@lib/builders/SliceBuilder/Header/VariationsPopover";
import * as Models from "@slicemachine/core/build/models";
import { ComponentUI } from "@lib/models/common/ComponentUI";

import { Button } from "@components/Button";
import SliceMachineLogo from "@components/AppLayout/Navigation/Icons/SliceMachineLogo";

import * as Links from "@lib/builders/SliceBuilder/links";

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
};

const Header: React.FunctionComponent<PropTypes> = ({
  slice,
  variation,
  isDisplayEditor,
  toggleIsDisplayEditor,
  onSaveMock,
}) => {
  return (
    <Flex
      sx={{
        p: 3,
        display: "flex",
        gridTemplateRows: "1fr",
        borderBottom: "1px solid #F1F1F1",
        justifyContent: "space-between",
      }}
    >
      <Flex
        sx={{
          alignItems: "center",
        }}
      >
        <SliceMachineLogo height={"20px"} width={"20px"} />
        <Text mx={2}>{slice.model.name}</Text>
        <VarationsPopover
          defaultValue={variation}
          variations={slice.model.variations}
          onChange={(v) => redirect(slice, v, true)}
          disabled={slice.model.variations.length <= 1}
        />
      </Flex>
      <Flex sx={{ alignItems: "center", justifyContent: "space-between" }}>
        <Flex sx={{ alignItems: "center", justifyContent: "space-around" }}>
          <Flex sx={{ alignItems: "center", mr: 4 }}>
            <Label htmlFor="show-mock-editor">Editor</Label>
            <Switch
              id="show-mock-editor"
              checked={isDisplayEditor}
              onChange={toggleIsDisplayEditor}
            />
          </Flex>
        </Flex>
        <Button onClick={onSaveMock} label="Save mock" />
      </Flex>
    </Flex>
  );
};

export default Header;
