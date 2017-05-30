const Phrase = require("./phrase")
const Note = require("./note")


const init = () => {
  //get the synth html element
  const synth = document.getElementById('synth');
  //create a visual context to draw to
  const vizCtx = synth.getContext('2d');
  //create an audio context to create sounds with
  const audCtx = new AudioContext();

  let count = 1;
  const tick = () => {
    if (count < 16000) {
      count = count + 1;
    } else {
      count = 1;
    }
    console.log(count);
  }
  setInterval(() => tick(), 1)


  const handleClick = (down) => {
    //creates a new note on click
    //need to instead, trigger Phrase.record()
    //which will record the client position of mousemove event
    //for every interval
    //until mouseup event
    let initX = down.clientX;
    let note = new Note(audCtx,initX, 500)
    note.trigger()

    down.target.addEventListener("mousemove", handleMove)
    down.target.addEventListener("mouseup", () => {
      down.target.removeEventListener("mousemove", handleMove)
    })
  }

  synth.addEventListener("mousedown", handleClick)
}





document.addEventListener("DOMContentLoaded", init)
