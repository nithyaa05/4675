import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Landing } from './pages/Landing'
import { UserProfilePage } from './pages/UserProfile'
import { ProjectProfilePage } from './pages/ProjectProfile'
import { ProjectSelectionPage } from './pages/ProjectSelection'
import { DashboardPage } from './pages/Dashboard'
import { PeersDirectoryPage } from './pages/PeersDirectory'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Landing />} />
        <Route path="profile" element={<UserProfilePage />} />
        <Route path="classmates" element={<PeersDirectoryPage />} />
        <Route path="project-profile" element={<ProjectProfilePage />} />
        <Route path="projects" element={<ProjectSelectionPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
