import { BaseManager } from "./_BaseManager";

export class UserManager extends BaseManager {
	login = this.prismicAuthManager.login.bind(this.prismicAuthManager);
	logout = this.prismicAuthManager.logout.bind(this.prismicAuthManager);
	checkIsLoggedIn = this.prismicAuthManager.checkIsLoggedIn.bind(
		this.prismicAuthManager,
	);
	refreshAuthenticationToken =
		this.prismicAuthManager.refreshAuthenticationToken.bind(
			this.prismicAuthManager,
		);
	getAuthenticationToken = this.prismicAuthManager.getAuthenticationToken.bind(
		this.prismicAuthManager,
	);
	getProfile = this.prismicAuthManager.getProfile.bind(this.prismicAuthManager);
}
