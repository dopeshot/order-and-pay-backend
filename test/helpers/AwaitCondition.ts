export function AwaitCondition (conditionCallback, timeout, timestep): Boolean {
    let startTime = Date.now()
    while (Date.now() - timeout < startTime){
        setTimeout((conditionCallback) => {
            if (conditionCallback){
                return true
            }
        }, timestep)
    }
    return false
}
