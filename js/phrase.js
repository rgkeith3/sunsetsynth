class Phrase {
  constructor() {
    this.notes = new Array(16);
  }

  record(time, note) {
    this.notes[time] = note;
  }

  play(time) {
    if (this.notes[time]) {
      this.notes[time].trigger();
    }
  }
}

module.exports = Phrase;
