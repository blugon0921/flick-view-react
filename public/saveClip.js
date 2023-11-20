const { ipcMain, app, clipboard, shell } = require("electron")
const { asyncFfprobe, AppData, basename } = require("./electronModule")
const { CREATE_THUMBNAIL, FRAME_SAVE, FRAME_COPY, OPEN_SCREENSHOT_FOLDER, ALERT, CLIP, OPEN_CLIP_FOLDER } = require("./constants")
const { Duration, durationFormat } = require("./duration")
const fs = require("fs")
const { remote } = require("electron/renderer")
const path = require("path")

async function saveClip(ffmpeg, videoPath, startSeconds, endSeconds, savePath, saveName, size, event) {
    if(!fs.existsSync(savePath)) fs.mkdirSync(savePath)
    return new Promise(async (resolve, reject) => {
        const info = await asyncFfprobe(videoPath)
        const partDuration = endSeconds-startSeconds

        ffmpeg(videoPath)
        .setStartTime(startSeconds)
        .setDuration(partDuration)
        .saveToFile(`${savePath}/${saveName}`)
        .on("end", () => {
            resolve(`${savePath}/${saveName}`)
        }).on("error", (err) => {
            reject(err)
        })
        .on("progress", (progress) => {
            if(!event) return
            const percent = ((durationFormat(progress.timemark).inSeconds()/partDuration)*100).toFixed(1)
            event.sender.send(ALERT, [`${percent}%`])
            // console.log(`Processing: ${percent}% done`);
        })
    })
}

module.exports = {
    saveClip: saveClip,

    initialized: async (ffmpeg) => {
        const clipFolder = path.join(AppData, "clip")
        //Register Events
        ipcMain.on(CLIP, async (event, args) => { //Frame Save
            const videoPath = args[0]
            const startTime = args[1]
            const endTime = args[2]
            const info = await asyncFfprobe(videoPath)
            
            //TODO 이름 겹치는 문제 해결
            let saveName = args[3]
                .replaceAll("{Title}", basename(videoPath).split(".")[0])
                .replaceAll("{Date}", module.exports.currentDate())
                .replaceAll("{Time}", module.exports.currentTime())
            let ext = path.extname(videoPath)
            if(fs.existsSync(`${path.join(clipFolder, saveName)}`)) {
                let number = -1
                while(true) {
                    number++
                    if(fs.existsSync(`${path.join(clipFolder, `${saveName}_${number}`)}.${ext}`)) continue
                    saveName = `${saveName}_${number}.${ext}`
                    break
                }
            }
            saveClip(ffmpeg, videoPath, startTime, endTime, clipFolder, saveName, {
                width: info.size.width,
                height: info.size.height,
            }, event).then((savePath) => {
                event.sender.send(ALERT, ["클립 생성이 완료되었습니다."])
            }).catch((error) => {
                console.log(error)
                event.sender.send(ALERT, ["오류로 인해 클립 생성에 실패했습니다.", true])
            })
        })
        
        ipcMain.on(OPEN_CLIP_FOLDER, async (event, args) => { //Frame Copy
            if(!fs.existsSync(clipFolder)) fs.mkdirSync(clipFolder)
            shell.openPath(path.join(clipFolder))
        })
    },

    currentDate() {
        const now = new Date()
        const year = now.getFullYear().toString().slice(-2)
        const month = (now.getMonth() + 1).toString().padStart(2, "0")
        const day = now.getDate().toString().padStart(2, "0")
      
        return `${year}.${month}.${day}`
    },

    currentTime() {
        const now = new Date()
        const hours = now.getHours().toString().padStart(2, "0")
        const minutes = now.getMinutes().toString().padStart(2, "0")
        const seconds = now.getSeconds().toString().padStart(2, "0")
        const milliseconds = now.getMilliseconds().toString()
      
        return `${hours}${minutes}${seconds}.${milliseconds}`
    }
}