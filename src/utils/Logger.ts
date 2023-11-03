import * as Sentry from '@sentry/browser'

export enum FunLogLevel {
  INFO = 'info',
  DEBUG = 'debug',
  ERROR = 'error',
}

/**===============================
 * FUN LOGGER CLASS WITH SENTRY
 *================================*/

class FunLogger {
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

  private writeErrorToSentry(error, functionName) {
    Sentry.captureException(error, {
      level: FunLogLevel.ERROR,
      extra: { source: '@funkit/react', functionName },
    })
  }

  /**
   * On receiving an error, write it to sentry and then throw it to ensure it is not silenced on client side
   */
  public onError(error, functionName) {
    this.writeErrorToSentry(error, functionName)
    throw error
  }
}

// Init funLogger at top-level
const funLogger = new FunLogger()

/**===============================
 * HIGHER ORDER FUNCTIONS (HOF)
 *================================*/

/**
 * HOF that takes in a targetFn and runs it in a try-catch.
 * @example
 * withErrorLogging(function yourFunction() { ... })
 * @param {Function} targetFn The target function to be wrapped with error logging.
 * @returns {Function} A new function that wraps the target function with error handling. If an error occurs in the target function, it is logged, and `null` is returned.
 */
export function withErrorLogging(targetFn) {
  return function (...args) {
    try {
      return targetFn(...args)
    } catch (error) {
      funLogger.onError(error, targetFn.name)
    }
  }
}

/**
 * Class decorator HOF equivalent of `withErrorLogging`
 * @example
 * // Applied to all functions in the class
 * @ErrorLoggingClass
 * class YourClass {
 *   functionA() {...}
 *   functionB() {...}
 * }
 */
export function ErrorLoggingClass(constructor) {
  for (const methodName of Object.getOwnPropertyNames(constructor.prototype)) {
    if (typeof constructor.prototype[methodName] === 'function') {
      const originalMethod = constructor.prototype[methodName]
      constructor.prototype[methodName] = function (...args: any[]) {
        try {
          return originalMethod.apply(this, args)
        } catch (error: any) {
          funLogger.onError(error, methodName)
        }
      }
    }
  }
}

/**
 * Method decorator HOF equivalent of `withErrorLogging`
 * - Make use of class decorator instead  of declaring this on all functions
 *
 * @example
 * class YourClass {
 *   @ErrorLogging
 *   yourFunction() { ... }
 * }
 */
export function ErrorLogging(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value
  descriptor.value = function (...args) {
    try {
      return originalMethod.apply(this, args)
    } catch (error: any) {
      funLogger.onError(error, propertyKey)
    }
  }
  return descriptor
}
