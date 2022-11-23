import { HookSystem } from "../src/lib";

// Placeholder function
const fn = () => null;

// ============================================================================
// ## Untyped
// ============================================================================

// System
const untypedSystem = new HookSystem();

// Scoped variant
const { hook: untypedHook } = untypedSystem.createScope("_", []);

/**
 * Hooks accept no meta arguments
 */
untypedSystem.hook("_", "hook1", fn);
untypedHook("hook1", fn);

/**
 * Hooks accept empty meta arguments
 */
untypedSystem.hook("_", "hook1", fn, {});
untypedHook("hook1", fn, {});

/**
 * Hooks accept meta arguments
 */
untypedSystem.hook("_", "hook1", fn, { foo: "bar" });
untypedHook("hook1", fn, { foo: "bar" });

// ============================================================================
// ## Typed
// ============================================================================

// Hook system hooks
type Hooks = {
	hook1: { fn: () => null };
	hook2: { fn: () => null; meta: { foo: string } };
};

// System
const typedSystem = new HookSystem<Hooks>();

// Scoped variant
const { hook: typedHook } = typedSystem.createScope("_", []);

/**
 * Hooks requiring no meta don't require a meta argument.
 */
typedSystem.hook("_", "hook1", fn);
typedHook("hook1", fn);

/**
 * Hooks requiring no meta don't accept an optional meta argument.
 */
// @ts-expect-error - errors about unwanted meta argument.
typedSystem.hook("_", "hook1", fn, { foo: "bar" });
// @ts-expect-error - errors about unwanted meta argument.
typedHook("hook1", fn, { foo: "bar" });

/**
 * Hooks requiring meta error about missing meta argument.
 */
// @ts-expect-error - errors about missing meta argument.
typedSystem.hook("_", "hook2", fn);
// @ts-expect-error - errors about missing meta argument.
typedHook("hook2", fn);

/**
 * Hooks requiring meta error about mistyped meta argument.
 */
// @ts-expect-error - errors about mistyped meta argument.
typedSystem.hook("_", "hook2", fn, { foo: 1 });
// @ts-expect-error - errors about mistyped meta argument.
typedHook("hook2", fn, { foo: 1 });

/**
 * Hooks requiring meta accept a meta argument.
 */
typedSystem.hook("_", "hook2", fn, { foo: "bar" });
typedHook("hook2", fn, { foo: "bar" });

/**
 * Hooks requiring meta don't accept a meta argument with additional arbitrary
 * properties.
 */
// @ts-expect-error - errors about additional arbitrary properties.
typedSystem.hook("_", "hook2", fn, { foo: "bar", qux: "quux" });
// @ts-expect-error - errors about additional arbitrary properties.
typedHook("hook2", fn, { foo: "bar", qux: "quux" });
