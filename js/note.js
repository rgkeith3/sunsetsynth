class Note {
  constructor(ctx, freq) {
    this.ctx = ctx
    this.freq = freq
    this.trigger()
  }

  trigger() {
    let osc = this.ctx.createOscillator();
    osc.frequency.value = this.freq;
    osc.connect(this.ctx.destination);
    osc.start();
    setTimeout(() => osc.stop(0), 50);
  }
};

module.exports = Note;
