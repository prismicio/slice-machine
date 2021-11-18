import React from "react";
import axios from "axios";

import SliceMachineModal from "../SliceMachineModal";
// import { getVersionInfo } from '../../src/apiClient'
import { VersionInfo } from "../../server/src/api/versions";
import {
  //  Button,
  Card,
  Close,
  Flex,
  Heading,
  //  Link,
  //  Spinner,
  Text,
  Paragraph,
  IconButton,
} from "theme-ui";
import { MdOutlineCopyAll } from "react-icons/md";

const STUB_DATA: VersionInfo = {
  update: true,
  updateCommand: "yarn update slice-machine-ui",
  packageManager: "yarn",
  current: "0.0.0",
  recent: "0.0.1",
};

export default function UpdateModal() {
  const [state] = React.useState(STUB_DATA);
  const ref = React.useRef<HTMLDivElement>(null);

  const copy = () => {
    ref.current?.textContent &&
      navigator.clipboard.writeText(ref.current.textContent);
  };

  if ("err" in state) {
    console.error(state.err);
    return null;
  }
  return (
    !state.err && (
      <SliceMachineModal
        isOpen={true}
        style={{
          content: {
            position: "static",
            display: "flex",
            margin: "auto",
            minHeight: "initial",
          },
          overlay: {
            display: "flex",
          },
        }}
      >
        <Card
          sx={{
            maxWidth: "380px",
            padding: "20px",
            bg: "headSection",
          }}
        >
          <Flex
            sx={{
              marginBottom: "20px",
              paddingBottom: "20px",
              alignItems: "center",
              justifyContent: "space-between",
              borderRadius: "8px 8px 0px 0px",
              borderBottom: (t) => `1px solid ${t.colors?.borders}`,
            }}
          >
            <Heading sx={{ fontSize: "16px" }}>
              {" "}
              SliceMachine {state.recent} available
            </Heading>
            <Close
              tabIndex={0}
              sx={{ p: 0, alignSelf: "start" }}
              type="button"
              onClick={() => undefined}
            />
          </Flex>

          <Paragraph
            sx={{ fontSize: "14px", color: "#4E4E55", marginBottom: "20px" }}
          >
            To update to new version of Slice Machine, open a terminal, run the
            following command and restart Slice Machine:
          </Paragraph>

          <Flex
            sx={{
              border: "1px solid rgba(62, 62, 72, 0.15)",
              borderRadius: "4px",
              padding: "4px",
              justifyContent: "space-between",
            }}
          >
            <Text
              ref={ref}
              as="code"
              sx={{ margin: "4px", textAlign: "center" }}
            >
              {state.updateCommand}
            </Text>
            <IconButton title="Click to copy" tabIndex={0} onClick={copy}>
              <MdOutlineCopyAll />
            </IconButton>
          </Flex>
        </Card>
      </SliceMachineModal>
    )
  );
}
