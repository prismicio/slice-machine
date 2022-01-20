import { Fragment } from "react";
import { useThemeUI } from "theme-ui";
import { Flex as FlexGrid, Col } from "components/Flex";

import PreviewCard from "components/Card/Preview";

import * as dataset from "./dataset";

const ImageInput = ({ src, onChange, selected }) => (
  <input
    style={{
      padding: "0",
      marginBottom: "8px",
      maxWidth: "100%",
      border: selected
        ? "5px solid rgba(81, 99, 186, 1)"
        : "5px solid transparent",
    }}
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    onClick={onChange}
    type="image"
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    src={src}
  />
);

const RenderCol = ({ elements, cols, onSelect }) => (
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  <Col cols={cols}>
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      elements.map(([key, value]) => (
        <PreviewCard
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment
          key={key}
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          title={key}
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-member-access
          imageUrl={`${value[0].raw}&q=20&w=120`}
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
          onClick={() => onSelect(key)}
        />
      ))
    }
  </Col>
);

export const ImagesListCards = ({ onSelect }) => {
  const entries = Object.entries(dataset);
  const Cols = [
    entries.slice(0, entries.length / 3),
    entries.slice(entries.length / 3, (entries.length / 3) * 2),
    entries.slice((entries.length / 3) * 2),
  ];

  return (
    <FlexGrid mt={3} px={0} sx={{ display: "flex" }}>
      <RenderCol
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        onSelect={onSelect}
        cols={3}
        elements={Cols[0]}
      />
      <RenderCol
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        onSelect={onSelect}
        cols={3}
        elements={Cols[1]}
      />
      <RenderCol
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        onSelect={onSelect}
        cols={3}
        elements={Cols[2]}
      />
    </FlexGrid>
  );
};

export const ImagesList = ({ listName, images, value, onChange }) => {
  const { theme } = useThemeUI();

  return (
    <Fragment>
      <div
        style={{
          ...theme.styles.fixedHeader,
          display: "flex",
          background: theme.colors.background,
          padding: "0 8px",
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          borderBottom: `1px solid ${theme.colors.borders}`,
        }}
      >
        <h3>{listName}</h3>
      </div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          padding: "64px 8px 20px",
        }}
      >
        <div
          style={{
            flex: `0 ${100 / 2 - 1}%`,
            marginBottom: "4px",
          }}
        >
          {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            images.slice(0, images.length / 2).map((image) => (
              <ImageInput
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                key={image.raw}
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-member-access
                src={`${image.raw}&q=80&w=400`}
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                onChange={onChange}
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                selected={image.raw.indexOf(value) === 0}
              />
            ))
          }
        </div>
        <div
          style={{
            flex: `0 ${100 / 2 - 1}%`,
            marginBottom: "4px",
          }}
        >
          {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            images.slice(images.length / 2).map((image) => (
              <ImageInput
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                key={image.raw}
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-member-access
                src={`${image.raw}&q=80&w=400`}
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                onChange={onChange}
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                selected={image.raw.indexOf(value) === 0}
              />
            ))
          }
        </div>
      </div>
    </Fragment>
  );
};
