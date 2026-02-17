import Scene from './components/Scene'
import UIOverlay from './components/UIOverlay'
import PolygonEditor from './components/PolygonEditor'
import { useStore } from './store/useStore'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { Analytics } from '@vercel/analytics/react'

function App() {
  const isPolygonEditorOpen = useStore((state) => state.isPolygonEditorOpen)

  return (
    <div className="w-full h-screen bg-black relative overflow-hidden">
      <Scene />
      <UIOverlay />
      {isPolygonEditorOpen && <PolygonEditor />}
      <SpeedInsights />
      <Analytics />
    </div>
  )
}

export default App
