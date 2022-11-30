'use strict';

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

//var windows = document.getElementsByClassName("window");
//var toolbars = document.getElementsByClassName("toolbar");
//var closeButtons = document.getElementsByClassName("close");

var aboutWindow = document.getElementById("about");
var showAbout = document.getElementById("showabout");
var closeAbout = document.getElementById("closeabout");
var aboutToolbar = document.getElementById("abouttoolbar");

var helpWindow = document.getElementById("help");
var showHelp = document.getElementById("showhelp");
var closeHelp = document.getElementById("closehelp");
var helpToolbar = document.getElementById("helptoolbar");

const menu = document.getElementById("menu");

const reader = new FileReader();
const date = new Date();

const gain = audioContext.createGain();

var track = audioContext.createMediaElementSource(audioElement);

var isAboutDragging = false;
var isHelpDragging = false;

var prevClick = {play: 0, fullscreen: 0, menu: 0, repeat: 0};

var aboutLeft;
var helpLeft;

//绑定事件监听器
showAbout.addEventListener("click",() => {
    aboutWindow.style.display = "block"
});
closeAbout.addEventListener("click",() => {
    aboutWindow.style.display = "none";
});
aboutToolbar.addEventListener("mousedown",(e) => {
    isAboutDragging = true;
    aboutLeft = e.pageX - Number(aboutWindow.style.left.split("px")[0]);
});
aboutToolbar.addEventListener("mousemove",(e) => {
    if (isAboutDragging) {
        aboutWindow.style.left = e.pageX - aboutLeft;
        aboutWindow.style.top = e.pageY - 20;
    }
});
aboutToolbar.addEventListener("touchstart",(e) => {
    isAboutDragging = true;
    aboutLeft = e.touches[0].pageX - Number(aboutWindow.style.left.split("px")[0]);
});
aboutToolbar.addEventListener("touchmove",(e) => {
    if (isAboutDragging) {
        aboutWindow.style.left = e.touches[0].pageX - aboutLeft;
        aboutWindow.style.top = e.touches[0].pageY - 20;
    }
});

showHelp.addEventListener("click",() => {
    helpWindow.style.display = "block"
});
closeHelp.addEventListener("click",() => {
    helpWindow.style.display = "none";
});
helpToolbar.addEventListener("mousedown",(e) => {
    isHelpDragging = true;
    helpLeft = e.pageX - Number(aboutWindow.style.left.split("px")[0]);
});
helpToolbar.addEventListener("mousemove",(e) => {
    if (isHelpDragging) {
        helpWindow.style.left = e.pageX - 20;
        helpWindow.style.top = e.pageY - 20;
    }
});
helpToolbar.addEventListener("touchstart",(e) => {
    isHelpDragging = true;
    helpLeft = e.touches[0].pageX - Number(helpWindow.style.left.split("px")[0]);
});
helpToolbar.addEventListener("touchmove",(e) => {
    if (isHelpDragging) {
        helpWindow.style.left = e.touches[0].pageX - helpLeft;
        helpWindow.style.top = e.touches[0].pageY - 20;
    }
});

window.addEventListener("mouseup",() => {
    isAboutDragging = false;
    isHelpDragging = false;
});
window.addEventListener("touchend",() => {
    isAboutDragging = false;
    isHelpDragging = false;
});

playButton.addEventListener("click",play);
togglePlay.addEventListener("mousedown",() => {
    if (prevClick.play == 0) {
        prevClick.play = 1;
        window.setTimeout(() => {
            prevClick.play = 0;
        },300);
    }
    else {
        play();
    }
});

audioElement.addEventListener("ended",() => {
    playButton.dataset.playing = "false";
    playIcon.className = "fa fa-play";
});

reader.addEventListener("loadend",() => {
    console.log("解析完毕");
    audioElement.src = reader.result;
    //track = audioContext.createMediaElementSource(audioElement);
    track.connect(audioContext.destination);
    track.connect(gain).connect(audioContext.destination);
});
fileElement.addEventListener("change",() => {
    audioElement.pause();
    playButton.dataset.playing = "false";
    playIcon.className = "fa fa-play"
    fileElement = document.getElementById("files");
    //audioElement = document.getElementById("audio");
    reader.readAsDataURL(fileElement.files[0]);
    console.log("开始解析");
});

toggleMenu.addEventListener("mousedown",() => {
    if (prevClick.menu == 0) {
        prevClick.menu = 1;
        window.setTimeout(() => {
            prevClick.menu = 0;
        },300);
    }
    else {
        showmenu();
    }
});
ctrlMenu.addEventListener("click",showmenu);

ctrlFullscreen.addEventListener("click",fullscreen);
toggleFullscreen.addEventListener("mousedown",() => {
    if (prevClick.fullscreen == 0) {
        prevClick.fullscreen = 1;
        window.setTimeout(() => {
            prevClick.fullscreen = 0;
        },300);
    }
    else {
        fullscreen();
    }
});

repeat.addEventListener("click",() => {
    audioElement.currentTime = 0;
});
toggleRepeat.addEventListener("mousedown",() => {
    if (prevClick.repeat == 0) {
        prevClick.repeat = 1;
        window.setTimeout(() => {
            prevClick.repeat = 0;
        },300);
    }
    else {
        audioElement.currentTime = 0;
    }
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
window.setInterval(() => {
    if (document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement) {
        fullscreenIcon.className = "fa fa-compress";
    }
    else {
        fullscreenIcon.className = "fa fa-expand";
    }
},20); //实时更新全屏图标
