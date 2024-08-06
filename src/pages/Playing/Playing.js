import React, { useEffect, useState } from 'react';
import { styled } from 'styled-components';
import Sidebar from "./Sidebar/Sidebar";
import ResizeBar from "./Sidebar/ResizeBar";
import { basename, setInValue, setStorage, storageItem } from "../../modules"
import VideoContainer from "./VideoContainer";
import { isFullScreen } from "../..";

// const { ipcRenderer } = window.require("electron")

const PlayingDiv = styled.div`
  min-width: 100vw;
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(storageItem("sidebar").isOpen? "" : "openSidebar")
  document.title = `Flick View | ${basename(props.videoPath)}`

  useEffect(() => {
    function sidebarToggle(event) {
      if(!document.getElementsByTagName("video")[0]) return
      if(event.ctrlKey) {
        if(event.key === "s") {
          if(isFullScreen()) return
          event.preventDefault()
          setStorage("sidebar", setInValue(storageItem("sidebar"), "isOpen", !storageItem("sidebar").isOpen))
          setIsSidebarOpen(storageItem("sidebar").isOpen)
        }
      }
    }
    document.addEventListener("keydown", sidebarToggle)
    return () => document.removeEventListener("keydown", sidebarToggle)
  }, [])

  return <PlayingDiv id={`Playing`} className={isSidebarOpen}>
    <VideoContainer videoPath={props.videoPath}/>
    <ResizeBar></ResizeBar>
    <Sidebar id={"Sidebar"} videoPath={props.videoPath} />
  </PlayingDiv>
}