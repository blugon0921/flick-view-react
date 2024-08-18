import "./App.css"
import React, { useEffect, useState } from 'react';
import { styled } from 'styled-components';
import { OPEN_FILE, OPEN_VIDEO } from "../../constants";
import { playVideo } from "../..";
import mime from "mime";
const { ipcRenderer } = window.require("electron")


const AppDiv = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`

const Version = styled.h4`
  position: fixed;
  top: 0;
  left: 0;
  font-size: 2.5vh;
  margin: 10px;
`

const videoExtensions = [
  "webm",
  "ogv",
  "mov",
  "mp4",
  "m4v",
  "mkv",
]



let dropBox = document.getElementById("root")

document.body.addEventListener("drop", (event) => {
  // if(isOpenHelp()) return
  event.preventDefault()
  if(!event.dataTransfer.files) return
  const file = event.dataTransfer.files[0]
  if(file === undefined) return
  dropBox.classList.remove("active")
  if(mime.getType(file.path).startsWith("video")) {
    playVideo(file.path, false)
  } else {
    dropBox.classList.add("wrong")
    setTimeout(() => {
      dropBox.classList.remove("wrong")
    }, 500)
  }
})

document.body.addEventListener("dragover", (e) => {
  e.preventDefault()
})

document.body.addEventListener("dragenter", (e) => {
  e.preventDefault()
  dropBox.classList.add("active")
})

document.body.addEventListener("dragleave", (e) => {
  e.preventDefault()
  dropBox.classList.remove("active")
})
export default function App() {
  document.title = `Flick View`

  return (
    <AppDiv id="App">
      <Version>2.0.5</Version>
      <h1 className="dad text">드래그 앤 드롭</h1>
      <h1 className="or text">OR</h1>
      <button id="openBtn" onClick={() => {
        ipcRenderer.send(OPEN_FILE, [])
      }}>클릭하여 열기</button>
    </AppDiv>
  )
}