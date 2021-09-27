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
    e.preventDefault();
    onUpdate(e.target.src);
    setImagesSet({ images: null, name: null });
  };

  const onSelect = (set) => {
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
          value={value || ""}
          placeholder="https://images.prismic.io/..."
          onChange={(e) => onUpdate(e.target.value)}
        />
        <InputDeleteIcon sx={{ top: "4px" }} onClick={onReset} />
      </Box>
    </Box>
  );
};

const Form = () => {
  const { values, setFieldValue } = useFormikContext();

  const contentValue = values[MockConfigKey]?.content || null;

  const onUpdate = (value) => {
    const clean = value.split("?")[0];
    setFieldValue(MockConfigKey, {
      content: clean,
    });
  };

  const onReset = () => {
    setFieldValue(MockConfigKey, {});
  };

  return (
    <Box>
      <InputSrc value={contentValue} onUpdate={onUpdate} onReset={onReset} />
      <Box mt={3}>
        <ImageSelection value={contentValue} onUpdate={onUpdate} />
      </Box>
    </Box>
  );
};

Form.initialValues = initialValues;

export const MockConfigForm = Form;
