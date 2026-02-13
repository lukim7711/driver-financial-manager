import { BrowserRouter, Routes, Route } from 'react-router'
import Home from './pages/Home'
import QuickInput from './pages/QuickInput'
import Debts from './pages/Debts'
import Report from './pages/Report'
import Settings from './pages/Settings'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/input" element={<QuickInput />} />
          <Route path="/debts" element={<Debts />} />
          <Route path="/report" element={<Report />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
