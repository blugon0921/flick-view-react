import React, { useEffect, useState } from 'react';
import { styled } from 'styled-components';
import Sidebar from "./Sidebar/Sidebar";
import ResizeBar from "./Sidebar/ResizeBar";
import { basename, setInValue, setStorage, storageItem } from "../../modules"
import VideoContainer from "./VideoContainer";
import App from "../App/App"
import {FULL_SCREEN} from "../../constants"

const { ipcRenderer } = window.require("electron")

const PlayingDiv = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  transition: 0.3s;
  
  /* min-width: 125vw; */
  &.openSidebar {
    min-width: 100vw;
  }
`

export default function Playing(props) {
  // console.log(props.videoPath)
  const [isSidebarOpen, setSidebarOpen] = useState(storageItem("sidebar").isOpen)
  const [isFullScreen, setFullScreen] = useState(false)
  const [backgroundMinWidth, setBackgroundMinWidth] = useState(isSidebarOpen?"100vw":`calc(1${storageItem("sidebar").size}vw + 4px)`)

  function toggleFullScreen(bool) { //전체화면 설정
    if(bool) {
      ipcRenderer.send(FULL_SCREEN, [global.id, bool])
      setFullScreen(bool)
      return bool
    }
    ipcRenderer.send(FULL_SCREEN, [global.id, !isFullScreen])
    setFullScreen(!isFullScreen)
    return isFullScreen
  }

  //Playing 넓이 설정
  useEffect(() => {
    if(isFullScreen) setBackgroundMinWidth(`calc(1${storageItem("sidebar").size}vw + 4px)`) //전체화면일때
    else {
      if(isSidebarOpen) setBackgroundMinWidth("100vw") //사이드바 열려있을때
      else setBackgroundMinWidth(`calc(1${storageItem("sidebar").size}vw + 4px)`)
    }
  }, [isFullScreen, isSidebarOpen])

  //사이드바 토글
  useEffect(() => {
    document.title = `Flick View | ${basename(props.videoPath)}`
    function sidebarToggle(event) {
      if(event.ctrlKey && event.key === "s") {
        if(isFullScreen) return
        event.preventDefault()
        setStorage("sidebar", setInValue(storageItem("sidebar"), "isOpen", !storageItem("sidebar").isOpen))
        setSidebarOpen(storageItem("sidebar").isOpen)
      }
    }
    document.addEventListener("keydown", sidebarToggle)
    return () => document.removeEventListener("keydown", sidebarToggle)
  }, [])

  //ESC & Ctrl+W
  useEffect(() => {
    function backToMain(event) {
      if(event.key === "Escape") { //Back to main
        if(isFullScreen) {
          toggleFullScreen(false)
        } else props.root.render(<App />)
      }
      if(event.ctrlKey) {
        if(event.key === "w") {
          ipcRenderer.send("end", [global.id])
        }
      }
    }
    document.addEventListener("keydown", backToMain)
    return () => document.removeEventListener("keydown", backToMain)
  }, [isFullScreen])

  return <PlayingDiv
    id={`Playing`}
    className={`${isSidebarOpen? "":"openSidebar"} ${isFullScreen? "fullScreen":""}`}
    style={{
      minWidth: `${backgroundMinWidth}`
    }}
  >
    <VideoContainer videoPath={props.videoPath} isFullScreen={isFullScreen} toggleFullScreen={toggleFullScreen}/>
    <ResizeBar />
    <Sidebar id={"Sidebar"} videoPath={props.videoPath} />
  </PlayingDiv>
}