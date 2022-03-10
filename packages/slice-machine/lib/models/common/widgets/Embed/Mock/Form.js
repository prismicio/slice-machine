import EmbedContainer from "react-oembed-container";
import { Box, Text, Input, Label } from "theme-ui";
import { useFormikContext } from "formik";

import { DefaultConfig } from "@lib/mock/LegacyMockConfig";
import { MockConfigKey } from "@lib/consts";
import { useState } from "react";

import InputDeleteIcon from "components/InputDeleteIcon";

const Form = () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { values, setFieldValue } = useFormikContext();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const contentValue = values[MockConfigKey]?.content;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
  const [state, setState] = useState({
    ...contentValue,
    err: null,
    loading: false,
  });

  const onSelect = (url, oembed) => {
    setFieldValue(MockConfigKey, {
      content: {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        url,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        oembed,
      },
    });
  };

  const reset = () => {
    setState({
      oembed: null,
      loading: false,
      err: null,
      url: "",
    });
    setFieldValue(MockConfigKey, {});
  };

  // eslint-disable-next-line @typescript-eslint/require-await
  const getOembed = async (url) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    setState({ ...state, url });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (!url || !url.length) {
      return reset();
    }
    fetch("/api/parse-oembed", {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "POST",
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      body: JSON.stringify({ url }),
    })
      .then(async (res) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const json = await res.json();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        setState({ url, ...json, loading: false });
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (json.oembed) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          onSelect(url, json.oembed);
        }
      })
      .catch((e) => {
        console.error(e);
        setState({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          url,
          oembed: null,
          err: "Unable to fetch oembed",
          loading: false,
        });
      });
  };

  return (
    <Box>
      <Label
        variant="label.primary"
        sx={{ display: "block", maxWidth: "400px" }}
      >
        <Text as="span">Media url</Text>
        <Input
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          value={state.url || ""}
          placeholder="https://www.youtube.com/watch?v=fiOwHYFkUz0"
          onFocus={(e) => e.target.select()}
          onChange={(e) => getOembed(e.target.value.trim())}
        />
        <InputDeleteIcon onClick={reset} />
        <Box mt={2}>
          {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-member-access
            state.err ? <Text sx={{ color: "error" }}>{state.err}</Text> : null
          }
          {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            state.oembed ? (
              <Box>
                <EmbedContainer
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                  markup={state.oembed.html}
                >
                  <div
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                    dangerouslySetInnerHTML={{ __html: state.oembed.html }}
                  />
                </EmbedContainer>
                <Text mt={1} as="p">
                  Rendered with{" "}
                  <a
                    target="_blank"
                    href="https://www.npmjs.com/package/react-oembed-container"
                  >
                    react-oembed-container
                  </a>
                </Text>
              </Box>
            ) : null
          }
        </Box>
      </Label>
    </Box>
  );
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
Form.initialValues = DefaultConfig.Embed;

export const MockConfigForm = Form;
