import _jiti from "jiti";

const jiti = _jiti(process.cwd());

export const loadModuleWithJiti = <TModule>(id: string): TModule => {
	const mod = jiti(id) as TModule | { default: TModule };

	return "default" in mod ? mod.default : mod;
};
