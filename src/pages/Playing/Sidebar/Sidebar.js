import React, { useEffect, useState } from 'react'
import { styled } from 'styled-components'
// import unloadedThumbnail from "images/unloadedThumbnail.png"
import { CREATE_THUMBNAIL, VIDEOS_IN_PATH, VIDEOS_IN_PATH_RESPONSE, VIDEO_INFO, VIDEO_INFO_RESPONSE } from "../../../constants"
import SidebarItem from "./SideBarItem"
import { AppData, Duration, basename, storageItem } from "../../../modules"
import Clip from "./Clip"
const { ipcRenderer } = window.require("electron")
const fs = window.require("fs")
const remote = window.require('@electron/remote');

const thubmnailsFolder = `${AppData}/thumbnails`

const SidebarDiv = styled.div`
  width: 0%;
  max-width: 50%;
  height: 100%;
  box-sizing: border-box;
  background-color: #27292E;
  overflow-y: auto;
`

const Bottom = styled.div`
  background-color: rgb(39, 41, 46);
  border-top-left-radius: 15px;
  border-top-right-radius: 15px;
  transform: translate(0, -15px);
  box-shadow: 0px 1px 8px 10px #FFFFFF30;
`

const VideoInfoContainer = styled.div`
  width: 100%;
  min-height: 4vw;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2%;
  border-bottom: #525763 2px solid;
`

const Title = styled.h1`
  width: 50%;
  font-size: 1.5vw;
`

const InfoText = styled.span`
  font-weight: 400;
  font-size: 1.2vw;
`


function Sidebar(props) {
  // console.log(AppData)
  const [thumbnail, setThumbnail] = useState("images/unloadedThumbnail.png")
  // const [thumbnail, setThumbnail] = useState(`${thubmnailsFolder}/${basename(props.videoPath)}.png`)
  if(!fs.existsSync(`${thubmnailsFolder}/${basename(props.videoPath)}.png`)) {
    ipcRenderer.send(CREATE_THUMBNAIL, [props.videoPath])
  }
  let interval = setInterval(() => {
    if(fs.existsSync(`${thubmnailsFolder}/${basename(props.videoPath)}.png`)) {
      setThumbnail(`${thubmnailsFolder}/${basename(props.videoPath)}.png`)
      clearInterval(interval)
    }
  }, 1)

  const [videoInfo, setVideoInfo] = useState("0×0 · 00:00")
  useEffect(() => {
    ipcRenderer.on(`${VIDEO_INFO_RESPONSE}-1`, (event, args) => {
      const info = args[0]
      if(info.videoPath !== props.videoPath) return
      info.duration = new Duration(info.duration)
      setVideoInfo(`${info.size.width}×${info.size.height} · ${info.duration.stringFormat(false)}`)
    })
    ipcRenderer.send(VIDEO_INFO, [props.videoPath, -1])
  }, [props.videoPath])

  const [items, setItems] = useState([])
  useEffect(() => {
    ipcRenderer.on(VIDEOS_IN_PATH_RESPONSE, (event, paths) => {
      setItems(paths)
    })
    ipcRenderer.send(VIDEOS_IN_PATH, [props.videoPath])
  }, [props.videoPath])

  return (
    <SidebarDiv id="Sidebar" style={{
      minWidth: `${storageItem("sidebar").size}vw`
    }}>
      <Clip videoPath={props.videoPath} />
      <img id="Thumbnail" src={thumbnail} alt="Thumbnail.png" width={"100%"} />
      <Bottom id={"SidebarItems"}>
        <VideoInfoContainer>
          <Title id="Title">{basename(props.videoPath)}</Title>
          <InfoText id="InfoText">{videoInfo}</InfoText>
        </VideoInfoContainer>
        {
          items.map((item, index) => {
            return (
              <SidebarItem videoPath={item} nowPlaying={props.videoPath} key={index} id={index}></SidebarItem>
            )
          })
        }
      </Bottom>
    </SidebarDiv>
  );
}

export default Sidebar