const Phrase = require("./phrase")
const Note = require("./note")

class Looper {
  constructor(canvas) {
    this.canvas = canvas;
    this.vizCtx = this.canvas.getContext('2d');
    this.audCtx = new AudioContext();
    this.canvas.addEventListener('mousedown', this.startRecord.bind(this));
    this.canvas.addEventListener('mouseup', this.stopRecord.bind(this));
    this.canvas.addEventListener('mousemove', this.trackMouse.bind(this));
    this.canvas.addEventListener('mouseleave', this.stopRecord.bind(this))
    this.recording = false;
    this.count = 0;
    this.loops = [];
    setInterval(this.clock.bind(this), 50);
  }

  trackMouse(e) {
    this.xPos = e.clientX;
    this.yPos = e.clientY;
  }

  startRecord(e) {
    if (e.button === 0) {
      e.preventDefault()
      this.recording = true;
      this.phrase = new Phrase();
    } else if (e.button === 2) {
      this.loops.pop(1)
    }
  }

  stopRecord(e) {
    if (this.recording) {
      this.loops.push(this.phrase)
      this.recording = false;
      this.phrase = null;
    }
  }

  clock() {
    if (this.recording) {
      let note = new Note(this.audCtx, this.yPos);
      this.phrase.record(this.count, note)
    }
    this.loops.forEach(loop => {
      loop.play(this.count);
    })
    if (this.count < 8000) {
      this.count += 50;
    } else {
      this.count = 0;
    }
  }
}


const init = () => {
  const synth = document.getElementById('synth');
  const looper = new Looper(synth);
}





document.addEventListener("DOMContentLoaded", init)
