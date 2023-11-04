import * as Sentry from '@sentry/browser'

export enum FunLogLevel {
  INFO = 'info',
  DEBUG = 'debug',
  ERROR = 'error',
}

/**===============================
 * FUN LOGGER CLASS WITH SENTRY
 *================================*/

export class FunLogger {
  constructor() {
    Sentry.init({
      // TODO: process.env.NODE_ENV
      environment: 'development',
      dsn: 'https://c7c82dd7e49a55b93890a4dabbd5d8b5@o4506162121867264.ingest.sentry.io/4506162233212928',
    })
  }

  private isSentryReady() {
    return !!Sentry.getCurrentHub().getClient()
  }

  /**
   * Writes to sentry
   */
  private writeErrorToSentry(error: Error, otherData?: object) {
    const otherDataSafe = otherData ? otherData : {}
    Sentry.captureException(error, {
      level: FunLogLevel.ERROR,
      extra: { package: '@funkit/react', ...otherDataSafe },
    })
  }

  // TODO:
  // public log() { // handles error, debug, info, etc }
  // private onDebug() {}
  // private onInfo() {}

  /**
   * On receiving an error, write it to sentry
   * TODO: Make this a private function
   */
  public onError(error: Error, otherData?: object) {
    this.writeErrorToSentry(error, otherData)
  }
}

/**===============================
 * INITIALIZATION
 *================================*/

// Init funLogger at top-level
const funLogger = new FunLogger()

/**===============================
 * HIGHER ORDER FUNCTIONS (HOF)
 *================================*/

/**
 * HOF that takes in a `targetFn` and runs it in a try-catch.
 * @param {Function} targetFn The target function to be wrapped with error logging.
 * @returns {Function} A new function that wraps the target function with error handling. If an error occurs in the target function, it is logged, and `null` is returned.
 * @example withErrorLogging(function yourFunction() { ... })
 */
export function withErrorLogging(targetFn) {
  return function (...args) {
    try {
      return targetFn(...args)
    } catch (error: any) {
      funLogger.onError(error, { source: 'regular function' })
      throw error
    }
  }
}

/**
 * Class decorator HOF equivalent of `withErrorLogging`
 * @example
 * // Applies error logging to all functions within the class
 * @ErrorLoggingClass
 * class YourClass {
 *   functionA() {...}
 *   functionB() {...}
 * }
 */
export function ErrorLoggingClass(constructor) {
  for (const methodName of Object.getOwnPropertyNames(constructor.prototype)) {
    // For all functions in the class
    if (typeof constructor.prototype[methodName] === 'function') {
      const originalMethod = constructor.prototype[methodName]
      // Apply error logging
      constructor.prototype[methodName] = function (...args: any[]) {
        try {
          return originalMethod.apply(this, args)
        } catch (error: any) {
          funLogger.onError(error, { source: 'class function' })
          throw error
        }
      }
    }
  }
}

// Optionally, we can also declare a method level decorator for use.
// But there isnt really a strong use case for this since we ideally want all functions to be logged anyways.
// For now, make use of class decorator @ErrorLoggingClass

// /**
//  * Method decorator HOF equivalent of `withErrorLogging`
//  * @example
//  * class YourClass {
//  *   @ErrorLogging
//  *   yourFunction() { ... }
//  * }
//  */
// export function ErrorLogging(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
//   const originalMethod = descriptor.value
//   descriptor.value = function (...args) {
//     try {
//       return originalMethod.apply(this, args)
//     } catch (error: any) {
//       funLogger.onError(error)
//     }
//   }
//   return descriptor
// }
