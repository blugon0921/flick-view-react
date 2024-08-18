import ReactPlayer from "react-player"
import styled from "styled-components"
import "./VideoContainer.css"
import { useEffect, useState } from "react"
import { setStorage, storageItem } from "../../modules"
import { Duration } from "../../modules"
import { alertText } from "../.."
import { FRAME_COPY, FRAME_SAVE, OPEN_CLIP_FOLDER, OPEN_SCREENSHOT_FOLDER } from "../../constants"
const {ipcRenderer} = window.require("electron")

const SliderColor = "#3BC3FE"

const VideoDiv = styled.div`
  width: 100%;
  height: 100%;
  
  &.false {
    cursor: none;
  }
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
  background: linear-gradient(to top, rgba(0, 0, 0, 0.6), #00000000);
  transition: 0.2s;
  padding: 1vh;
  opacity: 1;
  pointer-events: none;
  
  &.false {
    opacity: 0;
  }
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
const PlayBarInput = styled.input`
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
const playBarInputMax = 10000

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
  //width: 9.5em;
  border-radius: 10px;
  padding-top: 1%;
  padding-bottom: 1%;
  transform: scale(1, 0);
  &.opend {
    transform: scale(1, 1);
  }
`
const MoreMenuItem = styled.button`
  width: 12vw;
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

let noControlTicks = 150
export default function VideoContainer(props) {
  //점점점 메뉴
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

  //영상
  const [isPlaying, setPlaying] = useState(true)
  const [muted, setMuted] = useState(false)
  const [isPaused, setPaused] = useState(undefined)
  const [currentTime, setCurrentTime] = useState(undefined)

  //재생바
  const [playBarInputValue, setPlayBarInputValue] = useState(0)
  const [playBarBackground, setPlayBarBackground] = useState(`linear-gradient(to right, ${SliderColor} 0%, ${SliderColor} 0%, #ececec 0%, #ececec 100%)`)

  //볼륨
  const [volume, setVolume] = useState(storageItem("volume"))
  const [volumeBackground, setVolumeBackground] = useState(`linear-gradient(to right, ${SliderColor} 0%, ${SliderColor} 0%, #ececec 0%, #ececec 100%)`)
  const [volumeShape, setVolumeShape] = useState("high")
  function settingVolumeShape() {
    if(muted) setVolumeShape("none")
    else {
      if(50 <= volume) setVolumeShape("high")
      else if(volume !== 0 && volume !== 1) setVolumeShape("low")
      else setVolumeShape("off")
    }
  }

  //컨트롤 패?널
  const [isControllerVisible, setControllerVisible] = useState(true)
  useEffect(() => { //컨트롤창 등장/퇴장
    const interval = setInterval(() => {
      if(!isPlaying) noControlTicks = 150
      if(noControlTicks <= 0 && !isMoreOpen) {
        setControllerVisible(false)
      } else {
        setControllerVisible(true)
        if(0 < noControlTicks) noControlTicks -= 1
      }
    }, 10)
    return () => clearInterval(interval)
  }, [isPlaying, isMoreOpen])

  //재생바, 볼륨 인풋 모양 설정
  useEffect(() => {
    //재생바
    const gradient_value = 100 / playBarInputMax
    setPlayBarBackground(`linear-gradient(to right, ${SliderColor} 0%, ${SliderColor} `+gradient_value * playBarInputValue +'%, #ececec ' +gradient_value * playBarInputValue + '%, #ececec 100%)')
    //볼륨
    setVolumeBackground(`linear-gradient(to right, ${SliderColor} 0%, ${SliderColor} `+ volume +'%, #ececec ' + volume + '%, #ececec 100%)')
  }, [playBarInputValue, volume])


  //Key Event
  useEffect(() => {
    function keyEvent(event) {
      if(document.activeElement.tagName === "VIDEO") event.preventDefault()
      if(event.key === " ") {
        event.preventDefault()
        setPlaying(!isPlaying)
      }

      const video = document.getElementsByTagName("video")[0]
      if(event.key === "ArrowRight") { //Wind
        video.currentTime += 5
        noControlTicks = 150
      } else if(event.key === "ArrowLeft") { //Rewind
        video.currentTime -= 5
        noControlTicks = 150
      }
      if(event.key === ".") { //Seek
        video.currentTime += 0.01
      } else if(event.key === ",") { //Rewind
        video.currentTime -= 0.01
      }
    }
    document.addEventListener("keydown", keyEvent)
    return () => document.removeEventListener("keydown", keyEvent)
  }, [isPlaying])

  //볼륨버튼 모양설정
  useEffect(() => {
    settingVolumeShape()
  }, [volume, muted])

  const [isPip, setIsPip] = useState(false)
  const moreItems = [
    {
      text: "현재 프레임 저장",
      onClick: () => {
        ipcRenderer.send(FRAME_SAVE, [props.videoPath, getVideo().currentTime])
        alertText("현재 프레임 저장을 시작합니다.")
      }
    },
    {
      text: "현재 프레임 클립보드에 복사",
      onClick: () => {
        ipcRenderer.send(FRAME_COPY, [props.videoPath, getVideo().currentTime])
        alertText("현재 프레임 복사를 시작합니다.")
      }
    },
    {
      text: "스크린샷 폴더 열기",
      onClick: () => { ipcRenderer.send(OPEN_SCREENSHOT_FOLDER) }
    },
    {
      text: "클립 폴더 열기",
      onClick: () => { ipcRenderer.send(OPEN_CLIP_FOLDER) }
    },
    {
      text: "미리보기 이미지 지우기",
      onClick: () => { ipcRenderer.send("clearThumbnail") }
    },
    {
      text: "PIP모드",
      onClick: () => { setIsPip(!isPip) }
    }
  ]

  return <VideoDiv id="videoDiv"
    onMouseMove={() => { noControlTicks = 150 }}
    onClick={() => { noControlTicks = 150 }}
    onMouseLeave={() => { noControlTicks = 0 }}
    className={`${isControllerVisible}`}
  >
    <ReactPlayer playing={isPlaying} url={`${props.videoPath}`} width={"100%"} height={"100%"} volume={volume/100} pip={isPip}
      onPause={() => {
        if(isPip) {
          setPlaying(false)
          setPaused(true)
        }
      }}
      onPlay={() => {
        if(isPip) {
          setPlaying(true)
          setPaused(false)
        }
      }}
      muted={muted}
      onProgress={(e) => {
        setCurrentTime(e)
        setPlayBarInputValue(e.playedSeconds/e.loadedSeconds*10000)
      }}
      progressInterval={0}
      onClick={(event) => {
        setPlaying(event.target.paused)
      }}
    />
    <ControllerDiv id="videoController" className={`${isControllerVisible}`}>
      <Etc>
        <MoreMenu id="MoreMenu" className={isMoreOpen? "opend" : ""}>
          {
            moreItems.map((value) => {
              return (
                  <MoreMenuItem onClick={() => {
                    value.onClick()
                    setIsMoreOpen(false)
                  }}>{value.text}</MoreMenuItem>
              )
            })
          }
        </MoreMenu>
      </Etc>
      <PlayBar id="playBar">
        <PlayBarInput id="playBarInput" type={"range"} min={"0"} max={playBarInputMax} value={playBarInputValue}
        style={{
          background: `${playBarBackground}`
        }}
        onChange={(event) => {
          if(noControlTicks === 0) {
            noControlTicks = 150
            return
          }
          const video = getVideo()
          if(!video) return
          if(video.readyState === 0) return
          if(isPaused === undefined) setPaused(video.paused)
          const isPlaying = video.currentTime > 0 && !video.paused && !video.ended && video.readyState > video.HAVE_CURRENT_DATA;
          if(isPlaying) setPlaying(false)
          video.currentTime = (video.duration*(event.target.value/100))/100
          setPlayBarInputValue(video.currentTime/video.duration*10000)
        }} onClickCapture={(e) => {
          if(noControlTicks === 0) {
            noControlTicks = 150
            return
          }
          const video = getVideo()
          if(!video) return
          const isPlaying = video.currentTime > 0 && !video.paused && !video.ended && video.readyState > video.HAVE_CURRENT_DATA;
          if (!isPlaying) {
            if(isPaused === false) setPlaying(true)
            setPaused(undefined)
          }
        }} />
      </PlayBar>
      <Controller>
        <Left>
          <PlayButton className={`controlIcon ${isPlaying? "" : "paused"}`} onClick={() => {setPlaying(!isPlaying)}}/>
          <VolumeDiv id="VolumeDiv" className={muted? "" : "canFold"}>
            <VolumeButton id="volumeBtn" className="controlIcon" data-shape={volumeShape} onClick={() => {
              setMuted(!muted)
            }}/>
            <VolumeInput id="volume" type="range" min="0" max="100" value={volume}
              style={{
                background: `${volumeBackground}`
              }}
              onChange={(e) => {
                const target = e.currentTarget
                setVolume(target.value)
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
          <FullButton id={"fullScreenBtn"} className={`controlIcon${props.isFullScreen? " fullScreen":""}`} onClick={(event) => {
            props.toggleFullScreen()
          }}></FullButton>
        </Right>
      </Controller>
    </ControllerDiv>
  </VideoDiv>
}