import { getPrismicData } from "../auth";
import DefaultClient from "../models/common/http/DefaultClient";

export async function validate() {
  const prismicData = getPrismicData();
  if (!prismicData.isOk()) {
    return {
      connected: false,
      reason: `Could not parse ~/.prismic file`,
    };
  }
  if (!prismicData.value.auth) {
    return {
      connected: false,
      reason: `Could not parse ~/.prismic prismic-auth string`,
    };
  }

  const res = await DefaultClient.validate(
    prismicData.value.base,
    prismicData.value.auth
  );
  if (res.status > 209) {
    return {
      connected: false,
      reason: `Could not authenticate you (base: ${prismicData.value.base})`,
    };
  }
  try {
    const body = await res.json();
    return {
      connected: true,
      reason: "",
      body,
    };
  } catch (e) {
    return {
      connected: false,
      reason: "Could not validate prismic-auth token.",
    };
  }
}
