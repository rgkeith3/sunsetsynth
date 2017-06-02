const Orb = require("./orb")

class Visualizer {
  constructor(canvas, analyser) {
    this.canvas = canvas;
    this.visualCtx = this.canvas.getContext('2d');
    this.loopAnalyser = analyser;
    this.orbs = [];
    this.sunset = this.canvas.height / 20;
  }

  createOrb() {
    this.orbs.push(new Orb(this.canvas, this.visualCtx, this.loopAnalyser))
  }

  oscilloscope() {
    let waveFormArray = new Uint8Array(this.loopAnalyser.frequencyBinCount);
    this.loopAnalyser.getByteTimeDomainData(waveFormArray);
    this.visualCtx.lineWidth = 1;
    this.visualCtx.strokeStyle = `rgb(250,0,0)`;
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

  bottomBars(dataArray) {
    let barHeight = ((this.canvas.height / 2) / dataArray.length) + 1;
    let barWidth;
    let y = this.canvas.height / 2;

    for (var i = 0; i < dataArray.length; i++) {
      barWidth = dataArray[i] * (2 / (256 / (256 - i)));


      this.visualCtx.fillStyle = `rgba(${barWidth + 50},0,${barWidth + 50}, ${barWidth / 500} )`;
      this.visualCtx.fillRect((this.canvas.width - barWidth) / 2, y,
                              barWidth, barHeight);

      y += barHeight;
    }
  }

  topBars(dataArray) {
    let barWidth = ((this.canvas.width / 2 )/ (dataArray.length / 2));
    let barHeight;
    let x = this.canvas.width / 2;
    let x2 = this.canvas.width / 2;

    for (var i = 0; i < dataArray.length; i += 1) {
      barHeight = (this.canvas.height / 2) * (dataArray[i] / 256);

      this.visualCtx.fillStyle = `rgba(256,128,0, ${barHeight / 256} )`;
      this.visualCtx.fillRect(x, (this.canvas.height / 2) - barHeight, barWidth, barHeight);
      this.visualCtx.fillRect(x2, (this.canvas.height / 2) - barHeight, barWidth, barHeight);

      x -= barWidth
      x2 += barWidth;
    }
  }

  drawOrbs(dataArray) {
    this.orbs.forEach(orb => orb.draw(dataArray))
  }

  draw() {
    let dataArray = new Uint8Array(this.loopAnalyser.frequencyBinCount);
    this.loopAnalyser.getByteFrequencyData(dataArray);

    let background = this.visualCtx.createLinearGradient(this.canvas.width / 2, 0,
                                                         this.canvas.width / 2, this.canvas.height / 2);
    let red = this.sunset < this.canvas.height / 4 ? 256: Math.floor(256 - (this.sunset - (this.canvas.height / 4)));
    let blue = (red < 0) ? Math.floor(this.sunset - ((this.canvas.height / 4) + 256)) : 0

    background.addColorStop(0, 'black');
    background.addColorStop(1, `rgb(${red} ,0, ${blue} )`);
    this.visualCtx.fillStyle = background;
    this.visualCtx.fillRect(0,0,this.canvas.width, this.canvas.height / 2)

    this.topBars(dataArray)

    let sunRadius = this.canvas.width / 20 + (dataArray[128] / 3);
    this.visualCtx.beginPath();
    this.visualCtx.arc(this.canvas.width / 2, this.canvas.height / 4 + this.sunset , sunRadius, 0, 2* Math.PI);
    this.visualCtx.fillStyle = 'yellow';
    this.visualCtx.fill();

    this.visualCtx.fillStyle = 'rgb(0,0,0)';
    this.visualCtx.fillRect(0, this.canvas.height / 2, this.canvas.width, this.canvas.height / 2);

    this.bottomBars(dataArray);
    this.oscilloscope();
    this.drawOrbs(dataArray);

    this.sunset += .1;
  }
}

module.exports = Visualizer;
