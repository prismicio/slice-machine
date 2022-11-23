abstract class Manager {
	private _manager: SliceMachineManager;
	protected get user(): UserManager {
		return this._manager.user;
	}
	protected get project(): ProjectManager {
		return this._manager.project;
	}

	constructor(manager: SliceMachineManager) {
		this._manager = manager;
	}
}

class UserManager extends Manager {
	checkIsLoggedIn() {
		return true;
	}
}

class ProjectManager extends Manager {
	// Method names could be less verbose because contextualized
	getRoot() {
		// I like that it preserves the context here
		return this.user.checkIsLoggedIn();
	}
}

const createSliceMachineManager = (): SliceMachineManager => {
	return new SliceMachineManager();
};

class SliceMachineManager {
	// RPC could still be created by "crawling" each Manager and adding prefix to methods?
	user: UserManager;
	project: ProjectManager;

	constructor() {
		// Not sure if this creates a real concurrency issue
		this.user = new UserManager(this);
		this.project = new ProjectManager(this);
	}
}

const manager = createSliceMachineManager();

console.log(manager.project.getRoot());
