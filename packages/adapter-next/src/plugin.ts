import { defineSliceMachinePlugin } from "@slicemachine/plugin-kit";

import { name as pkgName } from "../package.json";
import { PluginOptions } from "./types";

import { projectInit } from "./hooks/project-init";
import { customTypeAssetDelete } from "./hooks/customType-asset-delete";
import { customTypeAssetRead } from "./hooks/customType-asset-read";
import { customTypeAssetUpdate } from "./hooks/customType-asset-update";
import { customTypeCreate } from "./hooks/customType-create";
import { customTypeDelete } from "./hooks/customType-delete";
import { customTypeLibraryRead } from "./hooks/customTypeLibrary-read";
import { customTypeRead } from "./hooks/customType-read";
import { customTypeRename } from "./hooks/customType-rename";
import { customTypeUpdate } from "./hooks/customType-update";
import { sliceAssetDelete } from "./hooks/slice-asset-delete";
import { sliceAssetRead } from "./hooks/slice-asset-read";
import { sliceAssetUpdate } from "./hooks/slice-asset-update";
import { sliceCreate } from "./hooks/slice-create";
import { sliceDelete } from "./hooks/slice-delete";
import { sliceLibraryRead } from "./hooks/sliceLibrary-read";
import { sliceRead } from "./hooks/slice-read";
import { sliceRename } from "./hooks/slice-rename";
import { sliceUpdate } from "./hooks/slice-update";
import { snippetRead } from "./hooks/snippet-read";
import { documentationRead } from "./hooks/documentation-read";
import { sliceSimulatorSetupRead } from "./hooks/sliceSimulator-setup-read";

export const plugin = defineSliceMachinePlugin<PluginOptions>({
	meta: {
		name: pkgName,
	},
	defaultOptions: {
		format: true,
		lazyLoadSlices: true,
	},
	setup({ hook }) {
		hook("project:init", projectInit);

		hook("slice:create", sliceCreate);
		hook("slice:update", sliceUpdate);
		hook("slice:rename", sliceRename);
		hook("slice:delete", sliceDelete);
		hook("slice:read", sliceRead);
		hook("slice:asset:update", sliceAssetUpdate);
		hook("slice:asset:delete", sliceAssetDelete);
		hook("slice:asset:read", sliceAssetRead);
		hook("slice-library:read", sliceLibraryRead);

		hook("custom-type:create", customTypeCreate);
		hook("custom-type:update", customTypeUpdate);
		hook("custom-type:rename", customTypeRename);
		hook("custom-type:delete", customTypeDelete);
		hook("custom-type:read", customTypeRead);
		hook("custom-type:asset:update", customTypeAssetUpdate);
		hook("custom-type:asset:delete", customTypeAssetDelete);
		hook("custom-type:asset:read", customTypeAssetRead);
		hook("custom-type-library:read", customTypeLibraryRead);

		hook("snippet:read", snippetRead);

		hook("documentation:read", documentationRead);

		hook("slice-simulator:setup:read", sliceSimulatorSetupRead);
	},
});
