import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { Home } from './pages/Home'
import { NotFound } from './pages/NotFound'
import { I18nContext, useI18nProvider } from './i18n'

function App() {
  const i18n = useI18nProvider()

  return (
    <I18nContext.Provider value={i18n}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </I18nContext.Provider>
  )
}

export default App
