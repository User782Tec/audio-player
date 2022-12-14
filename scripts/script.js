'use strict';

//变量声明与定义
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();

const main = document.getElementById("main");

const exitFullscreen = document.exitFullscreen || document.mozCancelFullScreen || document.webkitExitFullscreen;
const fullScreen = main.requestFullscreen || main.mozRequestFullScreen || main.webkitRequestFullscreen;

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
var aboutToolbar = document.getElementById("abouttoolbar");

var helpWindow = document.getElementById("help");
var helpToolbar = document.getElementById("helptoolbar");

var windows = document.getElementsByClassName("window");
var showWindows = document.getElementsByClassName("showwindow");
var closeWindows = document.getElementsByClassName("close");
var toolbars = document.getElementsByClassName("toolbar");
var maximizeWindows = document.getElementsByClassName("maximum");

var styleSettingsWindow = document.getElementById("stylesettings");
var styleSettingsToolbar = document.getElementById("stylesettingstoolbar");

const menu = document.getElementById("menu");

const reader = new FileReader();
const date = new Date();

const gain = audioContext.createGain();

var track = audioContext.createMediaElementSource(audioElement);

var isAboutDragging = false;
var isHelpDragging = false;
var isStyleSettingsDragging = false;

var prevClick = { play: 0, fullscreen: 0, menu: 0, repeat: 0 };

var aboutLeft;
var aboutTop;
var helpLeft;
var helpTop;
var styleSettingsLeft;
var styleSettingsTop;

var root = document.querySelector(":root");

var backgroundColorPickers = document.getElementsByClassName("bgcolorpicker");

var backgroundColorSelecter = document.getElementById("bgcolorselect");
var backgroundColorSelecterLabel = document.getElementById("bgcolorselectlabel");

var useDragging = true;

var alwaysFullscreen = false;

var getStylesButton = document.getElementById("getstyles");
var styleEditor = document.getElementById("style-editor");
var commitButton = document.getElementById("commit");

var windowContainer = document.getElementById("windows");

//绑定事件监听器
for (var i = 0; i < backgroundColorPickers.length; i++) {
    backgroundColorPickers[i].addEventListener("click", function () {
        for (var i = 0; i < backgroundColorPickers.length; i++) {
            backgroundColorPickers[i].className = "bgcolorpicker";
        }
        this.dataset.selected = 'true';
        this.className = "bgcolorpicker selected";
        root.style.setProperty("--main-bgcolor", this.dataset.color);
        //main.style.backgroundColor = this.dataset.color;
    });
}

for (var i = 0; i < showWindows.length; i++) {
    showWindows[i].addEventListener("click", showWindow);
}

for (var i = 0; i < closeWindows.length; i++) {
    closeWindows[i].addEventListener("click", closeWindow);
}

for (var i = 0; i < windows.length; i++) {
    windows[i].addEventListener("touchstart", showFirst);
    windows[i].addEventListener("mousedown", showFirst);
}

for (var i = 0; i < maximizeWindows.length; i++) {
    maximizeWindows[i].addEventListener("click", windowFullscreen);
}

for (var i = 0; i < toolbars.length; i++) {
    toolbars[i].addEventListener("touchstart", startTouchDragging);
    toolbars[i].addEventListener("touchmove", touchDragging);
    toolbars[i].addEventListener("mousedown", startMouseDragging);
    toolbars[i].addEventListener("mousemove", mouseDragging);
}

backgroundColorSelecter.addEventListener("change", function () {
    backgroundColorSelecterLabel.dataset.color = this.value;
    backgroundColorSelecterLabel.style.backgroundColor = this.value;
    root.style.setProperty("--main-bgcolor", this.value);
});

window.addEventListener("touchend",finishDragging);
window.addEventListener("mouseup",finishDragging);

playButton.addEventListener("click", play);
togglePlay.addEventListener("mousedown", () => {
    if (prevClick.play == 0) {
        prevClick.play = 1;
        window.setTimeout(() => {
            prevClick.play = 0;
        }, 300);
    }
    else {
        play();
    }
});

audioElement.addEventListener("ended", () => {
    playButton.dataset.playing = "false";
    playIcon.className = "fa fa-play";
});

reader.addEventListener("loadend", () => {
    console.log("解析完毕");
    audioElement.src = reader.result;
    //track = audioContext.createMediaElementSource(audioElement);
    track.connect(audioContext.destination);
    track.connect(gain).connect(audioContext.destination);
});
fileElement.addEventListener("change", () => {
    audioElement.pause();
    playButton.dataset.playing = "false";
    playIcon.className = "fa fa-play"
    fileElement = document.getElementById("files");
    //audioElement = document.getElementById("audio");
    reader.readAsDataURL(fileElement.files[0]);
    console.log("开始解析");
});

toggleMenu.addEventListener("mousedown", () => {
    if (prevClick.menu == 0) {
        prevClick.menu = 1;
        window.setTimeout(() => {
            prevClick.menu = 0;
        }, 300);
    }
    else {
        showmenu();
    }
});
ctrlMenu.addEventListener("click", showmenu);

ctrlFullscreen.addEventListener("click", fullscreen);
toggleFullscreen.addEventListener("mousedown", () => {
    if (prevClick.fullscreen == 0) {
        prevClick.fullscreen = 1;
        window.setTimeout(() => {
            prevClick.fullscreen = 0;
        }, 300);
    }
    else {
        fullscreen();
    }
});

repeat.addEventListener("click", () => {
    audioElement.currentTime = 0;
});
toggleRepeat.addEventListener("mousedown", () => {
    if (prevClick.repeat == 0) {
        prevClick.repeat = 1;
        window.setTimeout(() => {
            prevClick.repeat = 0;
        }, 300);
    }
    else {
        audioElement.currentTime = 0;
    }
});

getStylesButton.addEventListener("click", () => {
    styleEditor.value = "";
    var styles = document.defaultView.getComputedStyle(root);
    styleEditor.value += "--main-bgcolor: " + styles.getPropertyValue("--main-bgcolor") + ";";
});

commitButton.addEventListener("click", () => {
    root.style = styleEditor.value;
})

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
            fullScreen.call(main);
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
    catch (err) {
        console.error("操作执行失败,请重试");
    }
}

function showFirst() {
    var thisWindow = this;
    window.setTimeout(() => {
        //var node = aboutWindow.cloneNode(true);
        var lastChild = windowContainer.lastElementChild;
        if (lastChild != thisWindow) {
            windowContainer.removeChild(thisWindow);
            windowContainer.appendChild(thisWindow);
        }
    }, 2);
}

function windowFullscreen() {
    if (!alwaysFullscreen) {
        alwaysFullscreen = true;
        this.lastElementChild.className = "fa fa-window-restore";
    }
    else {
        alwaysFullscreen = false;
        this.lastElementChild.className = "fa fa-window-maximize";
    }
}


function showWindow() {
    document.getElementById(this.dataset.window).style.display = "block";
}

function closeWindow() {
    document.getElementById(this.dataset.window).style.display = "none";
    alwaysFullscreen = false;
    for (var i = 0; i < maximizeWindows.length; i++) {
        maximizeWindows[i].lastChild.className = "fa fa-window-maximize";
    }
}

function startTouchDragging(e) {
    this.dataset.dragging = true;
    this.dataset.left = e.touches[0].pageX - document.getElementById(this.dataset.window).style.left.split("px")[0];
    this.dataset.top = e.touches[0].pageY - document.getElementById(this.dataset.window).style.top.split("px")[0];
}
function touchDragging(e) {
    if (this.dataset.dragging === "true" && useDragging) {
        this.style.cursor = "grabbing";
        document.getElementById(this.dataset.window).style.left = e.touches[0].pageX - this.dataset.left;
        document.getElementById(this.dataset.window).style.top = e.touches[0].pageY - this.dataset.top;
    }
}
function startMouseDragging(e) {
    this.dataset.dragging = "true";
    this.dataset.left = e.pageX - document.getElementById(this.dataset.window).style.left.split("px")[0];
    this.dataset.top = e.pageY - document.getElementById(this.dataset.window).style.top.split("px")[0];
}
function mouseDragging(e) {
    if (this.dataset.dragging === "true" && useDragging) {
        this.style.cursor = "grabbing";
        document.getElementById(this.dataset.window).style.left = e.pageX - this.dataset.left;
        document.getElementById(this.dataset.window).style.top = e.pageY - this.dataset.top;
    }
}
function finishDragging() {
    for (var i = 0; i < toolbars.length; i++) {
        toolbars[i].dataset.dragging = "false";
        toolbars[i].style.cursor = "grab";
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
    if (window.innerWidth < 400 || alwaysFullscreen) {
        useDragging = false;
        helpWindow.className = "window fullscreen";
        aboutWindow.className = "window fullscreen";
        styleSettingsWindow.className = "window fullscreen";
    }
    else if (!alwaysFullscreen) {
        useDragging = true;
        helpWindow.className = "window";
        aboutWindow.className = "window";
        styleSettingsWindow.className = "window";
    }
}, 20);