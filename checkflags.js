module.exports = async (message,flag) => {
    if(message.includes(`--${flag}`)){
        let ar = message.split(` --${flag}`).join("")
        console.log(ar)
        return ar
    }else if(message.includes(`-${flag}`)){
        let ar = message.split(` -${flag}`).join("")
        console.log(ar)
        return ar
    }else{
        return null
    }
}