import DefaultClient from "@lib/models/common/http/DefaultClient";
import nock from "nock";

describe("DefaultClient", () => {
  describe("profile", () => {
    test("good response", async () => {
      const token = "biscuits";
      const base = "https://prismic.io";
      const response = {
        userId: "userId",
        shortId: "shortId",
        email: "email",
        firstName: "firstName",
        lastName: "lastName",
      };

      nock("https://user.internal-prismic.io", {
        reqheaders: {
          Authorization: `Bearer ${token}`,
        },
      })
        .get("/profile")
        .reply(200, response);

      const result = await DefaultClient.profile(base, token);

      expect(result).toEqual(response);
    });

    test("good response bad data", async () => {
      const token = "biscuits";
      const base = "https://prismic.io";
      const response = {};

      nock("https://user.internal-prismic.io", {
        reqheaders: {
          Authorization: `Bearer ${token}`,
        },
      })
        .get("/profile")
        .reply(200, response);

      expect(() => DefaultClient.profile(base, token)).rejects.toThrow(
        "Unable to parse profile: {}"
      );
    });

    test("bad response", async () => {
      const token = "biscuits";
      const base = "https://prismic.io";

      nock("https://user.internal-prismic.io", {
        reqheaders: {
          Authorization: `Bearer ${token}`,
        },
      })
        .get("/profile")
        .reply(403);

      expect(() => DefaultClient.profile(base, token)).rejects.toThrow(
        "Request failed with status code 403"
      );
    });
  });
});
