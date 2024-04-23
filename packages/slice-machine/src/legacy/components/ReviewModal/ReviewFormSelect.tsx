import { FieldProps } from "formik";
import { FC } from "react";
import { Box, Button } from "theme-ui";

const ratingSelectable = [1, 2, 3, 4, 5];

export const ReviewFormSelect: FC<FieldProps> = (props) => {
  const { field, form } = props;

  return (
    <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between" }}>
      {ratingSelectable.map((rating, index) => (
        <Button
          variant="secondary"
          type="button"
          key={index}
          onClick={() => void form.setFieldValue("rating", rating)}
          className={field.value === rating ? "selected" : ""}
          sx={{
            "&:not(:last-of-type)": {
              mr: 1,
            },
            "&.selected": {
              backgroundColor: "code.gray",
              color: "white",
            },
          }}
          data-testid={`review-form-score-${rating}`}
        >
          {rating}
        </Button>
      ))}
    </Box>
  );
};
