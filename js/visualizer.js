class Visualizer {
  constructor(canvas, analyser) {
    this.canvas = canvas;
    this.visualCtx = this.canvas.getContext('2d');
    this.loopAnalyser = analyser;
    this.orbs = [];
  }

  createOrb() {
    let x = Math.random() * this.canvas.width;
    let y = Math.random() * this.canvas.height;
    this.orbs.push([x, y])
  }

  oscilloscope() {
    let waveFormArray = new Uint8Array(this.loopAnalyser.frequencyBinCount);
    this.loopAnalyser.getByteTimeDomainData(waveFormArray);
    this.visualCtx.lineWidth = 2;
    this.visualCtx.strokeStyle = 'rgb(250,250,250)';
    this.visualCtx.beginPath();

    let sliceWidth = this.canvas.width * 1.0 / waveFormArray.length;
    let slice = 0;

    for (var i = 0; i < waveFormArray.length; i++) {
      let v = waveFormArray[i] / 128.0;
      let y = v * this.canvas.height / 2;

      if (i === 0) {
        this.visualCtx.moveTo(slice, y);
      } else {
        this.visualCtx.lineTo(slice, y);
      }

      slice += sliceWidth;
    }

    this.visualCtx.lineTo(this.canvas.width, this.canvas.height / 2);
    this.visualCtx.stroke();
  }

  bars() {
    let dataArray = new Uint8Array(this.loopAnalyser.frequencyBinCount);
    this.loopAnalyser.getByteFrequencyData(dataArray);


    let barWidth = (this.canvas.width / dataArray.length) + 1;
    let barHeight;
    let x = 0;
    let x2 = this.canvas.width - barWidth;

    for (var i = 0; i < dataArray.length; i++) {
      barHeight = dataArray[i]

      this.visualCtx.fillStyle = 'rgb(' + (barHeight + 100) + ',50,50)';
      this.visualCtx.fillRect(x, this.canvas.height-barHeight, barWidth, barHeight);

      x += barWidth;

      this.visualCtx.fillStyle = 'rgb(' + (barHeight + 100) + ',50,50)';
      this.visualCtx.fillRect(x2, 0, barWidth, barHeight);

      x2 -= barWidth;
    }
  }

  drawOrbs() {
    let dataArray = new Uint8Array(this.loopAnalyser.frequencyBinCount);
    this.loopAnalyser.getByteFrequencyData(dataArray);
    this.orbs.forEach(orb => {
      let radius = dataArray[150];
      this.visualCtx.beginPath();
      this.visualCtx.arc(orb[0], orb[1], radius, 0, 2* Math.PI, false);
      this.visualCtx.fillStyle = 'green';
      this.visualCtx.fill();
    })
  }

  draw() {
    this.visualCtx.fillStyle = 'rgb(0,0,0)';
    this.visualCtx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.bars();
    this.oscilloscope();
    this.drawOrbs();
  }
}

module.exports = Visualizer;
