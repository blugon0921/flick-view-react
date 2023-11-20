const remote = window.require("@electron/remote")



function basename(filePath) {
    return filePath.replace(/^.*[\\/]/, '')
}

class Duration {
    days = 0
    hours = 0
    minutes = 0
    seconds = 0
    milliseconds = 0

    constructor(object) {
        if(typeof object === "string") {
            const duration = durationFormat(object)
            if(duration) {
                this.days = duration.days
                this.hours = duration.hours
                this.minutes = duration.minutes
                this.seconds = duration.seconds
                this.milliseconds = duration.milliseconds
            }
        } else if(typeof object === "number") {
            this.seconds = object
        } else {
            if(object.days !== undefined) this.days += object.days
            if(object.hours !== undefined) this.hours += object.hours
            if(object.minutes !== undefined) this.minutes += object.minutes
            if(object.seconds !== undefined) this.seconds += object.seconds //초
            if(object.milliseconds !== undefined) this.milliseconds += object.milliseconds
        }
        this.sort()
    }

    sort() {
        if(1 <= this.seconds) {
            this.milliseconds+=Math.round((this.seconds%1)*1000)
            this.seconds = Math.floor(this.seconds)
        }
        while(1000 <= this.milliseconds) {
            this.seconds++
            this.milliseconds-=1000
        }
        while(60 <= this.seconds) {
            this.minutes++
            this.seconds-=60
        }
        while(60 <= this.minutes) {
            this.hours++
            this.minutes-=60
        }
        while(24 <= this.hours) {
            this.days++
            this.hours-=24
        }
    }
    
    inDays() {
        return (this.days)+(this.hours/24)+(this.minutes/60/24)+(this.seconds/60/60/24)+(this.milliseconds/1000/60/60/24)
    }
    inHours() {
        return (this.days*24)+(this.hours)+(this.minutes/60)+(this.seconds/60/60)+(this.milliseconds/1000/60/60)
    }
    inMinutes() {
        return (this.days*24*60)+(this.hours*60)+(this.minutes)+(this.seconds/60)+(this.milliseconds/1000/60)
    }
    inSeconds() {
        return (this.days*24*60*60)+(this.hours*60*60)+(this.minutes*60)+(this.seconds)+(this.milliseconds/1000)
    }
    inMilliseconds() {
        return (this.days*24*60*60/1000)+(this.hours*60*60/1000)+(this.minutes*60/1000)+(this.seconds/1000)+(this.milliseconds)
    }

    stringFormat(isMarkMilli) {
        var day = Math.floor(this.days).toString()
        var hour = Math.floor(this.hours).toString()
        var minute = Math.floor(this.minutes).toString()
        var second = Math.floor(this.seconds).toString()
      
        if(day.length == 1) day=`0${day}`
        if(hour.length == 1) hour=`0${hour}`
        if(minute.length == 1) minute=`0${minute}`
        if(second.length == 1) second=`0${second}`
        
        var value = ""
        if(day != "00") value+=`${day}:`
        if(hour != "00") value+=`${hour}:`
        value+=`${minute}:${second}`
        if(isMarkMilli) value+=`.${this.milliseconds}`
        return value
    }
}

function durationFormat(time) {
    let day = 0
    let hour = 0
    let minute = 0
    let second = 0
    let millisecond = 0
    if(time.includes(".")) {
        const timeArr = time.split(".")
        if(timeArr.length < 3) {
            millisecond = Number(timeArr[1])
        }
    }
    if(time.includes(":")) {
        const timeArr = time.split(":")
        if(timeArr.length === 4) {
            day = Number(timeArr[0])
            hour = Number(timeArr[1])
            minute = Number(timeArr[3])
            second = Number(timeArr[4]?.split(".")[0])
        } else if(timeArr.length === 3) {
            hour = Number(timeArr[0])
            minute = Number(timeArr[1])
            second = Number(timeArr[2]?.split(".")[0])
        } else if(timeArr.length === 2) {
            minute = Number(timeArr[0])
            second = Number(timeArr[1]?.split(".")[0])
        } else if(timeArr.length === 1) second = Number(timeArr[0].split(".")[0])
    } else second = Number(time)

    if(isNaN(day+hour+minute+second+millisecond)) return

    return new Duration({
        days: day,
        hours: hour,
        minutes: minute,
        seconds: second,
        milliseconds: millisecond,
    })
}

const AppData = `${remote.app.getPath("appData")}/FlickView`

function storageItem(key) {
    return JSON.parse(window.localStorage.getItem(key))
}

function setStorage(key, value) {
    window.localStorage.setItem(key, JSON.stringify(value))
}

function setInValue(object, key, value) {
    object[key] = value
    return object
}
export {
    basename,
    Duration,
    durationFormat,
    AppData,
    storageItem,
    setStorage,
    setInValue
}