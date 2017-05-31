class Note {
  constructor(ctx, freq, nodeParam) {
    this.ctx = ctx;
    this.freq = freq;
    this.nodeParam = nodeParam;
    this.trigger();
  }

  trigger() {
    let node = this.ctx.createBiquadFilter();
    node.type = 'lowpass';
    node.frequency.value = this.nodeParam * this.nodeParam;
    node.gain.value = 50;

    let osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = this.freq;


    osc.connect(node);
    node.connect(this.ctx.destination)
    osc.start();
    setTimeout(() => osc.stop(0), 50);
  }
};

module.exports = Note;
