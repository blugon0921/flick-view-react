import React, { useState } from 'react';
import styled from "styled-components";
import { Duration, durationFormat } from "../../../modules";
import { CLIP } from "../../../constants";
import { alertText } from "../../..";

const { ipcRenderer } = window.require("electron")


const ClipDiv = styled.div`
  width: 100%;
  /* height: 50%; */
  /* height: 275px; */
  height: 0;
  /* border-bottom: #525763 2px solid; */
  border-bottom: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: 0.3s;
  /* transform: scale(1, 0); */
`

//Top
const Top = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px;
  border-bottom: #525763 2px solid;
`
const Title = styled.h1`
  font-size: 2vw;
`
const Close = styled.button`
  margin: 0;
  width: 30px;
  height: 30px;
  background-color: #00000000;
  font-size: 3vw;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
`
const SaveName = styled.input`
  margin: 17px;
  width: 95%;
  height: 25px;
  background: #00000044;
  border-bottom: #ffffff 1px solid;
  border-radius: 3px;
  font-size: 15px;
`

//Middle
const Middle = styled.div`
  display: flex;
  width: 100%;
  height: 82px;
  justify-content: space-around;
`
const TimeDiv = styled.div`
  width: 26%;
  min-width: 61px;
  height: 100%;
  background-color: transparent;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-direction: column;
`
const InsertTime = styled.button`
  background-color: transparent;
  border: none;
  font-size: 15px;
  background-image: url(images/insert.png);
  background-size: cover;
  background-repeat: no-repeat;
  margin: 0;
  min-width: 22px;
  min-height: 20px;
`
const TimeInput = styled.input`
  width: 100%;
  height: 70%;
  background-color: #00000044;
  border-radius: 10px;
  font-size: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
`

//Bottom
const Bottom = styled.div`
  width: 100%;
  margin: 0;
  padding: 13px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`
const Alert = styled.span`
  color: rgb(255, 80, 80);
  font-size: 15px;
  font-weight: 500;
  opacity: 0;
`
const Create = styled.button`
  border-radius: 10px;
  background-color: #00B2FF;
  color: black;
  font-weight: 700;
  font-size: 20px;
  height: 35px;
  margin: 0;
`

let slowRemove = null
function alert(message) {
  document.getElementById("ClipAlert").innerText = message
  let i = 1.5
  clearInterval(slowRemove)
  slowRemove = setInterval(() => {
    i-=0.01
    document.getElementById("ClipAlert").style.opacity = i
    if(i <= 0) {
      clearInterval(slowRemove)
    }
  }, 5)
}
function Clip(props) {
  const [saveName, setsaveName] = useState("{Title}_{Date}-{Time}.mp4")

  return (
    <ClipDiv id="ClipDiv">
      <Top>
        <Title>클립 생성</Title>
        <Close onClick={() => {
          document.getElementById("ClipDiv").style.height = "0px"
          document.getElementById("ClipDiv").style.borderBottom = "none"
        }}>×</Close>
      </Top>
      <SaveName value={saveName} id="ClipSaveName" onChange={(event) => {
        setsaveName(event.target.value)
      }}></SaveName>
      <Middle>
        <Time id="time_one"></Time>
        <span style={{ marginTop: "40px" }}>-</span>
        <Time id="time_two"></Time>
      </Middle>
      <Bottom>
        <Alert id="ClipAlert">이스터에그 :)</Alert>
        <Create onClick={(event) => {
          const oneTime = new Duration(document.getElementById("time_one").value)
          const twoTime = new Duration(document.getElementById("time_two").value)
          if(twoTime.inSeconds() <= oneTime.inSeconds()) {
            alert("종료 시간은 시작 시간보다 빨라야 합니다.")
            return
          }
          ipcRenderer.send(CLIP, [props.videoPath, oneTime.inSeconds(), twoTime.inSeconds(), document.getElementById("ClipSaveName").value])
          alertText("클립 생성을 시작합니다.")
        }}>생성하기</Create>
      </Bottom>
    </ClipDiv>
  );
}

function Time(props) {
  const [value, setvalue] = useState("00:00.0")

  return (
    <TimeDiv>
      <InsertTime onClick={(event) => {
        const time = document.getElementsByTagName("video")[0].currentTime
        const duration = new Duration(time)
        setvalue(duration.stringFormat(true))
      }} />
      <TimeInput id={props.id} value={value} onChange={(event) => {
        const duration = new Duration(event.target.value)
        setvalue(duration.stringFormat(true))
      }}/>
    </TimeDiv>
  )
}


export default Clip