import {useEffect, useState} from "react"
import { styled } from "styled-components"
import { setInValue, setStorage, storageItem } from "../../../modules"

const ResizeSidebar = styled.div`
  min-width: 4px;
  height: 100vh;
  background-color: #525763;
  cursor: ew-resize;
`

export default function ResizeBar(props) {
  const [isClicking, setClicking] = useState(false)

  useEffect(() => {
    function up(event) {
      document.body.style.cursor = ""
      setClicking(false)
    }
    function move(event) {
      if(!isClicking) return
      const clientWidth = document.body.clientWidth
      const width = event.clientX
      const sideBarWidth = 100-width/clientWidth*100
      if(sideBarWidth < 22 || 50 < sideBarWidth) return
      setStorage("sidebar", setInValue(storageItem("sidebar"), "size", sideBarWidth))
    }
    document.addEventListener("mouseup", up)
    document.addEventListener("mousemove", move)
    return () => {
      document.removeEventListener("mouseup", up)
      document.removeEventListener("mousemove", move)
    }
  }, [isClicking])
  
  return (
    <ResizeSidebar id="ResizeBar"
      onMouseDown={() => {
        if(isClicking) document.body.style.cursor = "ew-resize"
        setClicking(true)
      }}
    />
  )
}