import { delay } from "../../server/src/api/common/utils";

describe("server/common/utils", () => {
  describe("delay", () => {
    test("it should call setTimeout", async () => {
      jest.spyOn(global, "setTimeout");
      await delay(100);
      expect(setTimeout).toHaveBeenCalledTimes(1);
      expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 100);
    });
  });
});
