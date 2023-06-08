export interface FunError {
    code: number
    message: string
    err?: Error | unknown
}

export interface ErrorStoreInterface {
    error: FunError | null
    errors: FunError[]
    setFunError: (error: FunError) => void
    resetFunError: () => void
    resetFunErrors: () => void
}

export const MissingConfigError: FunError = {
    code: 1,
    message: "Missing Fun Environment Config"
}
