//变量声明与定义
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();

const exitFullscreen = document.exitFullscreen || document.mozCancelFullScreen || document.webkitExitFullscreen;
const fullScreen = document.getElementById("main").requestFullscreen || document.getElementById("main").mozRequestFullScreen || document.getElementById("main").webkitRequestFullscreen;

var playButton = document.getElementById("play");
var togglePlay = document.getElementById("toggleplay");
var playIcon = document.getElementById("play-icon");

var fileElement = document.getElementById("files");

var audioElement = document.getElementById("audio");

var ctrlMenu = document.getElementById("showmenu");
var toggleMenu = document.getElementById("togglemenu");

var ctrlFullscreen = document.getElementById("fullscreen");
var fullscreenIcon = document.getElementById("fullscreen-icon");
var toggleFullscreen = document.getElementById("togglefullscreen");

var repeat = document.getElementById("again");
var toggleRepeat = document.getElementById("togglerepeat");

var aboutWindow = document.getElementById("about");
var showAbout = document.getElementById("showabout");
var closeAbout = document.getElementById("closeabout");
var aboutToolbar = document.getElementById("abouttoolbar");

const menu = document.getElementById("menu");

const reader = new FileReader();
const gain = audioContext.createGain();

var track = audioContext.createMediaElementSource(audioElement);

var isDragging = false;

//绑定事件监听器
showAbout.addEventListener("click",function(){
    aboutWindow.style.display = "block"
});
closeAbout.addEventListener("click",function(){
    aboutWindow.style.display = "none";
});

aboutToolbar.addEventListener("mousedown",function(){
    isDragging = true;
});
aboutToolbar.addEventListener("mousemove",(e) => {
    if (isDragging) {
        aboutWindow.style.left = e.pageX - 20;
        aboutWindow.style.top = e.pageY - 20;
    }
});
window.addEventListener("mouseup",function(){
    isDragging = false;
});
aboutToolbar.addEventListener("touchstart",function(){
    isDragging = true;
});
aboutToolbar.addEventListener("touchmove",(e) => {
    if (isDragging) {
        aboutWindow.style.left = e.touches[0].pageX - 20;
        aboutWindow.style.top = e.touches[0].pageY - 20;
    }
});
window.addEventListener("touchend",function(){
    isDragging = false;
});

playButton.addEventListener("click",play);
togglePlay.addEventListener("dblclick",play);

audioElement.addEventListener("ended",function(){
    playButton.dataset.playing = "false";
    playIcon.className = "fa fa-play";
});

reader.addEventListener("loadend",function(){
    console.log("解析完毕");
    audioElement.src = reader.result;
    //track = audioContext.createMediaElementSource(audioElement);
    track.connect(audioContext.destination);
    track.connect(gain).connect(audioContext.destination);
});
fileElement.addEventListener("change",function(){
    playButton.dataset.playing = "false";
    playIcon.className = "fa fa-play"
    fileElement = document.getElementById("files");
    //audioElement = document.getElementById("audio");
    reader.readAsDataURL(fileElement.files[0]);
    console.log("开始解析");
});

toggleMenu.addEventListener("dblclick",showmenu);
ctrlMenu.addEventListener("click",showmenu);

ctrlFullscreen.addEventListener("click",fullscreen);
toggleFullscreen.addEventListener("dblclick",fullscreen);

repeat.addEventListener("click",function(){
    audioElement.currentTime = 0;
});
toggleRepeat.addEventListener("dblclick",function(){
    audioElement.currentTime = 0;
});

//定义相关函数功能
function showmenu() {
    if (toggleMenu.dataset.menushow === "false") {
        menu.open = "open";
        toggleMenu.dataset.menushow = "true";
    }
    else if (toggleMenu.dataset.menushow === "true") {
        menu.open = false;
        toggleMenu.dataset.menushow = "false";
    }
}

function fullscreen() {
    if (document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement) {
        if (exitFullscreen) {
            exitFullscreen.call(document);
        }
        else {
            alert("当前浏览器不支持全屏显示，请切换浏览器再打开");
        }
    }
    else {
        if (fullScreen) {
            fullScreen.call(document.getElementById("main"));
        }
        else {
            alert("当前浏览器不支持全屏显示，请切换浏览器再打开");
        }
    }
}
function play() {
    try {
        playButton = document.getElementById("play");
        if (audioContext.state === "suspended") {
            audioContext.resume();
        }
        if (playButton.dataset.playing === "false") {
            audioElement.play();
            playButton.dataset.playing = "true";
            playIcon.className = "fa fa-pause";
        }
        else if (playButton.dataset.playing === "true") {
            audioElement.pause();
            playButton.dataset.playing = "false";
            playIcon.className = "fa fa-play";
        }
    }
    catch(err) {
        console.error("操作执行失败,请重试");
    }
}

//设置定时循环程序
window.setInterval(function(){
    if (document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement) {
        fullscreenIcon.className = "fa fa-compress";
    }
    else {
        fullscreenIcon.className = "fa fa-expand";
    }
},20); //实时更新全屏图标
