class Loop {
  constructor(count, audCtx, analyser) {
    this.count = count;
    this.audCtx = audCtx;
    this.analyser = analyser;
    this.buffer;
    this.source;
    this.playing = false;
  }

  trigger() {
    if (!this.playing) {
      this.source = this.audCtx.createBufferSource();
      this.source.buffer = this.buffer;
      this.source.onended = this.stopPlay.bind(this);
      this.source.connect(this.analyser);
      this.playing = true
      this.source.start();
    }
  }

  stopPlay() {
    this.playing = false;
  }

  getAnalyserData() {
    let bufferLength = this.analyser.frequencyBinCount;
    let dataArray = new Uint8Array(bufferLength);
    this.analyser.getByteFrequencyData(dataArray);
    return dataArray;
  }
}

module.exports = Loop;
