import { useEffect, useState } from "react";
import { Label, Box, useThemeUI } from "theme-ui";
import { FaRegQuestionCircle } from "react-icons/fa";
import { useFormikContext } from "formik";

import { initialValues, Patterns, DEFAULT_PATTERN_KEY } from ".";

import { NumberOfBlocks, PatternCard } from "./components";

import Tooltip from "components/Tooltip";
import { Flex as FlexGrid, Col } from "components/Flex";

import { MockConfigKey } from "../../../../../consts";

const dataTip = `To generate mock content, we'll use the selected pattern.<br/>A pattern is an array of RichText options, repeated "block" times.`;

const HandlePatternTypes = ({
  options,
  currentKey,
  onUpdate,
  onUpdateBlocks,
  blocksValue,
}) => {
  const { theme } = useThemeUI();

  const PatternsWithStatus = Object.entries(Patterns).map(([key, pattern]) => ({
    patternKey: key,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    isAllowed: Patterns[key].test(options),
    pattern,
  }));

  return (
    <Box>
      <Tooltip id="richtext-mock" />
      <FlexGrid mt={3}>
        <Col>
          <Label variant="label.primary">
            Mock Pattern
            <FaRegQuestionCircle
              data-for="richtext-mock"
              data-multiline="true"
              data-tip={dataTip}
              color={theme.colors.icons}
              style={{
                position: "relative",
                top: "3px",
                height: "18px",
                marginLeft: "8px",
              }}
            />
          </Label>
          {PatternsWithStatus.map(({ patternKey, ...rest }) => (
            <PatternCard
              key={patternKey}
              patternKey={patternKey}
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              onUpdate={onUpdate}
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              currentKey={currentKey}
              {...rest}
            />
          ))}
        </Col>
        <Col>
          <NumberOfBlocks
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            currentValue={blocksValue}
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            onUpdate={onUpdateBlocks}
          />
        </Col>
      </FlexGrid>
    </Box>
  );
};

const Form = () => {
  const [patternTypeCheck, setPatternTypeCheck] = useState(null);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { values, setFieldValue } = useFormikContext();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-member-access
  const options = (values.config.single || values.config.multi || "").split(
    ","
  );

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const configValues = values[MockConfigKey]?.config || {};

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
    const {
      mockConfig: {
        config: { patternType },
      },
    } = values;
    if (
      patternType &&
      patternType !== patternTypeCheck &&
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      !Patterns[patternType].test(options)
    ) {
      onUpdate({
        key: "patternType",
        updateType: "config",
        value: findValidPattern(options),
      });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      setPatternTypeCheck(patternType);
    }
  });

  const onUpdate = ({ updateType, key, value }) => {
    setFieldValue(MockConfigKey, {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      [updateType]: {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-member-access
        ...(values[MockConfigKey]?.[updateType] || {}),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        [key]: value,
      },
    });
  };

  const onSetPattern = (value, isPattern) => {
    onUpdate({
      key: isPattern ? "pattern" : "patternType",
      updateType: "config",
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      value,
    });
  };

  const onSetBlocks = (value) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    onUpdate({ key: "blocks", value, updateType: "config" });
  };

  return (
    <Box>
      <HandlePatternTypes
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        options={options}
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        currentKey={configValues.patternType || DEFAULT_PATTERN_KEY}
        onUpdate={onSetPattern}
        onUpdateBlocks={onSetBlocks}
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        blocksValue={configValues.blocks || 1}
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        currentValue={Patterns[
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-member-access
          configValues.patternType || DEFAULT_PATTERN_KEY
        ].value(options)}
      />
    </Box>
  );
};

const findValidPattern = (config) => {
  const patternEntry = Object.entries(Patterns).find(([, pat]) =>
    pat.test(config)
  );
  if (patternEntry) {
    return patternEntry[0];
  }
  return DEFAULT_PATTERN_KEY;
};

Form.onSave = (mockValue, values) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  if (!mockValue?.config?.patternType) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
    return mockValue;
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const { patternType } = mockValue.config;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const patternObj = Patterns[patternType];
  if (!patternObj) {
    return initialValues;
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-member-access
  const options = (values.config.single || values.config.multi).split(",");
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const isValidPatternType = patternObj.test(options);
  if (isValidPatternType) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return mockValue;
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return {
    ...mockValue,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    config: {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      ...mockValue.config,
      patternType: findValidPattern(options),
    },
  };
};

Form.initialValues = initialValues;

export const MockConfigForm = Form;
