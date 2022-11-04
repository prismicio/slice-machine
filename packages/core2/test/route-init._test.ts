import { it, expect } from "vitest";

import { createSliceMachineProject } from "./__testutils__/createSliceMachineProject";
import { createTestAdapter } from "./__testutils__/createTestAdapter";

import { createRPCClient, createRPCServer } from "../src";

it("returns success", async (ctx) => {
  const client = createRPCClient({ port: ctx.serverPort });
  const res = await client.init();

  expect(res).toBe(undefined);

  // const url = `http://localhost:${ctx.serverPort}/init`;
  // const res = await fetch(url, { method: "post" });
  //
  // expect(res.status).toBe(200);
});

it("returns error when plugins fail to init", async () => {
  const adapter = createTestAdapter({ autofillRequiredHooks: false });
  const project = createSliceMachineProject(adapter);
  const server = createRPCServer({ project });
  const { port } = await server.open();

  const client = createRPCClient({ port });
  const res = await client.init();

  console.log(res);

  // const url = `http://localhost:${port}/init`;
  // const res = await fetch(url, { method: "post" });
  // const json = await res.json();
  //
  // expect(res.status).toBe(500);
  // expect(json).toStrictEqual({
  //   error: expect.stringContaining(
  //     `Adapter \`${adapter.meta.name}\` is missing hooks`
  //   ),
  // });
});
