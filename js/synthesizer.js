class Synthesizer {
  constructor(canvas, looperDest, context, analyser) {
    this.canvas = canvas;
    this.looperDest = looperDest;
    this.audCtx = context;
    this.analyser = analyser;
    this.setupGain();
    this.setupNodes();
    document.getElementById('body').addEventListener('mousemove', this.trackMouse.bind(this));
    this.osc = this.audCtx.createOscillator();
    this.wave = 'sine'
    this.playing = false;
    this.recording = false;
    this.looping = true;
  }

  setupGain() {
    this.gainNode = this.audCtx.createGain();
    this.gainNode.gain.value = 0;
  }

  setupNodes() {
    this.filterNode = this.audCtx.createBiquadFilter();
    this.filterNode.type = 'lowpass';
    this.filterNode.Q.value = 5;
  }

  changeWave(e) {
    document.getElementById(this.wave).classList.remove('active');
    this.wave = e.currentTarget.id;
    e.currentTarget.classList.add('active');
  }

  trackMouse(e) {
    this.xPos = e.clientX;
    this.yPos = this.canvas.height - e.clientY;
    if (this.playing) {
      this.updateY();
      this.updateX();
    }
  }

  updateY() {
    const PITCHES  = [110,
                      131,
                      147,
                      165,
                      196,
                      220,
                      262,
                      294,
                      330,
                      392,
                      440,
                      523,
                      587,
                      659,
                      784,
                      880];
    let step = Math.floor(((this.yPos / this.canvas.height) * PITCHES.length) - 2);
    if (step < 0) {step = 0}
    this.osc.frequency.value = PITCHES[step];
  }

  updateX() {
    this.filterNode.frequency.value = this.xPos * 10;
  }

  startSynth() {
    this.osc = this.audCtx.createOscillator();
    this.osc.type = this.wave
    this.osc.frequency.value = this.yPos;
    this.osc.connect(this.filterNode);
    this.filterNode.connect(this.gainNode);
    this.gainNode.connect(this.analyser);
    if (this.looping && this.recording) {
      this.gainNode.connect(this.looperDest);
    }
    this.gainNode.gain.linearRampToValueAtTime(0.25, this.audCtx.currentTime + 0.1);
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
