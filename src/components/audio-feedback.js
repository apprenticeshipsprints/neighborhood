/**
 * Emits audioFrequencyChange events based on a networked audio source
 * @namespace avatar
 * @component networked-audio-analyser
 */
AFRAME.registerComponent("networked-audio-analyser", {
  async init() {
    this.volume = 0;
    this.el.addEventListener("sound-source-set", event => {
      const ctx = THREE.AudioContext.getContext();
      this.analyser = ctx.createAnalyser();
      this.analyser.fftSize = 32;
      this.levels = new Uint8Array(this.analyser.frequencyBinCount);
      event.detail.soundSource.connect(this.analyser);
    });
  },

  tick: function() {
    if (!this.analyser) return;

    this.analyser.getByteFrequencyData(this.levels);

    let sum = 0;
    for (let i = 0; i < this.levels.length; i++) {
      sum += this.levels[i];
    }
    this.volume = sum / this.levels.length;
  }
});

/**
 * Sets an entity's color base on audioFrequencyChange events.
 * @component matcolor-audio-feedback
 */
AFRAME.registerComponent("matcolor-audio-feedback", {
  tick() {
    const audioAnalyser = this.el.components["networked-audio-analyser"];

    if (!audioAnalyser || !this.mat) return;

    this.object3D.mesh.color.setScalar(1 + audioAnalyser.volume / 255 * 2);
  }
});

/**
 * Sets an entity's scale base on audioFrequencyChange events.
 * @namespace avatar
 * @component scale-audio-feedback
 */
AFRAME.registerComponent("scale-audio-feedback", {
  schema: {
    minScale: { default: 1 },
    maxScale: { default: 2 }
  },

  tick() {
    // TODO: come up with a cleaner way to handle this.
    // bone's are "hidden" by scaling them with bone-visibility, without this we would overwrite that.
    if (!this.el.object3D.visible) return;

    const { minScale, maxScale } = this.data;

    const audioAnalyser = this.el.components["networked-audio-analyser"];

    if (!audioAnalyser) return;

    this.el.object3D.scale.setScalar(minScale + (maxScale - minScale) * audioAnalyser.volume / 255);
  }
});
