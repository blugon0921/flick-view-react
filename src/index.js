import React from 'react';
import ReactDOM from 'react-dom/client';
import './style.css';
import App from './pages/App/App';
import reportWebVitals from './reportWebVitals';
import { OPEN_FILE, OPEN_VIDEO, FULL_SCREEN, VIDEOS_IN_PATH_RESPONSE, VIDEOS_IN_PATH, ALERT } from "./constants";
import Playing from "./pages/Playing/Playing";
// import { setInValue, setStorage, storageItem } from "./modules";
import { setInValue, setStorage, storageItem } from "./modules"
const { ipcRenderer } = window.require("electron")

let root = ReactDOM.createRoot(document.getElementById('root'))

/*
2.0.3

pip모드 추가

소신발언) 갈아엎고싶다
*/


// global.id = -1
global.id = 0

ipcRenderer.on("setId", (event, args) => {
  const isDev = args[1]
  isDev? global.id = 0 : global.id = args[0]
})

if(!storageItem("sidebar")) {
  setStorage("sidebar", {
    isOpen: true,
    size: 25
  })
}
if(!storageItem("volume")) {
  setStorage("volume", 50)
}

document.addEventListener("keydown", (event) => {
  if(document.activeElement.tagName === "VIDEO") return
  if(document.getElementsByTagName("video")[0]) {
    if(event.key === "Escape") { //Back to main
      if(isFullScreen()) {
        fullScreenToggle(false)
      } else root.render(<App />)
    }
  }
  if(event.ctrlKey) {
    if(event.key === "w") {
      ipcRenderer.send("end", [global.id])
    }
  }
})

setInterval(() => {
  const playing = document.getElementById("Playing")
  const video = document.getElementsByTagName("video")[0]
  if(video) video.blur()
  if(document.getElementById("playBarInput")) document.getElementById("playBarInput").blur()
  if(!playing) return
  if(playing.classList.contains("fullScreen")) {
    playing.style.minWidth = `calc(1${storageItem("sidebar").size}vw + 4px)`
  } else {
    if(storageItem("sidebar").isOpen) playing.style.minWidth = `100vw`
    else playing.style.minWidth = `calc(1${storageItem("sidebar").size}vw + 4px)`
  }
}, 1)

ipcRenderer.on(OPEN_VIDEO, (event, args) => {
  console.log(args[0])
  playVideo(args[0])
})

ipcRenderer.on("log", (event, args) => {
  console.log(args)
})

root.render(<App />)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals()

export function fullScreenToggle(bool) {
  const playing = document.getElementById("Playing")
  if(!playing) return
  const isNowFull = playing.classList.contains("fullScreen")
  if(bool !== undefined) {
    if(bool == false) playing.classList.remove("fullScreen")
    else if(bool == true) playing.classList.add("fullScreen")
    ipcRenderer.send(FULL_SCREEN, [global.id, bool])
  }
  isNowFull? playing.classList.remove("fullScreen") : playing.classList.add("fullScreen")
  ipcRenderer.send(FULL_SCREEN, [global.id, !isNowFull])
  return isNowFull
}


ipcRenderer.on(ALERT, (event, args) => {
  alertText(args[0], args[1])
})

export function alertText(message, isRed) {
  const alertDiv = document.getElementById("alert")
  const alert = document.createElement("span")
  if(12 <= alertDiv.children.length) alertDiv.children[0].remove()
  alert.innerText = message
  alert.classList.add("alertItem")
  if(isRed) alert.classList.add("red")
  alertDiv.prepend(alert)
  setTimeout(() => {
    let i = 1
    const slowRemove = setInterval(() => {
      i-=0.01
      alert.style.opacity = i
      if(i <= 0) {
        alert.remove()
        clearInterval(slowRemove)
      }
    }, 5)
  }, 2000)
}


export function isFullScreen() {
  const playing = document.getElementById("Playing")
  if(!playing) return
  return playing.classList.contains("fullScreen")
}


export function playVideo(path, isSide, data) {
  if(document.getElementsByTagName("video")[0]) {
    if(decodeURI(document.getElementsByTagName("video")[0].src.replace("file:///", "")).replaceAll("\\", "/") === 
    path.replaceAll("\\", "/")) {
      document.getElementsByTagName("video")[0].src = path
      return
    }
  }
  root.unmount()
  root = ReactDOM.createRoot(document.getElementById('root'))
  root.render(
    <Playing videoPath={path} />
  )

  //사이드바 클릭일때 사이드바 위치 설정
  if(isSide) {
    let count = -1
    ipcRenderer.once(VIDEOS_IN_PATH_RESPONSE, (event, paths) => {
      count = paths.length
    })
    ipcRenderer.send(VIDEOS_IN_PATH, [path])
    let setSidebarOffset = setInterval(() => {
      if(count != -1 && count === document.getElementById("SidebarItems").children.length-1) {
        document.getElementById("Sidebar").scrollTo(0, data.offset+document.getElementById("Thumbnail").height)
        clearInterval(setSidebarOffset)
      }
    }, 10)
  }
}