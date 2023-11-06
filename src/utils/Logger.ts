import * as Sentry from '@sentry/browser'

enum FunLogLevel {
  INFO = 'info',
  DEBUG = 'debug',
  ERROR = 'error',
}

enum FunLogEnv {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
}

/**===============================
 * FUN LOGGER CLASS
 *================================*/

const SENTRY_DSN = 'https://c7c82dd7e49a55b93890a4dabbd5d8b5@o4506162121867264.ingest.sentry.io/4506162233212928'
const FUN_DEV_API_KEYS = ['hnHevQR0y394nBprGrvNx4HgoZHUwMet5mXTOBhf', 'MYny3w7xJh6PRlRgkJ9604sHouY2MTke6lCPpSHq']

/**
 * Inits the Sentry env. Overrides if any existing.
 * @param {FunLogEnv} environment
 */
function initSentry(environment: FunLogEnv) {
  Sentry.init({
    environment,
    dsn: SENTRY_DSN,
  })
}

class FunLogger {
  protected apiKey: string | null

  constructor() {
    // At initial init, set to dev
    initSentry(FunLogEnv.DEVELOPMENT)
    this.apiKey = null
  }

  private isSentryReady() {
    return !!Sentry.getCurrentHub().getClient()
  }

  private getFunLogEnv(): FunLogEnv {
    // If its an invalid api key or is a known dev api key, we are in dev env
    if (!this.apiKey || FUN_DEV_API_KEYS.includes(this.apiKey)) {
      return FunLogEnv.DEVELOPMENT
    } else {
      return FunLogEnv.PRODUCTION
    }
  }

  /**
   * Writes to sentry if in production mode
   */
  private writeErrorToSentry(error: Error, otherData?: object) {
    if (this.getFunLogEnv() === FunLogEnv.PRODUCTION) {
      const otherDataSafe = otherData ? otherData : {}
      Sentry.captureException(error, {
        level: FunLogLevel.ERROR,
        extra: { package: '@funkit/react', ...otherDataSafe },
      })
    } else {
      console.log('skipped_writing_to_sentry')
    }
  }

  /**
   * On receiving an debug log, write it to console.debug
   */
  private onDebug(title, data) {
    console.debug(title, data)
  }

  /**
   * On receiving an info log, write it to console.log
   */
  private onInfo(title, data) {
    // TODO: Consider writing to sentry logs too
    console.log(title, data)
  }

  /**
   * On receiving an error log, write it to console.error and sentry
   */
  private onError(title, error, data) {
    console.error(title, { error, data })
    this.writeErrorToSentry(error, { title, data })
  }

  /**========================
   * PUBLIC LOGGER FUNCTIONS
   *=========================*/

  /**
   * Writes an info log to console. Same as .info().
   */
  public log(title: string, data?: any) {
    this.onInfo(title, data)
  }

  /**
   * Writes an info log to console. Same as .log().
   */
  public info(title: string, data?: any) {
    this.onInfo(title, data)
  }

  /**
   * Writes a debug log to console
   */
  public debug(title: string, data?: any) {
    this.onDebug(title, data)
  }

  /**
   * Writes an error log to console and sentry
   * Just for error(), data should be an `object` type instead of `any` type
   */
  public error(title: string, error: any, data?: object) {
    this.onError(title, error, data)
  }

  /**
   * Sets the apiKey and re-inits sentry
   * @param config
   */
  public setFunApiKey(apiKey: string) {
    this.apiKey = apiKey
    const funLogEnv = this.getFunLogEnv()
    // Re-init sentry
    initSentry(funLogEnv)
  }
}

/**===============================
 * INITIALIZATION
 *================================*/

/**
 * Global & Singleton instance of FunLogger
 */
export const logger = new FunLogger()

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
      logger.error('error_logged', error, { source: 'regular function' })
      throw error
    }
  }
}

/**
 * Class decorator for adding error logging to class methods (equivalent to `withErrorLogging` HOF).
 *
 * This decorator adds error logging to all methods of a class. If an error occurs
 * within a method, it logs the error and then rethrows it.
 *
 * @param {Function} constructor - The constructor function of the class.
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
          logger.error('error_logged', error, { source: 'class function' })
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
//       logger.error('error_logged', error, { source: 'method function' })
//       throw error
//     }
//   }
//   return descriptor
// }
