const Loop = require("./loop")
const Synthesizer = require("./synthesizer")
const Visualizer = require("./visualizer")

class Looper {
  constructor(canvas) {
    this.canvas = canvas;
    this.loopCtx = new AudioContext();
    this.analyser = this.loopCtx.createAnalyser();
    this.analyser.fftsize = 256;
    this.analyser.connect(this.loopCtx.destination);

    this.visualizer = new Visualizer(this.canvas, this.analyser);
    this.canvas.addEventListener('mousedown', this.handleDown.bind(this));
    this.canvas.addEventListener('mouseup', this.handleLeave.bind(this));
    this.canvas.addEventListener('mouseleave', this.handleLeave.bind(this));
    this.setup();
    this.count = 0;
    this.loops = [];
    setInterval(this.clock.bind(this), 50);
  }

  handleLeave(e) {
    if (this.rec.state === 'recording') {
      this.stopRecord()
    }
  }

  handleDown(e) {
    if (e.button === 0) {
      this.startRecord()
    } else if (e.button === 2) {
      this.loops.pop
    }
  }

  setup() {
    //first set up destination and recorder
    this.recDest = this.loopCtx.createMediaStreamDestination();
    this.rec = new MediaRecorder(this.recDest.stream);

    this.synth = new Synthesizer(this.canvas, this.recDest, this.loopCtx, this.analyser);

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
          .then(() => this.visualizer.createOrb())
      }
      fileReader.readAsArrayBuffer(blob)
    }
  }

  startRecord() {
    //declare variables for recording loop
    this.loop = new Loop(this.count, this.loopCtx, this.analyser);
    this.chunks = [];

    if (this.rec.state === 'inactive') {
      this.rec.start();
    }

    this.synth.startSynth()
  }

  stopRecord(e) {
    this.recording = false
    this.synth.stopSynth()
    setTimeout(() => {
      if (this.rec.state === 'recording') {
        this.rec.stop()
      }
    }, 1000)
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
    this.visualizer.draw();
  }
}


const init = () => {
  const synth = document.getElementById('synth');
  const looper = new Looper(synth);
}





document.addEventListener("DOMContentLoaded", init)
