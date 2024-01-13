import ReactPlayer from "react-player"
import styled from "styled-components"
import "./VideoContainer.css"
import { useEffect, useState } from "react"
import { setStorage, storageItem } from "../../modules"
import { Duration } from "../../modules"
import { alertText, fullScreenToggle, isFullScreen } from "../.."
import { FRAME_COPY, FRAME_SAVE, OPEN_CLIP_FOLDER, OPEN_SCREENSHOT_FOLDER } from "../../constants"
const {ipcRenderer} = window.require("electron")

const SliderColor = "#3BC3FE"

const VideoDiv = styled.div`
  width: 100%;
  height: 100%;
`

const ControllerDiv = styled.div`
  width: 100%;
  height: 25vh;
  position: sticky;
  bottom: 0;
  /* width: 77.875%; */
  /* height: 10%; */
  /* height: 5rem; */
  display: flex;
  justify-content: flex-end;
  flex-direction: column;
  background: linear-gradient(to top, black, #00000000);
  transition: 0.2s;
  padding: 1vh;
  opacity: 0;
  pointer-events: none;
`

// Top
const Controller = styled.div`
  display: flex;
  justify-content: space-between;
  pointer-events: all;
`
const Left = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  & * {
    margin-right: 0.5vh;
  }
`

const PlayButton = styled.button`
  background: url("images/pause.svg") no-repeat center center;
  background-size: 100% 120%;
  &.paused {
    background: url("images/play.svg") no-repeat center center;
    background-size: 100% 100%;
  }
`

const VolumeDiv = styled.div`
  display: flex;
  align-items: center;
`
const VolumeButton = styled.button`
  &[data-shape="none"] {
    background: url("images/volume-none.svg") no-repeat left center;
    background-size: 90% 100%;
  }
  &[data-shape="off"] {
    background: url("images/volume-off.svg") no-repeat left center;
    background-size: 50% 100%;
  }
  &[data-shape="low"] {
    background: url("images/volume-low.svg") no-repeat left center;
    background-size: 70% 100%;
  }
  &[data-shape="high"] {
    background: url("images/volume-high.svg") no-repeat left center;
    background-size: 100% 100%;
  }
`

const VolumeInput = styled.input`
  height: 7px;
  background: linear-gradient(to right, ${SliderColor} 0%, ${SliderColor} 50%, #ececec 50%, #ececec 100%);
  -webkit-appearance: none;
  appearance: none;
  border-radius: 100px;
  accent-color: #00B2FF;
  &::-webkit-slider-runnable-track {
    opacity: 0;
    transition: 0.2s;
  }
  &:hover::-webkit-slider-runnable-track {
    opacity: 1;
    transition: 0.2s;
  }
`

const Right = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  & * {
    margin-left: 0.5vh;
  }
`
const MoreButton = styled.button`
  background: url("images/more.svg") no-repeat left center;
  background-size: 100% 100%;
`
const FullButton = styled.button`
  background-image: url("images/full.png");
  &.fullScreen {
    background-image: url("images/unfull.png");
  }
`


// Bottom
const PlayBar = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  height: 0;
  margin-top: 5px;
  margin-bottom: 5px;
  pointer-events: all;
`
const CurrentBarInput = styled.input`
  width: 100%;
  height: 7px;
  /* height: 50%; */
  position: absolute;
  background: linear-gradient(to right, ${SliderColor} 0%, ${SliderColor} 50%, #ececec 50%, #ececec 100%);
  -webkit-appearance: none;
  appearance: none;
  border-radius: 100px;
  accent-color: #00B2FF;
  &::-webkit-slider-runnable-track {
    opacity: 0;
    transition: 0.2s;
  }
  &:hover::-webkit-slider-runnable-track {
    opacity: 1;
    transition: 0.2s;
  }
`

const Etc = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  margin-bottom: 5px;
  pointer-events: none;
  & * {
    pointer-events: all;
  }
`
const MoreMenu = styled.div`
  margin-left: 77%;
  background-color: #27292E;
  display: flex;
  flex-direction: column;
  width: 9.5em;
  border-radius: 10px;
  padding-top: 1%;
  padding-bottom: 1%;
  transform: scale(1, 0);
  &.opend {
    transform: scale(1, 1);
  }
`
const MoreMenuItem = styled.button`
  padding: 8px;
  transition: 0.2s;
  margin: 0;
  background-color: #00000000;
  font-size: 15px;
  &:hover {
    background-color: #FFFFFF25;
  }
`

const getVideo = () => document.getElementsByTagName("video")[0]

let noControllTicks = 0

export default function VideoContainer(props) {
  useEffect(() => {
    const interval = setInterval(() => {
      const video = getVideo()
      if(!video) return
    
      //Play Bar
      const playBarInput = document.getElementById("playBarInput")
      var gradient_value = 100 / playBarInput.attributes.max.value
      playBarInput.style.background = `linear-gradient(to right, ${SliderColor} 0%, ${SliderColor} `+gradient_value * playBarInput.value +'%, #ececec ' +gradient_value *  playBarInput.value + '%, #ececec 100%)'
      
      //Volume
      const volumeInput = document.getElementById("volume")
      if(volumeInput) volumeInput.style.background = `linear-gradient(to right, ${SliderColor} 0%, ${SliderColor} `+ volumeInput.value +'%, #ececec ' + volumeInput.value + '%, #ececec 100%)'
    
      const videoDiv = document.getElementById("VideoDiv")
      const controller = document.getElementById("videoController")
      if(!videoDiv) return
      if(!controller) return
      isFullScreen()? document.getElementById("fullScreenBtn").classList.add("fullScreen") : document.getElementById("fullScreenBtn").classList.remove("fullScreen")
      if(video.paused) noControllTicks = 150
      if(noControllTicks === 0) {
        controller.style.opacity = 0
        // controller.style.pointerEvents = "none"
        videoDiv.style.cursor = "none"
      } else {
        controller.style.opacity = 1
        // controller.style.pointerEvents = "all"
        videoDiv.style.cursor = ""
        noControllTicks-=1
      }
    }, 10)
    return () => clearInterval(interval)
  }, [])

  const [volume, setvolume] = useState(storageItem("volume"))

  const [playing, setplaying] = useState(true)
  const [muted, setmuted] = useState(false)

  const [currentTime, setCurrentTime] = useState(undefined)

  const [volumeShape, setvolumeShape] = useState("high")
  function setVolumeShape() {
    if(muted) setvolumeShape("none")
    else {
      if(50 <= volume) setvolumeShape("high")
      else if(volume != 0 && volume != 1) setvolumeShape("low")
      else setvolumeShape("off")
    }
  }

  //Key Event
  useEffect(() => {
    function keyEvent(event) {
      if(document.activeElement.tagName === "VIDEO") event.preventDefault()
      if(event.key === " ") {
        event.preventDefault()
        setplaying(!playing)
      }
      
      const video = document.getElementsByTagName("video")[0]
      if(event.key === "ArrowRight") { //Wind
        video.currentTime += 5
        noControllTicks = 150
      } else if(event.key === "ArrowLeft") { //Rewind
        video.currentTime -= 5
        noControllTicks = 150
      }
      if(event.key === ".") { //Seek
        video.currentTime += 0.01
      } else if(event.key === ",") { //Rewind
        video.currentTime -= 0.01
      }
    }
    document.addEventListener("keydown", keyEvent)
    return () => document.removeEventListener("keydown", keyEvent)
  }, [playing])

  const [isMoreOpen, setIsMoreOpen] = useState(false)
  useEffect(() => {
    function moreMenuClose(event) {
      if(event.target.id === "MoreMenu") return
      if(event.target.id === "moreButton") return
      else if(event.target.parentElement.id === "MoreMenu") return
      setIsMoreOpen(false)
    }
    document.addEventListener("mousedown", moreMenuClose)
    return () => document.removeEventListener("mousedown", moreMenuClose)
  }, [isMoreOpen])

  useEffect(() => {
    setVolumeShape()
  }, [volume, muted, setVolumeShape])

  const [playBarInputValue, setplayBarInputValue] = useState(0)

  const [isPaused, setisPaused] = useState(undefined)
  return <VideoDiv id="VideoDiv"
    onMouseMove={() => { noControllTicks = 150 }}
    onClick={() => { noControllTicks = 150 }}
    onMouseLeave={() => { noControllTicks = 0 }}
  >
    <ReactPlayer playing={playing} url={`${props.videoPath}`} width={"100%"} height={"100%"} volume={volume/100}
      muted={muted}
      onProgress={(e) => {
        setCurrentTime(e)
        setplayBarInputValue(e.playedSeconds/e.loadedSeconds*10000)
      }}
      progressInterval={0}
      onClick={(event) => {
        // setplaying(!playing)
        setplaying(event.target.paused)
      }}
    />
    <ControllerDiv id="videoController">
      <Etc>
        <MoreMenu id="MoreMenu" className={isMoreOpen? "opend" : ""}>
          <MoreMenuItem onClick={() => { ipcRenderer.send(FRAME_SAVE, [props.videoPath, getVideo().currentTime]); alertText("동영상 프레임 저장을 시작합니다."); document.getElementById("MoreMenu").style.transform = "scale(1, 0)" }}>동영상 프레임 저장</MoreMenuItem>
          <MoreMenuItem onClick={() => { ipcRenderer.send(FRAME_COPY, [props.videoPath, getVideo().currentTime]); alertText("동영상 프레임 복사를 시작합니다."); document.getElementById("MoreMenu").style.transform = "scale(1, 0)" }}>동영상 프레임 복사</MoreMenuItem>
          <MoreMenuItem onClick={() => { ipcRenderer.send(OPEN_SCREENSHOT_FOLDER); document.getElementById("MoreMenu").style.transform = "scale(1, 0)" }}>스크린샷 폴더 열기</MoreMenuItem>
          <MoreMenuItem onClick={() => { ipcRenderer.send(OPEN_CLIP_FOLDER); document.getElementById("MoreMenu").style.transform = "scale(1, 0)" }}>클립 폴더 열기</MoreMenuItem>
        </MoreMenu>
      </Etc>
      <PlayBar id="playBar">
        <CurrentBarInput id="playBarInput" type={"range"} min={"0"} max={"10000"} value={playBarInputValue}
        onChange={(event) => {
          const video = getVideo()
          if(!video) return
          if(video.readyState === 0) return
          if(isPaused === undefined) setisPaused(video.paused)
          const isPlaying = video.currentTime > 0 && !video.paused && !video.ended && video.readyState > video.HAVE_CURRENT_DATA;
          if(isPlaying) setplaying(false)
          video.currentTime = (video.duration*(event.target.value/100))/100
          setplayBarInputValue(video.currentTime/video.duration*10000)
        }} onClickCapture={(e) => {
          const video = getVideo()
          if(!video) return
          const isPlaying = video.currentTime > 0 && !video.paused && !video.ended && video.readyState > video.HAVE_CURRENT_DATA;
          if (!isPlaying) {
            if(isPaused === false) setplaying(true)
            setisPaused(undefined)
          }
        }} />
      </PlayBar>
      <Controller>
        <Left>
          <PlayButton className={`controlIcon ${playing? "" : "paused"}`} onClick={() => {setplaying(!playing)}}/>
          <VolumeDiv id="VolumeDiv" className={muted? "" : "canFold"}>
            <VolumeButton id="volumeBtn" className="controlIcon" data-shape={volumeShape} onClick={() => {
              setmuted(!muted)
            }}/>
            <VolumeInput id="volume" type="range" min="0" max="100" value={volume}
              onChange={(e) => {
                const target = e.currentTarget
                setvolume(target.value)
                setStorage("volume", Number(target.value))
              }}
            />
          </VolumeDiv>
          <span id="currentTime">{currentTime? `${(new Duration(currentTime.playedSeconds)).stringFormat()} / ${(new Duration(currentTime.loadedSeconds)).stringFormat()}`
          : "00:00 / 00:00"
          }</span>
        </Left>
        <Right>
          <MoreButton id="moreButton" className={`controlIcon`} onClick={(e) => {setIsMoreOpen(!isMoreOpen)}}></MoreButton>
          <FullButton id={"fullScreenBtn"} className={`controlIcon`} onClick={(event) => {
            const isNowFull = fullScreenToggle()
            isNowFull? document.getElementById("Playing").classList.remove("fullScreen") : document.getElementById("Playing").classList.add("fullScreen")
          }}></FullButton>
        </Right>
      </Controller>
    </ControllerDiv>
  </VideoDiv>
}