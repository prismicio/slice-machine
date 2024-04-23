import { Children, useState, memo } from "react";
import { Box } from "theme-ui";
import { Tabs, TabPanel } from "react-tabs";
import { CustomTab as Tab, CustomTabList as TabList } from "./components";
import Card from "../";

const WithTabs = ({
  children,
  Footer,
  Header,
  tabs,
  bodySx,
  footerSx,
  defaultIndex = 0,
}) => {
  const [currentIndex, setCurrentIndex] = useState(defaultIndex);

  return (
    <Card
      borderFooter
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      footerSx={{ p: 0, ...footerSx }}
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      bodySx={{ p: 0, ...bodySx }}
      sx={{ border: "none" }}
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      Header={Header}
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      Footer={Footer}
    >
      <Tabs defaultIndex={defaultIndex} onSelect={(i) => setCurrentIndex(i)}>
        <TabList>
          {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/strict-boolean-expressions
            (tabs || []).map((tab) => (
              <Tab
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                key={tab}
              >
                {tab}
              </Tab>
            ))
          }
        </TabList>
        {Children.map(children, (Child, i) => (
          <Box
            sx={{
              p: (theme) => `calc(${theme.space[3]}px + 8px)`,
              display: i === currentIndex ? "block" : "none",
            }}
          >
            <TabPanel>{Child}</TabPanel>
          </Box>
        ))}
      </Tabs>
    </Card>
  );
};

export default memo(WithTabs);
