import { useEffect, useRef } from 'react'

export function useTraceUpdate(props: any, name = 'useTraceUpdate') {
  const prev = useRef(props)
  useEffect(() => {
    const changedProps = Object.entries(props).reduce((ps: any, [k, v]) => {
      if (prev.current[k] !== v) {
        ps[k] = [prev.current[k], v]
      }
      return ps
    }, {})
    if (Object.keys(changedProps).length > 0) {
      console.log(`${name} | Changed props:`, changedProps)
    }
    prev.current = props
  })
}
