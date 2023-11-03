export enum FunLogLevel {
  INFO = 'info',
  DEBUG = 'debug',
  ERROR = 'error',
}

interface FunLog {
  logLevel: FunLogLevel
  source: string
  cbName: string | null
  data: any
}

// FIXME: Kinda hacky
function getCallbackName(callback) {
  const name = callback.toString() || ''
  const reg = /function ([^\\(]*)/
  return reg.exec(name)?.[1] || ''
}

export function withErrorLogging(callback) {
  console.log('withErrorLogging - info', callback)
  try {
    const result = callback?.()
    return result
  } catch (err) {
    // Get the callback name
    const cbName = getCallbackName(callback)
    // Construct log object
    const logObject: FunLog = {
      logLevel: FunLogLevel.ERROR,
      source: 'funkit/react',
      cbName,
      data: err,
    }
    // TODO: Send to sentry / log server
    console.log('withErrorLogging - error', logObject)
    return null
  }
}
