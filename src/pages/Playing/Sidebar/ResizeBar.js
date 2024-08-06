import { useEffect } from "react"
import { styled } from "styled-components"
import { setInValue, setStorage, storageItem } from "../../../modules"

const ResizeSidebar = styled.div`
  min-width: 4px;
  height: 100vh;
  background-color: #525763;
  cursor: ew-resize;
`

let isClick = false
export default function ResizeBar(props) {

  useEffect(() => {
    document.getElementById("ResizeBar").addEventListener("mousedown", (event) => {
      if(isClick) document.body.style.cursor = "ew-resize"
      isClick = true
    })
    document.body.addEventListener("mouseup", (event) => {
      document.body.style.cursor = ""
      isClick = false
    })
    document.body.addEventListener("mousemove", (event) => {
      if(!isClick) return
      const clientWidth = document.body.clientWidth
      const width = event.clientX
      const sideBarWidth = 100-parseFloat(width/clientWidth*100)
      if(sideBarWidth < 22 || 50 < sideBarWidth) return
      document.getElementById("Sidebar").style.minWidth = `${sideBarWidth}vw`
      setStorage("sidebar", setInValue(storageItem("sidebar"), "size", sideBarWidth))
    })
  }, [])
  
  return (
    <ResizeSidebar id="ResizeBar"></ResizeSidebar>
  )
}