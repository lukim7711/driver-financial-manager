import { BrowserRouter, Routes, Route } from 'react-router'
import { ToastProvider } from './components/Toast'
import { Home } from './pages/Home'
import { QuickInput } from './pages/QuickInput'
import { Debts } from './pages/Debts'
import { Report } from './pages/Report'
import { Settings } from './pages/Settings'
import { OcrUpload } from './pages/OcrUpload'
import { OrderImport } from './pages/OrderImport'
import { NotFound } from './pages/NotFound'

export function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/input" element={<QuickInput />} />
            <Route path="/ocr" element={<OcrUpload />} />
            <Route path="/order-import" element={<OrderImport />} />
            <Route path="/debts" element={<Debts />} />
            <Route path="/report" element={<Report />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </ToastProvider>
    </BrowserRouter>
  )
}
