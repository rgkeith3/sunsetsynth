const Phrase = require("./phrase")
const Note = require("./note")
const Loop = require("./loop")
const Synthesizer = require("./synthesizer")

class Looper {
  constructor(canvas) {
    this.canvas = canvas;
    this.vizCtx = this.canvas.getContext('2d');
    this.loopCtx = new AudioContext();
    this.canvas.addEventListener('mousedown', this.startRecord.bind(this));
    this.canvas.addEventListener('mouseup', this.handleLeave.bind(this));
    this.canvas.addEventListener('mouseleave', this.handleLeave.bind(this));
    this.setup();
    this.recording = false;
    this.count = 0;
    this.loops = [];
    setInterval(this.clock.bind(this), 50);
  }

  handleLeave(e) {
    if (this.recording) {
      this.stopRecord()
    }
  }

  setup() {
    //first set up destination and recorder
    this.recDest = this.loopCtx.createMediaStreamDestination();
    this.rec = new MediaRecorder(this.recDest.stream);

    this.synth = new Synthesizer(this.canvas, this.recDest, this.loopCtx);

    //set callbacks for when the recorder is finished
    //to pass the recorded data to chunks Array
    this.rec.ondataavailable = (e) => this.chunks.push(e.data);
    //then chunks is turned into a blob
    this.rec.onstop = (e) => {
      let blob = new Blob(this.chunks, {'type': 'audio/ogg;'});
      let fileReader = new FileReader();
      //then we set the callback for when the filereader is done reading the file
      fileReader.onloadend = () => {
        this.loopCtx.decodeAudioData(fileReader.result)
          //it passes the buffer to the loop
          .then(data => this.loop.buffer = data)
          //which is pushed into the loops object
          .then(() => this.loops.push(this.loop))
          //then things are reset to be garbage collected
          .then(() => this.recDest = null)
          .then(() => console.log(this.loops))
      }
      fileReader.readAsArrayBuffer(blob)
    }
  }

  startRecord(e) {
    //declare variables for recording loop
    this.loop = new Loop(this.count, this.loopCtx);
    this.chunks = [];

    this.recording = true;
    this.synth.startSynth()
    this.rec.start();
  }

  stopRecord(e) {
    this.rec.stop();
    this.synth.stopSynth()
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
