import { useState } from "react";
import { Box, Label, Text, useThemeUI, Input } from "theme-ui";
import { FaRegQuestionCircle } from "react-icons/fa";
import { useFormikContext } from "formik";

import { initialValues } from ".";

import Tooltip from "components/Tooltip";
import WindowPortal from "components/WindowPortal";
import InputDeleteIcon from "components/InputDeleteIcon";

import { MockConfigKey } from "../../../../../consts";

import * as dataset from "./dataset";

import { ImagesListCards, ImagesList } from "./components";

const dataTip =
  "In order for Prismic to properly display images,<br/>they need to be provided by Imgix.";

const ImageSelection = ({ value, onUpdate }) => {
  const [imagesSet, setImagesSet] = useState({ images: null, name: null });

  const onChange = (e) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    e.preventDefault();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    onUpdate(e.target.src);
    setImagesSet({ images: null, name: null });
  };

  const onSelect = (set) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
    setImagesSet({ images: dataset[set], name: set });
  };

  return (
    <Box>
      <Label variant="label.primary" mt={3} mb={2} htmlFor="contentValue">
        <Text as="span">Presets</Text>
      </Label>
      <ImagesListCards onSelect={onSelect} />
      {imagesSet.images ? (
        <WindowPortal
          onClose={() => setImagesSet({ images: null, name: null })}
        >
          <ImagesList
            listName={imagesSet.name}
            images={imagesSet.images}
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            value={value}
            onChange={onChange}
          />
        </WindowPortal>
      ) : null}
    </Box>
  );
};

const InputSrc = ({ value, onUpdate, onReset }) => {
  const { theme } = useThemeUI();
  return (
    <Box>
      <Label variant="label.primary" mt={3} mb={2} htmlFor="contentValue">
        <Text as="span">Prismic or Unsplash url</Text>
        <Tooltip id="image-mock" />
        <FaRegQuestionCircle
          color={theme.colors.icons}
          data-for="image-mock"
          data-multiline="true"
          data-tip={dataTip}
          style={{
            position: "relative",
            cursor: "pointer",
            top: "3px",
            height: "18px",
            marginLeft: "8px",
          }}
        />
      </Label>
      <Box sx={{ position: "relative" }}>
        <Input
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          value={value || ""}
          placeholder="https://images.prismic.io/..."
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
          onChange={(e) => onUpdate(e.target.value)}
        />

        <InputDeleteIcon
          sx={{ top: "4px" }}
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment
          onClick={onReset}
        />
      </Box>
    </Box>
  );
};

const Form = () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { values, setFieldValue } = useFormikContext();

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const contentValue = values[MockConfigKey]?.content || null;

  const onUpdate = (value) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    const clean = value.split("?")[0];
    setFieldValue(MockConfigKey, {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      content: clean,
    });
  };

  const onReset = () => {
    setFieldValue(MockConfigKey, {});
  };

  return (
    <Box>
      <InputSrc
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        value={contentValue}
        onUpdate={onUpdate}
        onReset={onReset}
      />
      <Box mt={3}>
        <ImageSelection
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          value={contentValue}
          onUpdate={onUpdate}
        />
      </Box>
    </Box>
  );
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
Form.initialValues = initialValues;

export const MockConfigForm = Form;
