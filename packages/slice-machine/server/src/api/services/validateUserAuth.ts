import getPrismicData from "./getPrismicData";
import DefaultClient from "@lib/models/common/http/DefaultClient";

export async function validateUserAuth() {
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const body = await res.json();
    return {
      connected: true,
      reason: "",
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      body,
    };
  } catch (e) {
    return {
      connected: false,
      reason: "Could not validate prismic-auth token.",
    };
  }
}
