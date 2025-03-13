import { useMemo } from "react"
import { useViewport } from "./useMediaView"

export const useContentView = () => {
  const {height} = useViewport()

  const maxHeight = useMemo(() => {
    return `${height - 396}px`
  }, [height])
    
  return {maxHeight}
}