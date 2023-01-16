const isPlaying = (_chai) => {
  function assertIsPlaying() {
    const $playing = [...this._obj].find(
      ($element) => $element.readyState >= 2 && !$element.paused
    );
    this.assert(
      $playing !== undefined,
      "expected #{this} to be playing",
      "expected #{this} not to be playing"
    );
  }

  _chai.Assertion.addMethod("playing", assertIsPlaying);
};

chai.use(isPlaying);
