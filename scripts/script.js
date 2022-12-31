'use strict';

//变量声明与赋值
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();

const main = document.getElementById("main");

const exitFullscreen = document.exitFullscreen || document.mozCancelFullScreen || document.webkitExitFullscreen;
const fullScreen = main.requestFullscreen || main.mozRequestFullScreen || main.webkitRequestFullscreen;

const playButton = document.getElementById("play");
const togglePlay = document.getElementById("toggleplay");
const playIcon = document.getElementById("play-icon");

const fileElement = document.getElementById("files");
const audioFileButton = document.getElementById("audio-file-btn");

const audioElement = document.getElementById("audio");

const ctrlMenu = document.getElementById("showmenu");
const toggleMenu = document.getElementById("togglemenu");

const ctrlFullscreen = document.getElementById("fullscreen");
const fullscreenIcon = document.getElementById("fullscreen-icon");
const toggleFullscreen = document.getElementById("togglefullscreen");

const replay = document.getElementById("replay");
const toggleReplay = document.getElementById("togglereplay");

const windows = document.getElementsByClassName("window");
const showWindows = document.getElementsByClassName("showwindow");
const closeWindows = document.getElementsByClassName("close");
const toolbars = document.getElementsByClassName("toolbar");
const maximizeWindows = document.getElementsByClassName("maximum");

const styleSettingsWindow = document.getElementById("stylesettings");
const styleSettingsToolbar = document.getElementById("stylesettingstoolbar");

const menu = document.getElementById("menu");

const reader = new FileReader();
const date = new Date();

const gain = audioContext.createGain();

const track = audioContext.createMediaElementSource(audioElement);

const prevClick = { play: 0, fullscreen: 0, menu: 0, replay: 0 };

const root = document.querySelector(":root");

const colorPickers = document.getElementsByClassName("colorpicker");
const backgroundColorPickers = document.getElementsByClassName("bgcolorpicker");

const backgroundColorSelecter = document.getElementById("bgcolorselect");
const backgroundColorSelecterLabel = document.getElementById("bgcolorselectlabel");
const staticColor = document.getElementById("static-color");
const linearGradient = document.getElementById("linear-gradient");

const linearGradientTo = document.getElementById("gradient-to");
const linearGradientFrom = document.getElementById("gradient-from");
const linearGradientOptions = document.getElementsByClassName("linear-gradient-option");

var useDragging = true;

var alwaysFullscreen = false;

const getStylesButton = document.getElementById("getstyles");
const styleEditor = document.getElementById("style-editor");
const commitButton = document.getElementById("commit");
const downloadStylesButton = document.getElementById("downloadstyles");

const windowContainer = document.getElementById("windows");

const progressContainer = document.getElementById("progress-container");
const progressBar = document.getElementById("progress");
var progressing;

const backgroundType = document.getElementsByClassName("background-type");

const colorTheme = document.getElementById("color-theme");

//绑定事件监听器
for (const elt of backgroundColorPickers) {
    elt.addEventListener("click", function () {
        for (const elt of backgroundColorPickers) {
            elt.className = "bgcolorpicker";
        }
        this.dataset.selected = 'true';
        this.className = "bgcolorpicker selected";
        root.style.setProperty("--main-bgcolor", this.dataset.color);
        staticColor.dataset.color = this.dataset.color;
        clearProperty("--main-bgimg");
        //main.style.backgroundColor = this.dataset.color;
    });
}

//为颜色选择器添加颜色
for (const elt of colorPickers) {
    elt.style.backgroundColor = elt.dataset.color;
}

for (const elt of showWindows) {
    elt.addEventListener("click", showWindow);
}

for (const elt of closeWindows) {
    elt.addEventListener("click", closeWindow);
}

for (const elt of windows) {
    elt.addEventListener("touchstart", showFirst);
    elt.addEventListener("mousedown", showFirst);
}

for (const elt of maximizeWindows) {
    elt.addEventListener("click", windowFullscreen);
}

for (const elt of toolbars) {
    elt.addEventListener("touchstart", startTouchDragging);
    elt.addEventListener("touchmove", touchDragging);
    elt.addEventListener("mousedown", startMouseDragging);
    elt.addEventListener("mousemove", mouseDragging);
}

for (const elt of backgroundType) {
    elt.addEventListener("mousedown", chooseBackground);
}

for (const elt of linearGradientOptions) {
    elt.addEventListener("mousedown",selectLinearGradientDirection);
}

backgroundColorSelecter.addEventListener("change", selectorColor(function () {
    root.style.setProperty("--main-bgcolor", backgroundColorSelecter.value);
    staticColor.dataset.color = backgroundColorSelecter.value;
}));

window.addEventListener("touchend", finishDragging);
window.addEventListener("mouseup", finishDragging);

playButton.addEventListener("click", play);
togglePlay.addEventListener("mousedown", dblclick(play, "play"));

audioElement.addEventListener("ended", () => {
    playButton.dataset.playing = "false";
    playIcon.className = "fa fa-play";
    restartProgress()
});

/*reader.addEventListener("loadend", () => {
    console.log("解析完毕");
    audioElement.src = reader.result;
    //track = audioContext.createMediaElementSource(audioElement);
    track.connect(audioContext.destination);
    track.connect(gain).connect(audioContext.destination);
});*/
fileElement.addEventListener("change", () => {
    audioElement.pause();
    playButton.dataset.playing = "false";
    playIcon.className = "fa fa-play"
    //fileElement = document.getElementById("files");
    //audioElement = document.getElementById("audio");
    console.log("开始解析");
    var audioUrl = URL.createObjectURL(fileElement.files[0]);
    console.log("解析完毕");
    audioElement.src = audioUrl;
    track.connect(audioContext.destination);
    track.connect(gain).connect(audioContext.destination);
    addProgress();
});

toggleMenu.addEventListener("mousedown", dblclick(showmenu, "menu"));
ctrlMenu.addEventListener("click", showmenu);

ctrlFullscreen.addEventListener("click", fullscreen);
toggleFullscreen.addEventListener("mousedown", dblclick(fullscreen, "fullscreen"));

replay.addEventListener("click", restartProgress);
toggleReplay.addEventListener("mousedown", dblclick(restartProgress, "replay"));

getStylesButton.addEventListener("click", () => {
    styleEditor.value = getStyles();
});

commitButton.addEventListener("click", () => {
    var value = styleEditor.value.split(";\n");
    var commitStyles = "";
    //防止用户提交非法样式
    for (const i in value) {
        if (i.split(": ")[0].match("--")) {
            commitStyles += `${i};`;
        }
    }
    root.setAttribute("style", commitStyles);
});

progressBar.addEventListener("touchstart", stopProgress);
progressBar.addEventListener("touchend", startProgress);
progressBar.addEventListener("mousedown", stopProgress);
progressBar.addEventListener("mouseup", startProgress);

downloadStylesButton.addEventListener("click", downloadStyles);

//定义相关函数功能

//显示/隐藏菜单
function showmenu() {
    if (toggleMenu.dataset.menushow === "false") {
        menu.className = "container";
        toggleMenu.dataset.menushow = "true";
    }
    else if (toggleMenu.dataset.menushow === "true") {
        menu.className = "container hide";
        toggleMenu.dataset.menushow = "false";
    }
}

//全屏模式
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

//播放音频功能
function play() {
    try {
        //playButton = document.getElementById("play");
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

//将正在拖动的窗口置于最上面显示
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

//窗口的“全屏模式”方法
function windowFullscreen() {
    if (!alwaysFullscreen) {
        enableFullScreenMode();
    }
    else {
        disableFullScreenMode();
    }
}

//打开/关闭窗口
function showWindow() {
    document.getElementById(this.dataset.window).style.display = "block";
    showFirst.call(document.getElementById(this.dataset.window));
}

function closeWindow() {
    document.getElementById(this.dataset.window).style.display = "none";
    disableFullScreenMode();
}

//拖动相关功能
function startTouchDragging(e) {
    this.dataset.dragging = true;
    this.dataset.left = e.touches[0].pageX - document.getElementById(this.dataset.window).style.left.split("px")[0];
    this.dataset.top = e.touches[0].pageY - document.getElementById(this.dataset.window).style.top.split("px")[0];
}
function touchDragging(e) {
    if (this.dataset.dragging === "true" && useDragging) {
        this.style.cursor = "grabbing";
        document.getElementById(this.dataset.window).style.left = `${e.touches[0].pageX - this.dataset.left}px`;
        document.getElementById(this.dataset.window).style.top = `${e.touches[0].pageY - this.dataset.top}px`;
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
        document.getElementById(this.dataset.window).style.left = `${e.pageX - this.dataset.left}px`;
        document.getElementById(this.dataset.window).style.top = `${e.pageY - this.dataset.top}px`;
    }
}
function finishDragging() {
    for (const elt of toolbars) {
        elt.dataset.dragging = "false";
        elt.style.cursor = "grab";
    }
}

//音频进度条相关功能
function addProgress() {
    progressContainer.className = "show";
    progressing = window.setInterval(syncProgress, 20);
}
function stopProgress() {
    window.clearInterval(progressing);
    audioElement.pause();
    progressBar.disabled = false;
}
function startProgress() {
    audioElement.currentTime = progressBar.value / 10000;
    if (playButton.dataset.playing === "true") {
        audioElement.play();
    }
    progressing = window.setInterval(syncProgress, 20);
    progressBar.disabled = "disabled";
}
function syncProgress() {
    progressBar.value = audioElement.currentTime * 10000;
    progressBar.max = audioElement.duration * 10000;
}
function deleteProgress() {
    clearInterval(progressing);
    progressContainer.className = "hide";
}
function restartProgress() {
    progressBar.value = 0;
    audioElement.currentTime = 0;
}

//获取样式
function getStyles() {
    var styles = window.getComputedStyle(root, null);
    var result = "";
    for (const i of styles) {
        if (i.match("--")) {
            result += `${i}: ${styles.getPropertyValue(i)};\n`;
        }
    }
    return result;
}

//判断颜色深浅
function colorDepth(hex) {
    hex = hex.split("#")[1];
    var r = parseInt(`${hex[0]}${hex[1]}`, 16);
    var g = parseInt(`${hex[2]}${hex[3]}`, 16);
    var b = parseInt(`${hex[4]}${hex[5]}`, 16);
    /*var k = 0;
    if (r < 88) {
        k++;
    }
    if (g < 88) {
        k++;
    }
    if (b < 88) {
        k++;
    }
    if (k < 2) {
        return false;
    }
    else {
        return true;
    }*/
    if (r + g + b < 382) {
        return true;
    }
    else {
        return false;
    }
}

//下载样式
function downloadStyles() {
    var style = getStyles();
    download(style, "text/plain", "styles.txt");
}

//下载功能
function download(text, type, file_name) {
    var blob = new Blob([text], { "type": type });
    var element = document.createElement("a");
    element.href = URL.createObjectURL(blob);
    element.style.display = "none";
    element.download = file_name;
    main.appendChild(element);
    element.click();
    main.removeChild(element);
}

//双击事件判断处理方法
function dblclick(fn, key) {
    return function () {
        if (prevClick[key] == 0) {
            prevClick[key] = 1;
            window.setTimeout(() => {
                prevClick[key] = 0;
            }, 300);
        }
        else {
            prevClick[key] = 0;
            fn();
        }
    }
}

function selectorColor(fn) {
    return function () {
        this.parentElement.dataset.color = this.value;
        this.parentElement.style.backgroundColor = this.value;
        if (colorDepth(this.value)) {
            this.parentElement.style.color = "#dddddd";
        }
        else {
            this.parentElement.style.color = "#222222";
        }
        fn();
    }
}

function chooseBackground() {
    document.getElementById(this.dataset.open).className = "selector";
    document.getElementById(this.dataset.close).className = "selector disabled";
    if (this.dataset.open === "static-color") {
        setProperty("--main-bgcolor", staticColor.dataset.color);
        clearProperty("--main-bgimg");
    }
    else if (this.dataset.open === "linear-gradient") {
        setProperty("--main-bgcolor", "white");
    }
}

function clearProperty(property_name) {
    root.style.setProperty(property_name, "none");
}
function setProperty(property_name, value) {
    root.style.setProperty(property_name, value);
}

function selectLinearGradientDirection() {
    const selected = this;
    setSelection(selected,linearGradientOptions,"option-selected","option linear-gradient-option");
    linearGradientFrom.innerText = selected.dataset.from;
    linearGradientTo.innerText = selected.dataset.to;
}

function setSelection(selected,elements,selected_className,unselected_className) {
    for (const elt of elements) {
        elt.className = unselected_className;
    }
    selected.className += ` ${selected_className}`;
}

async function getStylesStore() {
    var filelist = await fetchText("https://cdn.jsdelivr.net/gh/User782Tec/audio-player-styles-repo@main/list.txt");
    filelist = filelist.split("\n");
    for (const file of filelist) {
        if (file != "") {
            var meta = await fetchText(`https://cdn.jsdelivr.net/gh/User782Tec/audio-player-styles-repo@main/${file}/meta.json`);
            meta = JSON.parse(meta);
            var style = await fetchText(`https://cdn.jsdelivr.net/gh/User782Tec/audio-player-styles-repo@main/${file}/${meta.styles}`);
            var element = document.createElement("div");
            element.dataset.style = style;
            element.innerHTML = `${meta.name} 作者：${meta.authors}`;
            colorTheme.appendChild(element);
            element.addEventListener("click",function(){
                root.setAttribute("style", this.dataset.style);
            });
        }
    }
}

async function fetchText(url) {
    var response = await fetch(url);
    var text = await response.text();
    return text;
}

function disableFullScreenMode() {
    alwaysFullscreen = false;
    for (const elt of maximizeWindows) {
        elt.lastElementChild.className = "fa fa-window-maximize";
    }
}
function enableFullScreenMode() {
    alwaysFullscreen = true;
    for (const elt of maximizeWindows) {
        elt.lastElementChild.className = "fa fa-window-restore";
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
    if (window.innerWidth < 400 || alwaysFullscreen || window.innerHeight < 500) {
        useDragging = false;
        for (const elt of windows) {
            elt.className = "window fullscreen";
        }
    }
    else if (!alwaysFullscreen) {
        useDragging = true;
        for (const elt of windows) {
            elt.className = "window";
        }
    }
}, 20);

getStylesStore();