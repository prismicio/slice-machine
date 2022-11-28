import { BaseManager } from "./_BaseManager";

export class UserManager extends BaseManager {
	login = this.prismicAuthManager.login.bind(this.prismicAuthManager);
	browserLogin = this.prismicAuthManager.browserLogin.bind(
		this.prismicAuthManager,
	);
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
	getAuthenticationCookies =
		this.prismicAuthManager.getAuthenticationCookies.bind(
			this.prismicAuthManager,
		);
}
