import { useState } from "react";
import equal from "fast-deep-equal";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Box, Label, Card, Input, Text } from "theme-ui";
import { useFormikContext } from "formik";

import { initialValues } from ".";

import { MockConfigKey } from "@lib/consts";

import InputDeleteIcon from "components/InputDeleteIcon";
import PreviewCard from "components/Card/Preview";

import places from "./places";

const createMapsUrl = (points) =>
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-member-access
  `https://google.com/maps/@${points.latitude},${points.longitude}`;

const InputSrc = ({ contentValue, value, onUpdate, onDelete }) => {
  return (
    <Label variant="label.primary" sx={{ display: "block" }}>
      <Text as="span">Google Maps Url</Text>
      <Input
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        value={value}
        placeholder="https://maps.google.com/@..."
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
        onChange={(e) => onUpdate(e.target.value)}
      />
      <InputDeleteIcon
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        onClick={onDelete}
      />
      {contentValue ? (
        <Box
          sx={{
            position: "absolute",
            top: "34px",
            right: "38px",
            color: "textClear",
          }}
        >
          <span>
            lat:{" "}
            {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              contentValue.latitude
            }
          </span>
          &nbsp;&nbsp;
          <span>
            long:{" "}
            {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              contentValue.longitude
            }
          </span>
        </Box>
      ) : null}
    </Label>
  );
};

const Form = () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { values, setFieldValue } = useFormikContext();

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const contentValue = values[MockConfigKey]?.content || null;
  const [url, setUrl] = useState(
    contentValue ? createMapsUrl(contentValue) : ""
  );

  const onUpdate = (points) => {
    setUrl(createMapsUrl(points));
    setFieldValue(MockConfigKey, {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      content: points,
    });
  };

  const parseMapUrl = (url) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    setUrl(url);
    if (!url) {
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    const res = url.match(/@(.*),(.*),/);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    if (res && res.length === 3) {
      onUpdate({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        latitude: parseFloat(res[1]),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        longitude: parseFloat(res[2]),
      });
    }
  };

  const onDelete = () => {
    setUrl("");
    setFieldValue(MockConfigKey, {});
  };

  return (
    <Box>
      <InputSrc
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        contentValue={contentValue}
        value={url}
        onUpdate={parseMapUrl}
        onDelete={onDelete}
      />
      <Label variant="label.primary" mt={3} mb={2} htmlFor="places">
        Presets
      </Label>
      <Box
        sx={{
          display: "grid",
          gridColumnGap: "8px",
          gridTemplateColumns: "1fr 1fr",
        }}
      >
        {places.map((place) => (
          <PreviewCard
            key={place.name}
            title={place.name}
            imageUrl={place.imageUrl}
            selected={equal(place.points, contentValue)}
            titleSx={{
              fontSize: 2,
              maxWidth: "80%",
            }}
            sx={{
              mb: 3,
            }}
            onClick={() => onUpdate(place.points)}
          />
        ))}
      </Box>
    </Box>
  );
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
Form.initialValues = initialValues;

export const MockConfigForm = Form;
