import React from 'react';
import { styled } from 'styled-components';
import Sidebar from "./Sidebar/Sidebar";
import ResizeBar from "./Sidebar/ResizeBar";
import { basename, storageItem } from "../../modules"
import VideoController from "./VideoController";

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

function Playing(props) {
  // console.log(props.videoPath)
  document.title = `Flick View | ${basename(props.videoPath)}`

  return <PlayingDiv id={`Playing`} className={storageItem("sidebar").isOpen? "" : "openSidebar"}>
    <VideoController videoPath={props.videoPath}/>
    <ResizeBar></ResizeBar>
    <Sidebar id={"Sidebar"} videoPath={props.videoPath} />
  </PlayingDiv>
}

export default Playing