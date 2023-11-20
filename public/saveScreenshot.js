const { ipcMain, app, clipboard, shell } = require("electron")
const { asyncFfprobe, AppData, basename } = require("./electronModule")
const { CREATE_THUMBNAIL, FRAME_SAVE, FRAME_COPY, OPEN_SCREENSHOT_FOLDER, ALERT } = require("./constants")
const { Duration } = require("./duration")
const fs = require("fs")
const { remote } = require("electron/renderer")
const path = require("path")

async function saveScreenshot(ffmpeg, videoPath, seconds, savePath, saveName, size) {
    if(!fs.existsSync(savePath)) fs.mkdirSync(savePath)
    return new Promise((resolve, reject) => {
        ffmpeg(videoPath).screenshots({
            count: 1,
            folder: savePath,
            size: `${size.width}x${size.height}`,
            filename: saveName,
            timestamps: [seconds]
        }).on("end", () => {
            resolve(`${savePath}/${saveName}`)
        }).on("error", (err) => {
            reject(err)
        })
    })
}

module.exports = {
    saveScreenshot: saveScreenshot,

    initialized: async (ffmpeg) => {
        const thubmnailsFolder = path.join(AppData, "thumbnails")
        ipcMain.on(CREATE_THUMBNAIL, async (event, args) => {
            const videoPath = args[0]
            const info = await asyncFfprobe(videoPath)

            const ratio = info.size.width/info.size.height
            const height = 200
            let width = Math.floor(height*ratio)
            saveScreenshot(ffmpeg, videoPath, info.duration.inSeconds()/2, thubmnailsFolder, `${basename(videoPath)}.png`, {
                width: width,
                height: height
            })
        })

        //Register Events
        const screenshotFolder = path.join(AppData, "screenshot")
        ipcMain.on(FRAME_SAVE, async (event, args) => { //Frame Save
            const videoPath = args[0]
            const currentTime = args[1]
            const info = await asyncFfprobe(videoPath)
            
            let saveName = `${basename(videoPath)}.png`
            if(fs.existsSync(`${path.join(screenshotFolder, saveName)}`)) {
                let number = -1
                while(true) {
                    number++
                    if(fs.existsSync(`${path.join(screenshotFolder, `${basename(videoPath)}_${number}`)}.png`)) continue
                    saveName = `${basename(videoPath)}_${number}.png`
                    break
                }
            }
            saveScreenshot(ffmpeg, videoPath, currentTime, path.join(screenshotFolder), saveName, {
                width: info.size.width,
                height: info.size.height
            }).then((savePath) => {
                event.sender.send(ALERT, ["동영상 프레임을 저장했습니다."])
            }).catch((error) => {
                event.sender.send(ALERT, ["오류로 인해 동영상 프레임 저장에 실패했습니다.", true])
            })
        })
        
        ipcMain.on(FRAME_COPY, async (event, args) => { //Frame Copy
            const videoPath = args[0]
            const currentTime = args[1]
            const random = Math.random() * (99999 - 10000) + 10000
            const info = await asyncFfprobe(videoPath)
            saveScreenshot(ffmpeg, videoPath, currentTime, path.join(screenshotFolder), `${basename(videoPath)}-${random}.png`, {
                width: info.size.width,
                height: info.size.height
            }).then((savePath) => {
                clipboard.writeImage(savePath)
                fs.unlinkSync(savePath)
                event.sender.send(ALERT, ["동영상 프레임을 복사했습니다."])
            }).catch((error) => {
                event.sender.send(ALERT, ["오류로 인해 동영상 프레임 복사에 실패했습니다.", true])
            })
        })
        
        ipcMain.on(OPEN_SCREENSHOT_FOLDER, async (event, args) => { //Frame Copy
            if(!fs.existsSync(screenshotFolder)) fs.mkdirSync(screenshotFolder)
            shell.openPath(path.join(screenshotFolder))
        })
    }
}