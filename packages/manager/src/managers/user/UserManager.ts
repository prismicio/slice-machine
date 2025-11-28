import { PrismicError } from "../../errors";
import { BaseManager } from "../BaseManager";
import { PrismicManager } from "../PrismicManager";

export class UserManager extends BaseManager {
	constructor(prismicManager: PrismicManager) {
		super(prismicManager);

		if (!prismicManager.getPrismicAuthManager()) {
			throw new PrismicError(
				"PrismicManager._prismicAuthManager must be set with a PrismicAuthManager instance before instantiating UserManager.",
			);
		}
	}

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
	getProfile = this.prismicAuthManager.getProfile.bind(this.prismicAuthManager);
}
