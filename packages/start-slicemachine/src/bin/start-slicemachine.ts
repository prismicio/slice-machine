// Automatically restart the process ONLY when Vite is in development mode.
if (import.meta.env.DEV) {
	Promise.all([import("node:url"), import("nodemon")]).then(
		([url, nodemon]) => {
			const relativePath = (path: string) =>
				url.fileURLToPath(new URL(path, import.meta.url));

			nodemon
				.default({
					script: relativePath("../cli.cjs"),
					args: process.argv.slice(2),
					delay: 1,
					watch: [
						relativePath("../../dist"),
						relativePath("../../../manager/dist"),
						relativePath("../../../plugin-kit/dist"),
					],
				})
				.on("restart", () => {
					console.info("[dev] Restarting start-slicemachine...");
				});
		},
	);
} else {
	import("../cli");
}
