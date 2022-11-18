import { createPrismicAuthManager } from "../auth/createPrismicAuthManager";

import { BaseManager } from "./BaseManager";

export class UserManager extends BaseManager {
	private prismicAuthManager = createPrismicAuthManager();

	login = this.prismicAuthManager.login.bind(this.prismicAuthManager);
	logout = this.prismicAuthManager.logout.bind(this.prismicAuthManager);
	checkIsLoggedIn = this.prismicAuthManager.checkIsLoggedIn.bind(
		this.prismicAuthManager,
	);
	getProfile = this.prismicAuthManager.getProfile.bind(this.prismicAuthManager);
}
