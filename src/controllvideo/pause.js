export default (event) => {
  if(event.key !== " ") return
  event.preventDefault()
  document.getElementsByTagName("video")[0].paused
    ? document.getElementsByTagName("video")[0].play()
    : document.getElementsByTagName("video")[0].pause()
}