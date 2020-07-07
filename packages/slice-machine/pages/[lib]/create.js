import { useContext, useState, useEffect, Fragment } from "react";
import { LibContext } from "../../src/lib-context";
import { Formik, Field, Form } from "formik";

import * as Widgets from '../../lib/mocker/widgets'
import { handleDefaultValue, FormTypes } from '../../lib/mocker/FormHelpers'

import FieldForm from '../../components/FieldForm'

import {
  Heading,
  Text,
  Box,
  Input,
  Label,
  Checkbox,
  Alert,
  Close
} from 'theme-ui'
import Container from "../../components/Container";

const SliceEditor = ({ query }) => {
  const libraries = useContext(LibContext)

  const lib = libraries.find(e => e[0] === query.lib)

  if (!lib) {
    return <div>Library not found</div>
  }

  const { FormFields } = Widgets['StructuredText']

  console.log({
    Widgets,
    struct: Widgets['StructuredText']
  })

  const initialValues = Object.entries(FormFields).reduce((acc, [key, val]) => {
    const value = handleDefaultValue(val)
    if (value !== undefined) {
      return {
        ...acc,
        [key]: value
      }
    }
    return acc
  }, {})

  const formFields = Object.entries(FormFields).reduce((acc, [key, val]) => {
    const value = handleDefaultValue(val);
    if (value !== undefined) {
      return {
        ...acc,
        [key]: value,
      };
    }
    return acc;
  }, {});

  console.log(initialValues)
  return (
    <Container>
      <Heading as="h2">Create field StructuredText</Heading>
      <Box mt={4}>
        <Formik initialValues={initialValues}>
          <Form>
            {Object.entries(FormFields).map(([key, field]) => <FieldForm key={key} fieldName={key} formField={field} />)}
            <button type="submit">Submit</button>
          </Form>
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