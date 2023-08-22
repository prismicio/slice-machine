import * as tsm from "ts-morph";
import * as crypto from "node:crypto";

const project = new tsm.Project({ useInMemoryFileSystem: true });

export const parseSourceFile = (
	sourceFileText: string,
	extension = ".ts",
): tsm.SourceFile => {
	const filePath =
		crypto.createHash("md5").update(sourceFileText).digest("hex") + extension;

	return project.createSourceFile(filePath, sourceFileText, {
		overwrite: true,
	});
};
