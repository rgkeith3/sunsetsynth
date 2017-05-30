class Note {
  constructor(ctx, freq, dur) {
    this.ctx = ctx;
    this.osc = this.ctx.createOscillator();
    this.osc.frequency.value = freq;
    this.osc.connect(this.ctx.destination);
    this.dur = dur
  }

  trigger() {
    this.osc.start();
    setTimeout(() => this.osc.stop(0), this.dur);
  }
};

module.exports = Note;
