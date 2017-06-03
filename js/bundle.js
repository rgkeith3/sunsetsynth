/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 3);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

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


/***/ }),
/* 1 */
/***/ (function(module, exports) {

class Synthesizer {
  constructor(canvas, looperDest, context, analyser) {
    this.canvas = canvas;
    this.looperDest = looperDest;
    this.audCtx = context;
    this.analyser = analyser;
    this.setupGain();
    this.setupNodes();
    document.getElementById('body').addEventListener('mousemove', this.trackMouse.bind(this));
    this.osc = this.audCtx.createOscillator();
    this.wave = 'sine'
    this.playing = false;
    this.recording = false;
    this.looping = true;
  }

  setupGain() {
    this.gainNode = this.audCtx.createGain();
    this.gainNode.gain.value = 0;
  }

  setupNodes() {
    this.filterNode = this.audCtx.createBiquadFilter();
    this.filterNode.type = 'lowpass';
    this.filterNode.Q.value = 5;
  }

  changeWave(e) {
    document.getElementById(this.wave).classList.remove('active');
    this.wave = e.currentTarget.id;
    e.currentTarget.classList.add('active');
  }

  trackMouse(e) {
    this.xPos = e.clientX;
    this.yPos = this.canvas.height - e.clientY;
    if (this.playing) {
      this.updateY();
      this.updateX();
    }
  }

  updateY() {
    const PITCHES  = [110,
                      131,
                      147,
                      165,
                      196,
                      220,
                      262,
                      294,
                      330,
                      392,
                      440,
                      523,
                      587,
                      659,
                      784,
                      880];
    let step = Math.floor(((this.yPos / this.canvas.height) * PITCHES.length) - 2);
    if (step < 0) {step = 0}
    this.osc.frequency.value = PITCHES[step];
  }

  updateX() {
    this.filterNode.frequency.value = this.xPos * 10;
  }

  startSynth() {
    this.osc = this.audCtx.createOscillator();
    this.osc.type = this.wave
    this.osc.frequency.value = this.yPos;
    this.osc.connect(this.filterNode);
    this.filterNode.connect(this.gainNode);
    this.gainNode.connect(this.analyser);
    if (this.looping && this.recording) {
      this.gainNode.connect(this.looperDest);
    }
    this.gainNode.gain.linearRampToValueAtTime(0.25, this.audCtx.currentTime + 0.1);
    this.playing = true;
    this.osc.start();
  }

  stopSynth() {
    this.playing = false;
    this.gainNode.gain.linearRampToValueAtTime(0, this.audCtx.currentTime + 0.25);
    this.osc.stop(this.audCtx.currentTime + 0.25);
  }
}

module.exports = Synthesizer;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

const Orb = __webpack_require__(4)

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


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

const Loop = __webpack_require__(0)
const Synthesizer = __webpack_require__(1)
const Visualizer = __webpack_require__(2)

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
          .then(data => this.loop.buffer = data, () => {})
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
    setTimeout(() => {
      let splash = document.getElementById('splash');
      if (splash) {
        document.getElementById('body').removeChild(splash);
      }
    }, 2000);
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


/***/ }),
/* 4 */
/***/ (function(module, exports) {

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

    if (this.pos[0] + (this.vector[0] * multiplier) + this.radius >= this.canvas.width ||
    this.pos[0] + (this.vector[0] * multiplier) - this.radius <= 0) {
      this.vector[0] *= -1;
    }

    if (this.pos[1] + (this.vector[1] * multiplier) + this.radius >= this.canvas.height ||
    this.pos[1] + (this.vector[1] * multiplier) - this.radius <= 0) {
      this.vector[1] *= -1;
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


/***/ })
/******/ ]);