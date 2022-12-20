import { BaseManager } from "../BaseManager";

export class UserManager extends BaseManager {
	login = this.prismicAuthManager.login.bind(this.prismicAuthManager);
	getLoginSessionInfo = this.prismicAuthManager.getLoginSessionInfo.bind(
		this.prismicAuthManager,
	);
	nodeLoginSession = this.prismicAuthManager.nodeLoginSession.bind(
		this.prismicAuthManager,
	);
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
	getAuthenticationCookies =
		this.prismicAuthManager.getAuthenticationCookies.bind(
			this.prismicAuthManager,
		);
	getProfile = this.prismicAuthManager.getProfile.bind(this.prismicAuthManager);
}
