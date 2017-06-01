class Orb {
  constructor(canvas, vizCtx, analyser) {
    this.canvas = canvas;
    this.ctx = vizCtx;
    this.analyser = analyser;
    this.radius = 15;
    this.pos = [Math.floor(Math.random() * (this.canvas.width - this.radius)),
                Math.floor(Math.random() * (this.canvas.width - this.radius))];
    this.vector = [Math.floor(Math.random() * 4) - 2,
                   Math.floor(Math.random() * 4) - 2];
    this.analyserNode = Math.floor(Math.random() * 256);
  }

  vectorMath(dataArray) {
    this.radius = (dataArray[this.analyserNode] / 256) * 50;

    for (var i = 0; i < this.vector.length; i++) {
      if (this.vector[i] === 0) {
        this.vector[i] += 1;
      }
    }

    let multiplier;
    if (dataArray[this.analyserNode] === 0) {
      multiplier = 1;
    } else if (dataArray[this.analyserNode] > 0 && dataArray[this.analyserNode] < 50 ) {
      multiplier = 3;
    } else if (dataArray[this.analyserNode] > 50 && dataArray[this.analyserNode] < 150 ) {
      multiplier = 5;
    } else {
      multiplier = 7;
    }

    for (var i = 0; i < 2; i++) {
      if (this.pos[i] + (this.vector[i] * multiplier) + this.radius >= this.canvas.width ||
      this.pos[i] + (this.vector[i] * multiplier) - this.radius <= 0) {
        this.vector[i] *= -1;
      }
    }

    this.pos[0] += (this.vector[0] * multiplier);
    this.pos[1] += (this.vector[1] * multiplier);

  }

  draw(dataArray) {
    this.vectorMath(dataArray);

    let orb = this.ctx.createRadialGradient(this.pos[0], this.pos[1], this.radius, this.pos[0], this.pos[1], 0)
    orb.addColorStop(0, `rgba(${dataArray[this.analyserNode]}, ${dataArray[this.analyserNode]},0,0)`);
    orb.addColorStop(1, `rgba(${dataArray[this.analyserNode]}, ${dataArray[this.analyserNode]}, 0, ${dataArray[this.analyserNode]})`)
    this.ctx.beginPath();
    this.ctx.arc(this.pos[0], this.pos[1], this.radius, 0, 2* Math.PI);
    this.ctx.fillStyle = orb;
    this.ctx.fill();
  }
}

module.exports = Orb;
