import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { Home } from './pages/Home'
import { Docs } from './pages/Docs'
import { Cgu } from './pages/Cgu'
import { Cgv } from './pages/Cgv'
import { Contact } from './pages/Contact'
import { NotFound } from './pages/NotFound'
import { I18nContext, useI18nProvider } from './i18n'

function App() {
  const i18n = useI18nProvider()

  return (
    <I18nContext.Provider value={i18n}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="docs" element={<Docs />} />
          <Route path="cgu" element={<Cgu />} />
          <Route path="cgv"     element={<Cgv />} />
          <Route path="contact" element={<Contact />} />
          <Route path="*"       element={<NotFound />} />
        </Route>
      </Routes>
    </I18nContext.Provider>
  )
}

export default App
