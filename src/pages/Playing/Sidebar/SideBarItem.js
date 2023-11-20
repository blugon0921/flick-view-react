import React, { useEffect, useState } from 'react';
import { styled } from 'styled-components';
import { CREATE_THUMBNAIL, VIDEO_INFO, VIDEO_INFO_RESPONSE } from "../../../constants";
import { playVideo } from "../../..";
import { AppData, Duration, basename } from "../../../modules"
const fs = window.require("fs")
const remote = window.require("@electron/remote")
const { ipcRenderer } = window.require("electron")

const thubmnailsFolder = `${AppData.replaceAll("\\", "/")}/thumbnails`

const SidebarItemDiv = styled.button`
  width: 100%;
  /* height: 10vh; */
  height: 6vw;
  display: flex;
  align-items: center;
  margin: 0 0 5px 0;
  background-color: #33363D;
  transition: 0.2s;
  /* padding: 1.5vh; */
  padding: 0.872vw;
  &:hover {
    background-color: #3E414A;
  }
  &.nowPlaying {
    background-color: #2A3654;
  }
  &.nowPlaying:hover {
    background-color: #394971;
  }
`

const ItemBulk = styled.div`
  display: flex;
  width: 100%;
`

const ThumbnailDiv = styled.div`
  width: 7.5vw;
  height: 4.218vw;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #222222;
  border-radius: 0.5vw;
  /* background-image: url("C:/Users/blugo/AppData/Roaming/FlickView/thumbnails/단단히 미쳤네.mp4.png"); */
  overflow: hidden;
  background-repeat: no-repeat;
  background-size: contain;
  background-position: center;
`

// const Thumbnail = styled.img`
//   /* height: 7.5vh; */
//   /* width: 7.5vw; */
//   height: 100%;
//   border-radius: 0.5vw;
// `

const ItemInfo = styled.div`
  width: calc(100% - 8vw);
  display: flex;
  flex-direction: column;
  margin-left: 1vw;
  align-items: flex-start;
`

const SideTitle = styled.span`
  /* font-size: 1.9vh; */
  width: 100%;
  font-size: 1.1vw;
  font-weight: 500;
  text-align: left;
`

const SideInfoText = styled.span`
  /* font-size: 1.5vh; */
  font-size: 0.87vw;
  font-weight: 400;
`

function SidebarItem(props) {
  let isNowPlaying = props.nowPlaying === props.videoPath
  let clazz = isNowPlaying? "nowPlaying" : ""

  const [thumbnail, setThumbnail] = useState("images/unloadedThumbnail.png")

  
  const [videoInfo, setVideoInfo] = useState({
    size: {
      width: 0,
      height: 0
    },
    duration: 0
  })
  useEffect(() => {
    if(!fs.existsSync(`${thubmnailsFolder}/${basename(props.videoPath)}.png`)) {
      ipcRenderer.send(CREATE_THUMBNAIL, [props.videoPath])
    }
    let interval = setInterval(() => {
      if(fs.existsSync(`${thubmnailsFolder}/${basename(props.videoPath)}.png`)) {
        setThumbnail(`${thubmnailsFolder}/${basename(props.videoPath)}.png`)
        clearInterval(interval)
      }
    }, 1)

    
    ipcRenderer.once(`${VIDEO_INFO_RESPONSE}${props.id}`, (event, args) => {
      const info = args[0]
      info.duration = new Duration(info.duration)
      setVideoInfo(info)
    })
    ipcRenderer.send(VIDEO_INFO, [props.videoPath, props.id])
  }, [])

  function playSidebarItem(path) {
    // playVideo(path, true, { offset: document.getElementById("Sidebar").scrollTop })
    playVideo(path, true, { offset: document.getElementById("Sidebar").scrollTop-document.getElementById("Thumbnail").height })
  }

  return (
    <SidebarItemDiv className={`SideBarItem ${clazz}`} onClick={() => playSidebarItem(props.videoPath)}>
      <ItemBulk>
        <ThumbnailDiv style={{ backgroundImage: `url("${thumbnail}")` }} />
        <ItemInfo>
          <SideTitle>{basename(props.videoPath)}</SideTitle>
          <SideInfoText>{basename(props.videoPath).split(".").pop().toUpperCase()} · {videoInfo.size.width}×{videoInfo.size.height}</SideInfoText>
          <SideInfoText>{(new Duration(videoInfo.duration)).stringFormat()}</SideInfoText>
        </ItemInfo>
      </ItemBulk>
    </SidebarItemDiv>
  );
}

export default SidebarItem