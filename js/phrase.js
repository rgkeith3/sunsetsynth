class Phrase {
  constructor() {
    this.notes = new Array(16);
  }

  record(time, note) {
    this.notes[time] = note;
  }
}

module.exports = Phrase;
