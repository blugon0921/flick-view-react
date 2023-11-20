import ReactPlayer from "react-player"
import styled from "styled-components"
import "./VideoController.css"
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
  background-image: url("images/pause.png");
  &.paused {
    background-image: url("images/play.png");
  }
`

const VolumeDiv = styled.div`
  display: flex;
  align-items: center;
`
const VolumeButton = styled.button`
  /* background-image: url("images/volume-high.png"); */
  &[data-shape="none"] {
    background-image: url("images/volume-none.png");
  }
  &[data-shape="off"] {
      background-image: url("images/volume-off.png");
  }
  &[data-shape="low"] {
      background-image: url("images/volume-low.png");
  }
  &[data-shape="high"] {
      background-image: url("images/volume-high.png");
  }
`

const VolumeInput = styled.input`
  height: 7px;
  background: linear-gradient(to right, ${SliderColor} 0%, ${SliderColor} 50%, #ececec 50%, #ececec 100%);
  /* background: #ececec; */
  transition: background 450ms ease-in;
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
  background-image: url("images/more.png");
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
  transition: background 450ms ease-in;
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
setInterval(() => {
  const video = getVideo()
  if(!video) return

  //Play Bar
  document.getElementById("currentTime").innerText = `${(new Duration(video.currentTime)).stringFormat()} / ${(new Duration(video.duration)).stringFormat()}`
  const playBarInput = document.getElementById("playBarInput")
  playBarInput.value = video.currentTime/video.duration*10000
  var gradient_value = 100 / playBarInput.attributes.max.value;
  playBarInput.style.background = `linear-gradient(to right, ${SliderColor} 0%, ${SliderColor} `+gradient_value * playBarInput.value +'%, #ececec ' +gradient_value *  playBarInput.value + '%, #ececec 100%)';
  
  //Volume
  const volumeInput = document.getElementById("volume")
  if(volumeInput) volumeInput.style.background = `linear-gradient(to right, ${SliderColor} 0%, ${SliderColor} `+ volumeInput.value +'%, #ececec ' + volumeInput.value + '%, #ececec 100%)';

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
function VideoController(props) {
  const [volume, setvolume] = useState(storageItem("volume"))

  const [playing, setplaying] = useState(true)
  const [muted, setmuted] = useState(false)

  const [volumeShape, setvolumeShape] = useState("high")
  function setVolumeShape() {
    if(muted) setvolumeShape("none")
    else {
      if(50 <= volume) setvolumeShape("high")
      else if(volume != 0 && volume != 1) setvolumeShape("low")
      else setvolumeShape("off")
    }
  }

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
    // <ReactPlayer url={`${props.videoPath}`} width={"100%"} height={"100%"} volume={volume/100} 
      onPause={(e) => {setplaying(false)}}
      onPlay={(e) => {setplaying(true)}}
      muted={muted}
      onClick={(event) => {
        const video = event.target
        var isPlaying = video.currentTime > 0 && !video.paused && !video.ended && video.readyState > video.HAVE_CURRENT_DATA
        if(video.paused) {
          if (isPlaying) return
          video.play()
          setplaying(!video.paused)
        } else video.pause()
      }}
    />
    <ControllerDiv id="videoController">
      <Etc>
        <MoreMenu id="MoreMenu">
          <MoreMenuItem onClick={() => { ipcRenderer.send(FRAME_SAVE, [props.videoPath, getVideo().currentTime]); alertText("동영상 프레임 저장을 시작합니다."); document.getElementById("MoreMenu").style.transform = "scale(1, 0)" }}>동영상 프레임 저장</MoreMenuItem>
          <MoreMenuItem onClick={() => { ipcRenderer.send(FRAME_COPY, [props.videoPath, getVideo().currentTime]); alertText("동영상 프레임 복사를 시작합니다."); document.getElementById("MoreMenu").style.transform = "scale(1, 0)" }}>동영상 프레임 복사</MoreMenuItem>
          <MoreMenuItem onClick={() => { ipcRenderer.send(OPEN_SCREENSHOT_FOLDER); document.getElementById("MoreMenu").style.transform = "scale(1, 0)" }}>스크린샷 폴더 열기</MoreMenuItem>
          <MoreMenuItem onClick={() => {
            const isOpen = document.getElementById("ClipDiv").style.height === "275px"
            if(isOpen) {
              document.getElementById("ClipDiv").style.height = "0px"
              document.getElementById("ClipDiv").style.borderBottom = "none"
            } else {
              document.getElementById("ClipDiv").style.height = "275px"
              document.getElementById("ClipDiv").style.borderBottom = "#525763 2px solid"
            }
            document.getElementById("MoreMenu").style.transform = "scale(1, 0)"
          }}>클립 생성창 토글</MoreMenuItem>
          <MoreMenuItem onClick={() => { ipcRenderer.send(OPEN_CLIP_FOLDER); document.getElementById("MoreMenu").style.transform = "scale(1, 0)" }}>클립 폴더 열기</MoreMenuItem>
        </MoreMenu>
      </Etc>
      <PlayBar id="playBar">
        <CurrentBarInput id="playBarInput" type={"range"} min={"0"} max={"10000"} value={playBarInputValue} 
        onChange={(event) => {
          const video = getVideo()
          if(!video) return
          if(isPaused === undefined) {
            setisPaused(video.paused)
          }
          var isPlaying = video.currentTime > 0 && !video.paused && !video.ended && video.readyState > video.HAVE_CURRENT_DATA;
          if(isPlaying) {
            video.pause()
          }
          video.currentTime = (video.duration*(event.target.value/100))/100
          setplayBarInputValue(video.currentTime/video.duration*10000)
        }} onClickCapture={(e) => {
          const video = getVideo()
          if(!video) return
          var isPlaying = video.currentTime > 0 && !video.paused && !video.ended && video.readyState > video.HAVE_CURRENT_DATA;
          if (!isPlaying) {
            if(isPaused === false) video.play()
            setisPaused(undefined)
          }
        }} />
      </PlayBar>
      <Controller>
        <Left>
          <PlayButton className={`controlIcon ${playing? "" : "paused"}`} onClick={() => {
            const video = getVideo()
            if(!video) return
            var isPlaying = video.currentTime > 0 && !video.paused && !video.ended && video.readyState > video.HAVE_CURRENT_DATA;
            if(video.paused) {
              if (isPlaying) return
              video.play()
              setplaying(!video.paused)
            } else video.pause()
          }}/>
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
          <span id="currentTime">00:00 / 00:00</span>
        </Left>
        <Right>
          <MoreButton className={`controlIcon`} onClick={() => {
            document.getElementById("MoreMenu").style.transform = "scale(1, 1)"
          }}></MoreButton>
          <FullButton id={"fullScreenBtn"} className={`controlIcon`} onClick={(event) => {
            const isNowFull = fullScreenToggle()
            isNowFull? document.getElementById("Playing").classList.remove("fullScreen") : document.getElementById("Playing").classList.add("fullScreen")
          }}></FullButton>
        </Right>
      </Controller>
    </ControllerDiv>
  </VideoDiv>
}

export default VideoController