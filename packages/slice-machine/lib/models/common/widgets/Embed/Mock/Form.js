import EmbedContainer from "react-oembed-container";
import { Box, Text, Input, Label } from "theme-ui";
import { useFormikContext } from "formik";

import { initialValues } from ".";

import { MockConfigKey } from "@lib/consts";
import { useState } from "react";

import InputDeleteIcon from "components/InputDeleteIcon";

const Form = () => {
  const { values, setFieldValue } = useFormikContext();
  const contentValue = values[MockConfigKey]?.content;
  const [state, setState] = useState({
    ...contentValue,
    err: null,
    loading: false,
  });

  const onSelect = (url, oembed) => {
    setFieldValue(MockConfigKey, {
      content: {
        url,
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

  const getOembed = async (url) => {
    setState({ ...state, url });
    if (!url || !url.length) {
      return reset();
    }
    fetch("/api/parse-oembed", {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ url }),
    })
      .then(async (res) => {
        const json = await res.json();
        setState({ url, ...json, loading: false });
        if (json.oembed) {
          onSelect(url, json.oembed);
        }
      })
      .catch((e) => {
        console.error(e);
        setState({
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
          value={state.url || ""}
          placeholder="https://www.youtube.com/watch?v=fiOwHYFkUz0"
          onFocus={(e) => e.target.select()}
          onChange={(e) => getOembed(e.target.value.trim())}
        />
        <InputDeleteIcon onClick={reset} />
        <Box mt={2}>
          {state.err ? <Text sx={{ color: "error" }}>{state.err}</Text> : null}
          {state.oembed ? (
            <Box>
              <EmbedContainer markup={state.oembed.html}>
                <div dangerouslySetInnerHTML={{ __html: state.oembed.html }} />
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
          ) : null}
        </Box>
      </Label>
    </Box>
  );
};

Form.initialValues = initialValues;

export const MockConfigForm = Form;
