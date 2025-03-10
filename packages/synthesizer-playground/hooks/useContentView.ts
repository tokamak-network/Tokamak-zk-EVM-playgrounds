import { useMemo } from "react"
import { useViewport } from "./useMediaView"

export const useContentView = () => {
  const {height} = useViewport()

  const maxHeight = useMemo(() => {
    return `${height - 450}px`
  }, [height])
    
  return {maxHeight}
}