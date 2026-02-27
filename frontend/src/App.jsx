import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import AiAssistantPage from './pages/AiAssistantPage'
import DocumentsPage from './pages/DocumentsPage'
import DocumentNewPage from './pages/DocumentNewPage'
import AutomationsPage from './pages/AutomationsPage'
import AutomationNewPage from './pages/AutomationNewPage'
import AutomationDetailPage from './pages/AutomationDetailPage'

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/login" />
}

export default function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="ai-assistant" element={<AiAssistantPage />} />
          <Route path="documents" element={<DocumentsPage />} />
          <Route path="documents/new" element={<DocumentNewPage />} />
          <Route path="automations" element={<AutomationsPage />} />
          <Route path="automations/new" element={<AutomationNewPage />} />
          <Route path="automations/:id" element={<AutomationDetailPage />} />
        </Route>
      </Routes>
    </>
  )
}
