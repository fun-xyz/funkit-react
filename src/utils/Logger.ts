import * as Sentry from '@sentry/browser'

// Init Sentry
Sentry.init({
  environment: 'development', // TODO: replace with 'production' in builds
  dsn: 'https://c7c82dd7e49a55b93890a4dabbd5d8b5@o4506162121867264.ingest.sentry.io/4506162233212928',
})

export enum FunLogLevel {
  INFO = 'info',
  DEBUG = 'debug',
  ERROR = 'error',
}

export function withErrorLogging(callback) {
  try {
    const result = callback?.()
    return result
  } catch (err) {
    Sentry.captureException(err, { level: FunLogLevel.ERROR, extra: { source: '@funkit/react' } })
    return null
  }
}
