import { BrowserRouter, Routes, Route } from 'react-router'
import { Home } from './pages/Home'
import { QuickInput } from './pages/QuickInput'

export function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/input" element={<QuickInput />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
