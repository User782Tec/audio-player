const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();
function pushAudio(obj) {
    document.getElementById("audio").src = obj.files[0];
    var track = audioContext.createMediaElementSource(document.getElementById("audio"));
}