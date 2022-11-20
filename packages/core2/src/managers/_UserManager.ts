import { createPrismicAuthManager } from "../auth/createPrismicAuthManager";

import { BaseManager } from "./_BaseManager";

export class UserManager extends BaseManager {
	prismicAuthManager = createPrismicAuthManager();

	login = this.prismicAuthManager.login.bind(this.prismicAuthManager);
	logout = this.prismicAuthManager.logout.bind(this.prismicAuthManager);
	checkIsLoggedIn = this.prismicAuthManager.checkIsLoggedIn.bind(
		this.prismicAuthManager,
	);
	getProfile = this.prismicAuthManager.getProfile.bind(this.prismicAuthManager);
	getProfileForAuthenticationToken =
		this.prismicAuthManager.getProfileForAuthenticationToken.bind(
			this.prismicAuthManager,
		);
	getAuthenticationToken = this.prismicAuthManager.getAuthenticationToken.bind(
		this.prismicAuthManager,
	);
}
