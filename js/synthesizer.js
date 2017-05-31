class Synthesizer {
  constructor(canvas, looperDest, context) {
    this.canvas = canvas;
    this.canvas.addEventListener('mousemove', this.trackMouse.bind(this));
    this.looperDest = looperDest;
    this.audCtx = context
    this.osc = this.audCtx.createOscillator();
  }

  trackMouse(e) {
    this.xPos = e.clientX;
    this.yPos = e.clientY;
    this.updateY();
    this.updateX();
  }

  updateY() {
    this.osc.frequency.value = this.yPos;
  }

  updateX() {
    console.log(this.xPos);
  }

  startSynth() {
    this.osc = this.audCtx.createOscillator();
    this.osc.frequency.value = this.yPos;
    this.osc.connect(this.audCtx.destination);
    this.osc.connect(this.looperDest);
    this.osc.start();
  }

  stopSynth() {
    this.osc.stop();
  }
}

module.exports = Synthesizer;
