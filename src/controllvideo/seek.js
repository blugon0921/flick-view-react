export default (event) => {
  if(event.key === "ArrowRight") { //Seek
    document.getElementsByTagName("video")[0].currentTime += 5
  } else if(event.key === "ArrowLeft") { //Rewind
    document.getElementsByTagName("video")[0].currentTime -= 5
  }
  if(event.key === ".") { //Seek
    document.getElementsByTagName("video")[0].currentTime += 0.001
  } else if(event.key === ",") { //Rewind
    document.getElementsByTagName("video")[0].currentTime -= 0.001
  }
}