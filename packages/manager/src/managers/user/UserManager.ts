import { SliceMachineError } from "../../errors";
import { BaseManager } from "../BaseManager";
import { SliceMachineManager } from "../SliceMachineManager";

export class UserManager extends BaseManager {
	constructor(sliceMachineManager: SliceMachineManager) {
		super(sliceMachineManager);

		if (!sliceMachineManager.getPrismicAuthManager()) {
			throw new SliceMachineError(
				"SliceMachineManager._prismicAuthManager must be set with a PrismicAuthManager instance before instantiating UserManager.",
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
	getAuthenticationCookies =
		this.prismicAuthManager.getAuthenticationCookies.bind(
			this.prismicAuthManager,
		);
	getProfile = this.prismicAuthManager.getProfile.bind(this.prismicAuthManager);
}
