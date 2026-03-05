import { useEffect, useRef } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { Home } from './pages/Home'
import { Status } from './pages/Status'
import { Docs } from './pages/Docs'
import { DocArticle } from './pages/docs/DocArticle'
import { Blog } from './pages/Blog'
import { BlogPost } from './pages/blog/BlogPost'
import { DownloadPage } from './pages/Download'

const API_URL = import.meta.env.PROD
  ? 'https://api.aeryflux.com/api'
  : 'http://localhost:3000/api'

function App() {
  const location = useLocation()
  const visitTrackedRef = useRef(false)

  // Track visit once on app load
  useEffect(() => {
    if (!visitTrackedRef.current) {
      visitTrackedRef.current = true

      let sessionId = sessionStorage.getItem('lumos_session_id')
      if (!sessionId) {
        sessionId = `lumos_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
        sessionStorage.setItem('lumos_session_id', sessionId)
      }

      fetch(`${API_URL}/visits/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appId: 'lumos',
          path: location.pathname,
          sessionId,
        }),
      }).catch(() => {})
    }
  }, [])

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="status" element={<Status />} />
        <Route path="docs" element={<Docs />} />
        <Route path="docs/:slug" element={<DocArticle />} />
        <Route path="docs/:category/:slug" element={<DocArticle />} />
        <Route path="blog" element={<Blog />} />
        <Route path="blog/:id" element={<BlogPost />} />
        <Route path="download" element={<DownloadPage />} />
      </Route>
    </Routes>
  )
}

export default App
