# sunset synth

[Live](https://rgkeith3.github.io/sunsetsynth/)
sunset synth is an in-browser synthesizer, looper and visualizer built using the WebAudio API and HTML canvas.

Everything was built using vanilla JavaScript.

### Features
The entire window of the synthesizer is playable. Users can click and hold while moving the mouse to change the pitch of the synthesizer as well as the frequency of the lowpass filter.

The synthesizer also features a looping mode and a record mode. While looping (indicated by the spinning pause button), users can then record loops and the looper will play them back. Users can layer countless loops on top of each other to create a landscape of synthy goodness.

If the user isn't happy with the last loop they recorded, they can right click to remove it.

The user can choose between 4 waveforms, sine, triangle, sawtooth and square.

The entire background is responsive to the audio and visualizes the sound as it's played.

### Technologies
sunset synth was made using two technologies, the WebAudio API, and HTML canvas.

The WebAudio built in oscillators create the sound of the synth. The mouse moves are tracked to update the pitch of the oscillators.

The loop function was built using WebAudio and JavaScript FileReader to record the audio stream to a Blob, read it with the FileReader and then add it to an AudioBufferSourceNode. The loop is then triggered when the global clock arrives at the trigger time associated with the loop.

The visualization is created using the WebAudio AnalyserNode to get usable data from the audio stream and then convert it to visuals with HTML canvas.
