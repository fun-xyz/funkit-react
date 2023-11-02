export enum FunLogLevel {
  INFO,
  DEBUG,
  ERROR,
}

interface FunLog {
  logLevel: FunLogLevel
  data: any
}

export async function withErrorLogging(callback: () => Promise<any>) {
  console.log('insideWithErrorLogging', callback)
  try {
    await callback?.()
  } catch (err) {
    // Construct log object
    const logObject: FunLog = { logLevel: FunLogLevel.ERROR, data: err }
    // TODO: Send to sentry / log server
    console.log(logObject)
  }
}
