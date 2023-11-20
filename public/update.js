const { dialog } = require("electron")
const log = require("electron-log")
const ProgressBar = require("electron-progressbar")
const { autoUpdater } = require("electron-updater")
autoUpdater.autoDownload = false

module.exports = (app, win) => {
    autoUpdater.checkForUpdates()
    let progressBar
    let isDownload = false

    autoUpdater.on("checking-for-update", () => {
        log.info("Checking Update...")
    })
    autoUpdater.on("update-available", (info) => {
        log.info("Update Available")
        win.hide()
        dialog.showMessageBox(win, {
            type: "info",
            title: "업데이트 확인",
            message: "새로운 업데이트가 있습니다. 지금 업데이트하시겠습니까?",
            cancelId: 1,
            buttons: ["업데이트", "나중에"]
        }).then(result => {
            if(result.response === 0) {
                autoUpdater.downloadUpdate()
            } else {
                win.show()
            }
        })
    })
    autoUpdater.on("update-not-available", (info) => {
        log.info("This is the latest version")
    })
    autoUpdater.on("error", (err) => {
        log.info("Error in auto-updater. " + err)
        dialog.showErrorBox("Error: ", err == null ? "unknown" : (err.stack || err).toString())
        win.show()
    })
    let once = false
    autoUpdater.on("download-progress", (progressObj) => {
        let log_message = `Download Speed: ${progressObj.bytesPerSecond}bytes/s`
        log_message = log_message + " - Download: " + progressObj.percent + "%"
        log_message = log_message + " (" + progressObj.transferred + "/" + progressObj.total + ")"
        log.info(log_message)
        isDownload = true
        if(!once) {
            progressBar = new ProgressBar({
                indeterminate: false,
                title: "업데이트 파일 다운로드중...",
                detail: `업데이트 파일 다운로드중... ${Math.floor(progressObj.percent)}%}`,
                maxValue: 100
            }, app)
        }

        progressBar.detail = `업데이트 파일 다운로드중... ${Math.floor(progressObj.percent)}%`
        progressBar.value = Math.floor(progressObj.percent*10)/10

        if(!once) {
            progressBar.on("completed", () => {
                progressBar.setCompleted()
            }).on("aborted", () => {
                log.info("Aborted")
            })
        }
        once = true
    })
    autoUpdater.on("update-downloaded", (info) => {
        if(!isDownload) {
            win.show()
            return
        }
        log.info("Update complete")

        dialog.showMessageBox(win, {
            type: "info",
            title: "업데이트 설치",
            message: "업데이트 파일 다운로드가 완료되었습니다. 지금 업데이트 하시겠습니까?",
            cancelId: 1,
            buttons: ["확인", "취소"]
        }).then(result => {
            if(result.response === 0) {
                autoUpdater.quitAndInstall(false, true)
            } else {
                win.show()
            }
        })
    })
}