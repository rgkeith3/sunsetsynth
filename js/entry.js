const Loop = require("./loop")
const Synthesizer = require("./synthesizer")
const Visualizer = require("./visualizer")

class Looper {
  constructor(canvas) {
    this.canvas = canvas;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    window.addEventListener('resize', () => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    })
    this.loopCtx = new AudioContext();

    this.analyser = this.loopCtx.createAnalyser();
    this.analyser.fftsize = 256;
    this.analyser.connect(this.loopCtx.destination);

    this.visualizer = new Visualizer(this.canvas, this.analyser);
    this.canvas.addEventListener('mousedown', this.handleDown.bind(this));
    document.getElementById('body').addEventListener('mouseup', this.handleLeave.bind(this));
    document.getElementById('body').addEventListener('mouseleave', this.handleLeave.bind(this));
    this.setup();
    this.recording = false;
    this.looping = true;
    this.count = 0;
    this.loops = [];
    setInterval(this.clock.bind(this), 50);
  }

  handleLeave(e) {
    if (this.rec.state === 'recording') {
      this.stopRecord();
    } else if (this.synth.playing) {
      this.synth.stopSynth();
    }
  }

  handleDown(e) {
    if (e.button === 0) {
      if (this.recording) {
        this.startRecord()
      } else {
        this.synth.startSynth();
      }
    } else if (e.button === 2){
      this.loops.pop(1);
      this.visualizer.orbs.pop(1);
    }
  }

  toggleLoop(e) {
    if (this.looping) {
      this.looping = false;
      this.synth.looping = false;
      document.getElementById('loop').src="icons/loop.png";
      document.getElementById('record').style.visibility="hidden";
      document.getElementById('loop').classList.remove('looping');
    } else if (!this.looping) {
      this.looping = true;
      this.synth.looping = true;
      document.getElementById('loop').src="icons/pause.png";
      document.getElementById('loop').classList.add('looping');
      document.getElementById('record').style.visibility="visible";
    }
  }

  toggleRecord(e) {
    if (this.looping && this.recording) {
      this.recording = false;
      this.synth.recording = false;
      document.getElementById('record').src="icons/record.png"
    } else if (!this.recording){
      this.recording = true;
      this.synth.recording = true;
      document.getElementById('record').src="icons/recording.png"
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

    if (this.looping) {
      this.playLoops(this.count)
    }
    this.visualizer.draw();
  }
}


const init = () => {
  const synth = document.getElementById('synth');
  const looper = new Looper(synth);

  document.getElementById('splash').addEventListener('click', (e) => {
    e.currentTarget.classList.add('hidden');
    setTimeout(() => document.getElementById('body').removeChild(document.getElementById('splash')), 2000)
  });

  document.getElementById('header').addEventListener('click', () => {

  })

  document.getElementById('sine').addEventListener('click', looper.synth.changeWave.bind(looper.synth));
  document.getElementById('sawtooth').addEventListener('click', looper.synth.changeWave.bind(looper.synth));
  document.getElementById('square').addEventListener('click', looper.synth.changeWave.bind(looper.synth));
  document.getElementById('triangle').addEventListener('click', looper.synth.changeWave.bind(looper.synth));
  document.getElementById('record').addEventListener('click', looper.toggleRecord.bind(looper));
  document.getElementById('loop').addEventListener('click', looper.toggleLoop.bind(looper));
}





document.addEventListener("DOMContentLoaded", init)
