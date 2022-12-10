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
var showAbout = document.getElementById("showabout");
var closeAbout = document.getElementById("closeabout");
var maximizeAbout = document.getElementById("maximizeabout");
var aboutToolbar = document.getElementById("abouttoolbar");

var helpWindow = document.getElementById("help");
var showHelp = document.getElementById("showhelp");
var closeHelp = document.getElementById("closehelp");
var helpToolbar = document.getElementById("helptoolbar");

var showWindows = document.getElementsByClassName("showwindow");
var closeWindows = document.getElementsByClassName("close");
var toolbars = document.getElementsByClassName("toolbar");

var styleSettingsWindow = document.getElementById("stylesettings");
var showStyleSetting = document.getElementById("showstylesettings");
var closeStyleSettings = document.getElementById("closestylesettings");
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

for (var i = 0; i < toolbars.length; i++) {
    toolbars[i].addEventListener("click",function(){
        console.log(document.getElementById(this.dataset.window))
    })
}

backgroundColorSelecter.addEventListener("change",function(){
    backgroundColorSelecterLabel.dataset.color = this.value;
    backgroundColorSelecterLabel.style.backgroundColor = this.value;
    root.style.setProperty("--main-bgcolor", this.value);
})

aboutWindow.addEventListener("touchstart",() => {
    window.setTimeout(() => {
        //var node = aboutWindow.cloneNode(true);
        var lastChild = windowContainer.lastElementChild;
        if (lastChild != aboutWindow) {
            windowContainer.removeChild(aboutWindow);
            windowContainer.appendChild(aboutWindow);
        }
    },2);
});
showAbout.addEventListener("click", () => {
    aboutWindow.style.display = "block";
});
closeAbout.addEventListener("click", () => {
    aboutWindow.style.display = "none";
    alwaysFullscreen = false;
});
maximizeAbout.addEventListener("click",() => {
    if (!alwaysFullscreen) {
        alwaysFullscreen = true;
    }
    else {
        alwaysFullscreen = false;
    }
});
aboutToolbar.addEventListener("mousedown", (e) => {
    isAboutDragging = true;
    aboutLeft = e.pageX - Number(aboutWindow.style.left.split("px")[0]);
    aboutTop = e.pageY - Number(aboutWindow.style.top.split("px")[0]);
});
aboutToolbar.addEventListener("mousemove", (e) => {
    if (isAboutDragging && useDragging) {
        aboutWindow.style.left = e.pageX - aboutLeft;
        aboutWindow.style.top = e.pageY - aboutTop;
    }
});
aboutToolbar.addEventListener("touchstart", (e) => {
    isAboutDragging = true;
    aboutLeft = e.touches[0].pageX - Number(aboutWindow.style.left.split("px")[0]);
    aboutTop = e.touches[0].pageY - Number(aboutWindow.style.top.split("px")[0]);
});
aboutToolbar.addEventListener("touchmove", (e) => {
    if (isAboutDragging && useDragging) {
        aboutWindow.style.left = e.touches[0].pageX - aboutLeft;
        aboutWindow.style.top = e.touches[0].pageY - aboutTop;
    }
});

showHelp.addEventListener("click", () => {
    helpWindow.style.display = "block"
});
closeHelp.addEventListener("click", () => {
    helpWindow.style.display = "none";
});
helpToolbar.addEventListener("mousedown", (e) => {
    isHelpDragging = true;
    helpLeft = e.pageX - Number(helpWindow.style.left.split("px")[0]);
    helpTop = e.pageY - Number(helpWindow.style.top.split("px")[0]);
});
helpToolbar.addEventListener("mousemove", (e) => {
    if (isHelpDragging && useDragging) {
        helpWindow.style.left = e.pageX - helpLeft;
        helpWindow.style.top = e.pageY - helpTop;
    }
});
helpToolbar.addEventListener("touchstart", (e) => {
    isHelpDragging = true;
    helpLeft = e.touches[0].pageX - Number(helpWindow.style.left.split("px")[0]);
    helpTop = e.touches[0].pageY - Number(helpWindow.style.top.split("px")[0]);
});
helpToolbar.addEventListener("touchmove", (e) => {
    if (isHelpDragging && useDragging) {
        helpWindow.style.left = e.touches[0].pageX - helpLeft;
        helpWindow.style.top = e.touches[0].pageY - helpTop;
    }
});

showStyleSetting.addEventListener("click", () => {
    styleSettingsWindow.style.display = "block"
});
closeStyleSettings.addEventListener("click", () => {
    styleSettingsWindow.style.display = "none";
});
styleSettingsToolbar.addEventListener("mousedown", (e) => {
    isStyleSettingsDragging = true;
    styleSettingsLeft = e.pageX - Number(styleSettingsWindow.style.left.split("px")[0]);
    styleSettingsTop = e.pageY - Number(styleSettingsWindow.style.top.split("px")[0]);
});
styleSettingsToolbar.addEventListener("mousemove", (e) => {
    if (isStyleSettingsDragging && useDragging) {
        styleSettingsWindow.style.left = e.pageX - styleSettingsLeft;
        styleSettingsWindow.style.top = e.pageY - styleSettingsTop;
    }
});
styleSettingsToolbar.addEventListener("touchstart", (e) => {
    isStyleSettingsDragging = true;
    styleSettingsLeft = e.touches[0].pageX - Number(styleSettingsWindow.style.left.split("px")[0]);
    styleSettingsTop = e.touches[0].pageY - Number(styleSettingsWindow.style.top.split("px")[0]);
});
styleSettingsToolbar.addEventListener("touchmove", (e) => {
    if (isStyleSettingsDragging && useDragging) {
        styleSettingsWindow.style.left = e.touches[0].pageX - styleSettingsLeft;
        styleSettingsWindow.style.top = e.touches[0].pageY - styleSettingsTop;
    }
});

window.addEventListener("mouseup", () => {
    isAboutDragging = false;
    isHelpDragging = false;
    isStyleSettingsDragging = false;
});
window.addEventListener("touchend", () => {
    isAboutDragging = false;
    isHelpDragging = false;
    isStyleSettingsDragging = false;
});

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

getStylesButton.addEventListener("click",() => {
    styleEditor.value = "";
    var styles = document.defaultView.getComputedStyle(root);
    styleEditor.value += "--main-bgcolor: " + styles.getPropertyValue("--main-bgcolor") + ";";
});

commitButton.addEventListener("click",() => {
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

//设置定时循环程序
window.setInterval(() => {
    if (document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement) {
        fullscreenIcon.className = "fa fa-compress";
    }
    else {
        fullscreenIcon.className = "fa fa-expand";
    }
}, 20);

//初始化的程序
if (window.innerWidth < 400) {
    alert("当前浏览器窗口过小,可能会导致一些问题,请放大窗口或更换大屏设备。");
}
window.setInterval(() => {
    if (window.innerWidth < 400 || alwaysFullscreen) {
        useDragging = false;
        helpWindow.className = "window fullscreen";
        aboutWindow.className = "window fullscreen";
        styleSettingsWindow.className = "window fullscreen";
    }
    else if (!alwaysFullscreen){
        useDragging = true;
        helpWindow.className = "window";
        aboutWindow.className = "window";
        styleSettingsWindow.className = "window";
    }
},10);