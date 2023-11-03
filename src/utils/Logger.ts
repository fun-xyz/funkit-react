import * as Sentry from '@sentry/browser'

// const ENVIRONMENT = 'development'

// Init Sentry
Sentry.init({
  environment: 'development',
  dsn: 'https://c7c82dd7e49a55b93890a4dabbd5d8b5@o4506162121867264.ingest.sentry.io/4506162233212928',
})

export enum FunLogLevel {
  INFO = 'info',
  DEBUG = 'debug',
  ERROR = 'error',
}

/**
 * Higher order function that takes in a targetFn and runs it in a try-catch.
 * Caught exceptions
 * @example
 * // Standalone function wrapper
 * withErrorLogging(yourFunction())
 * @example
 * // Class function decorator
 * class YourClass {
 *  @withErrorLogging
 *  yourFunction() { ... }
 * }
 * @param {Function} targetFn The target function to be wrapped with error logging.
 * @returns {Function} A new function that wraps the target function with error handling. If an error occurs in the target function, it is logged, and `null` is returned.
 */
export function withErrorLogging(targetFn) {
  return (...args) => {
    try {
      return targetFn(...args)
    } catch (error) {
      Sentry.captureException(error, {
        level: FunLogLevel.ERROR,
        extra: { source: '@funkit/react', functionName: targetFn.name },
      })
      return null
    }
  }
}
