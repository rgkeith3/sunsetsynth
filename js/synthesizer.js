class Synthesizer {
  constructor(canvas, looperDest, context, analyser) {
    this.canvas = canvas;
    this.looperDest = looperDest;
    this.audCtx = context;
    this.analyser = analyser;
    this.setupGain();
    this.setupNodes();
    this.canvas.addEventListener('mousemove', this.trackMouse.bind(this));
    this.osc = this.audCtx.createOscillator();
    this.playing = false;
  }

  setupGain() {
    this.gainNode = this.audCtx.createGain();
    this.gainNode.gain.value = 0;
  }

  setupNodes() {
    this.filterNode = this.audCtx.createBiquadFilter();
    this.filterNode.type = 'lowpass';
    this.filterNode.Q.value = 15;
  }

  trackMouse(e) {
    this.xPos = e.clientX;
    this.yPos = e.clientY;
    if (this.playing) {
      this.updateY();
      this.updateX();
    }
  }

  updateY() {
    const PITCHES  = [110,
                      130.81,
                      146.83,
                      164.81,
                      196,
                      220,
                      261.63,
                      293.66,
                      329.63,
                      392,
                      440,
                      523.25,
                      587.33,
                      659.25,
                      783.99,
                      880];
    let step = Math.floor(((this.yPos / this.canvas.height) * PITCHES.length) - 2);
    this.osc.frequency.value = PITCHES[step];
  }

  updateX() {
    this.filterNode.frequency.value = this.xPos * 4;
  }

  startSynth() {
    this.osc = this.audCtx.createOscillator();
    this.osc.type = 'square'
    this.osc.frequency.value = this.yPos;
    this.osc.connect(this.filterNode);
    this.filterNode.connect(this.gainNode);
    this.gainNode.connect(this.audCtx.destination);
    this.gainNode.connect(this.looperDest);
    this.gainNode.gain.linearRampToValueAtTime(0.5, this.audCtx.currentTime + 0.1);
    this.playing = true;
    this.osc.start();
  }

  stopSynth() {
    this.playing = false;
    this.gainNode.gain.linearRampToValueAtTime(0, this.audCtx.currentTime + 0.25);
    this.osc.stop(this.audCtx.currentTime + 0.25);
  }
}

module.exports = Synthesizer;
