const Phrase = require("./phrase")
const Note = require("./note")
const Loop = require("./loop")

class Looper {
  constructor(canvas) {
    this.canvas = canvas;
    this.vizCtx = this.canvas.getContext('2d');
    this.audCtx = new AudioContext();
    this.canvas.addEventListener('mousedown', this.startRecord.bind(this));
    this.canvas.addEventListener('mousemove', this.trackMouse.bind(this));
    this.canvas.addEventListener('mouseup', this.handleLeave.bind(this));
    this.canvas.addEventListener('mouseleave', this.handleLeave.bind(this));
    this.recording = false;
    this.count = 0;
    this.loops = [];
    setInterval(this.clock.bind(this), 50);
  }

  trackMouse(e) {
    this.xPos = e.clientX;
    this.yPos = e.clientY;
    if (this.recording) {
      this.osc.frequency.value = this.yPos;
    };
  };

  handleLeave(e) {
    if (this.recording) {
      this.stopRecord()
    }
  }

  startRecord(e) {
    //first set up destination and recorder
    this.dest = this.audCtx.createMediaStreamDestination();
    this.rec = new MediaRecorder(this.dest.stream);
    //declare variables for recording loop
    let loop = new Loop(this.count, this.audCtx);
    let chunks = [];
    //set callbacks for when the recorder is finished
    //to pass the recorded data to chunks Array
    this.rec.ondataavailable = (e) => chunks.push(e.data);
    //then chunks is turned into a blob
    this.rec.onstop = (e) => {
      let blob = new Blob(chunks, {'type': 'audio/ogg;'});
      let fileReader = new FileReader();
      //then we set the callback for when the filereader is done reading the file
      fileReader.onloadend = () => {
        this.audCtx.decodeAudioData(fileReader.result)
          //it passes the buffer to the loop
          .then(data => loop.buffer = data)
          //which is pushed into the loops object
          .then(() => this.loops.push(loop))
          //then things are reset to be garbage collected
          .then(() => this.dest = null)
          .then(() => console.log(this.loops))
      }
      fileReader.readAsArrayBuffer(blob)
    }

    this.osc = this.audCtx.createOscillator();
    this.osc.frequency.value = this.yPos;


    this.osc.connect(this.dest);
    this.osc.connect(this.audCtx.destination);

    this.recording = true;
    this.osc.start();
    this.rec.start();
  }

  stopRecord(e) {
    this.rec.stop();
    this.osc.stop();
    this.recording = false
  }

  playLoops(count) {
    this.loops.forEach(loop => {
      if (loop.count === count) {
        loop.trigger()
      }
    })
  }

  clock() {
    if (this.count < 8000) {
      this.count += 50;
    } else {
      this.count = 0;
    }
    this.playLoops(this.count)
  }
}


const init = () => {
  const synth = document.getElementById('synth');
  const looper = new Looper(synth);
}





document.addEventListener("DOMContentLoaded", init)
