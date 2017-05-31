class Loop {
  constructor(count, ctx) {
    this.count = count;
    this.ctx = ctx;
    this.buffer;
    this.source;
    this.playing = false;
  }

  trigger() {
    if (!this.playing) {
      this.source = this.ctx.createBufferSource();
      this.source.buffer = this.buffer;
      this.source.onended = (e) => {
        this.playing = false;
        this.source = null;
      }
      this.source.connect(this.ctx.destination)
      this.source.start()
    }
  }
}

module.exports = Loop;
