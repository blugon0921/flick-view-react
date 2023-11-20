const ffmpegPath = require("ffmpeg-static-electron").path.replace("app.asar", "app.asar.unpacked")
const { app } = require("electron")
const ffmpeg = require("fluent-ffmpeg")
const { Duration } = require("./duration")
const path = require("path")
ffmpeg.setFfmpegPath(ffmpegPath)

module.exports = {
    basename: function(filePath) {
        return filePath.replace(/^.*[\\/]/, '')
    },
    
    ffmpeg: ffmpeg,

    asyncFfprobe: async (videoPath) => {
        return new Promise((resolve, reject) => {
            ffmpeg.ffprobe(videoPath, (error, metadata) => {
                if(error) return reject(new Error(error))
                // resolve(metadata)
                const info = {
                    videoPath: videoPath
                }
                for(let s in metadata.streams) { //Width & height
                    if(metadata.streams[s].width !== undefined && metadata.streams[s].height !== undefined) {
                        info.size = {
                            width: metadata.streams[s].width,
                            height: metadata.streams[s].height
                        }
                        break
                    }
                }
                let rFps
                metadata.streams.forEach(stream => {
                    if (stream.codec_type === "video") rFps = stream.r_frame_rate.split("/")
                }) 
                info.fps = rFps[0]/rFps[1] //Fps
                info.duration = new Duration(metadata.format.duration) //Duration
                resolve(info)
            })
        })
    },

    AppData: path.join(app.getPath("appData"), "FlickView"),
}