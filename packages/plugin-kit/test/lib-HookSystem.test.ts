import { it, expect, vi } from "vitest";

import { HookError, HookSystem } from "../src/lib";

it("calls hooks", async () => {
	const system = new HookSystem();

	const foo = vi.fn();
	const bar = vi.fn();
	const baz = vi.fn();

	system.hook("root", "hook1", foo);
	system.hook("root", "hook1", bar);
	system.hook("root", "hook2", baz);

	await system.callHook("hook1");

	expect(foo).toHaveBeenCalledTimes(1);
	expect(bar).toHaveBeenCalledTimes(1);
	expect(baz).not.toHaveBeenCalled();

	await system.callHook("hook2");

	expect(foo).toHaveBeenCalledTimes(1);
	expect(bar).toHaveBeenCalledTimes(1);
	expect(baz).toHaveBeenCalledTimes(1);
});

it("calls hooks from scope", async () => {
	const system = new HookSystem();

	const { hook: fooHook } = system.createScope("foo", ["fooArg1", "fooArg2"]);
	const { hook: barHook } = system.createScope("bar", ["barArg1"]);

	const baz = vi.fn();
	const qux = vi.fn();
	const quux = vi.fn();

	fooHook("hook1", baz);
	barHook("hook1", qux);
	barHook("hook2", quux);

	await system.callHook("hook1");

	expect(baz).toHaveBeenCalledTimes(1);
	expect(qux).toHaveBeenCalledTimes(1);
	expect(quux).not.toHaveBeenCalled();

	await system.callHook("hook2");

	expect(baz).toHaveBeenCalledTimes(1);
	expect(qux).toHaveBeenCalledTimes(1);
	expect(quux).toHaveBeenCalledTimes(1);
});

it("calls hooks from scope with additional args", async () => {
	const system = new HookSystem();

	const { hook: fooHook } = system.createScope("foo", ["fooArg1", "fooArg2"]);
	const { hook: barHook } = system.createScope("bar", ["barArg1"]);

	const baz = vi.fn();
	const qux = vi.fn();

	fooHook("hook", baz);
	barHook("hook", qux);

	await system.callHook("hook", "quxArg1");

	expect(baz).toHaveBeenCalledTimes(1);
	expect(baz).toHaveBeenCalledWith("quxArg1", "fooArg1", "fooArg2");
	expect(qux).toHaveBeenCalledTimes(1);
	expect(qux).toHaveBeenCalledWith("quxArg1", "barArg1");
});

it("stops calling hook when unhooked", async () => {
	const system = new HookSystem();

	const foo = vi.fn();
	const bar = vi.fn();

	system.hook("root", "hook1", foo);
	system.hook("root", "hook1", bar);

	await system.callHook("hook1");

	expect(foo).toHaveBeenCalledTimes(1);
	expect(bar).toHaveBeenCalledTimes(1);

	system.unhook("hook1", foo);

	await system.callHook("hook1");

	expect(foo).toHaveBeenCalledTimes(1);
	expect(bar).toHaveBeenCalledTimes(2);

	system.unhook("hook1", bar);

	await system.callHook("hook1");

	expect(foo).toHaveBeenCalledTimes(1);
	expect(bar).toHaveBeenCalledTimes(2);
});

it("stops calling hook from scope when unhooked", async () => {
	const system = new HookSystem();

	const { hook, unhook } = system.createScope("foo", ["fooArg1", "fooArg2"]);

	const bar = vi.fn();
	const baz = vi.fn();

	hook("hook1", bar);
	hook("hook1", baz);

	await system.callHook("hook1");

	expect(bar).toHaveBeenCalledTimes(1);
	expect(baz).toHaveBeenCalledTimes(1);

	unhook("hook1", bar);

	await system.callHook("hook1");

	expect(bar).toHaveBeenCalledTimes(1);
	expect(baz).toHaveBeenCalledTimes(2);

	unhook("hook1", baz);

	await system.callHook("hook1");

	expect(bar).toHaveBeenCalledTimes(1);
	expect(baz).toHaveBeenCalledTimes(2);
});

it("returns an empty array when no hook registered", async () => {
	const system = new HookSystem();

	const result = await system.callHook("hook1");

	expect(result).toStrictEqual({ data: [], errors: [] });
});

it("returns hook returned values in order", async () => {
	const system = new HookSystem();

	const { hook } = system.createScope("root", []);

	const foo = vi.fn(() => "foo");
	const bar = vi.fn(() => "bar");

	system.hook("root", "hook1", foo);
	hook("hook1", bar);

	const result = await system.callHook("hook1");

	expect(result).toStrictEqual({ data: ["foo", "bar"], errors: [] });
});

it("returns hook errors in order", async () => {
	const system = new HookSystem();

	const foo = vi.fn(() => {
		throw new Error("foo");
	});
	const bar = vi.fn(() => {
		throw "bar";
	});

	system.hook("baz", "hook1", foo);
	system.hook("qux", "hook1", bar);

	const result = await system.callHook("hook1");

	expect(result.data.length).toBe(0);
	expect(result.errors.length).toBe(2);

	expect(result.errors[0]).toBeInstanceOf(HookError);
	expect(result.errors[0].owner).toBe("baz");
	expect(result.errors[0].cause).toBeInstanceOf(Error);

	expect(result.errors[1]).toBeInstanceOf(HookError);
	expect(result.errors[1].owner).toBe("qux");
	expect(result.errors[1].cause).toBe(undefined);
	expect(result.errors[1].rawCause).toBe("bar");
});

it("allows inspection of registered hooks for owner", () => {
	const system = new HookSystem();

	const { hook } = system.createScope("bar", []);

	system.hook("foo", "hook1", vi.fn());
	system.hook("foo", "hook2", vi.fn());
	hook("hook1", vi.fn());

	expect(
		system
			.hooksForOwner("foo")
			.map((registeredHook) => registeredHook.meta.type),
	).toStrictEqual(["hook1", "hook2"]);
	expect(
		system
			.hooksForOwner("bar")
			.map((registeredHook) => registeredHook.meta.type),
	).toStrictEqual(["hook1"]);
	expect(
		system
			.hooksForOwner("baz")
			.map((registeredHook) => registeredHook.meta.type),
	).toStrictEqual([]);
});

it("allows inspection of registered hooks for type", () => {
	const system = new HookSystem();

	const { hook } = system.createScope("bar", []);

	system.hook("foo", "hook1", vi.fn());
	system.hook("foo", "hook2", vi.fn());
	hook("hook1", vi.fn());

	expect(
		system
			.hooksForType("hook1")
			.map((registeredHook) => registeredHook.meta.owner),
	).toStrictEqual(["foo", "bar"]);
	expect(
		system
			.hooksForType("hook2")
			.map((registeredHook) => registeredHook.meta.owner),
	).toStrictEqual(["foo"]);
	expect(
		system
			.hooksForType("hook3")
			.map((registeredHook) => registeredHook.meta.owner),
	).toStrictEqual([]);
});

it("calls only hook with specified hook ID", async () => {
	const system = new HookSystem();

	const foo = vi.fn();
	const bar = vi.fn();

	system.hook("foo", "hook1", foo);
	system.hook("bar", "hook1", bar);

	const [
		{
			meta: { id },
		},
	] = system.hooksForType("hook1");

	await system.callHook({ type: "hook1", hookID: id });

	expect(foo).toHaveBeenCalledTimes(1);
	expect(bar).toHaveBeenCalledTimes(0);
});

it("throws when hook with specified hook ID is not found", async () => {
	const system = new HookSystem();

	await expect(
		system.callHook({ type: "hook1", hookID: "-1" }),
	).rejects.toThrowError(`Hook of type \`hook1\` with ID \`-1\` not found.`);
});
