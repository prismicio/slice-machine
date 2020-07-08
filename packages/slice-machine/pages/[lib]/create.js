import { useContext } from "react";
import {
  Formik,
  Form,
} from "formik";

import {
  Heading,
  Button,
  Box,
} from 'theme-ui'

import { LibContext } from "../../src/lib-context";

import * as Widgets from '../../lib/widgets'
import {
  createInitialValues,
  createValidationSchema
} from '../../lib/forms'

import FieldForm from '../../components/FieldForm'
import Container from "../../components/Container";

const SliceEditor = ({ query }) => {
  const libraries = useContext(LibContext)

  const lib = libraries.find(e => e[0] === query.lib)

  if (!lib) {
    return <div>Library not found</div>
  }

  const { FormFields } = Widgets['StructuredText']
  const initialValues = createInitialValues(FormFields)
  const validationSchema = createValidationSchema(FormFields)

  return (
    <Container>
      <Heading as="h2">Create field StructuredText</Heading>
      <Box mt={4}>
        <Formik
          validateOnChange
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={(values, formikBag) => {
            console.log({ values, formikBag });
          }}
        >
          {({ errors, touched, isSubmitting, values }) => console.log({ values, errors }) || (
              <Form>
                {Object.entries(FormFields).map(([key, field]) => (
                  <FieldForm key={key} fieldName={key} formField={field} />
                ))}
                <Button mt={2} type="submit" disabled={isSubmitting}>
                  Submit
                </Button>
                <code>{JSON.stringify(errors)}</code>
              </Form>
            )
          }
        </Formik>
      </Box>
    </Container>
  );
}

SliceEditor.getInitialProps = ({ query }) => {
  return {
    query
  }
};

export default SliceEditor