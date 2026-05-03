import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import LandingPage from './pages/Landing/LandingPage';
import RegisterPage from './pages/Register/RegisterPage';
import LoginPage from './pages/Login/LoginPage';
import SignupPage from './pages/Signup/SignupPage';
// import VoterDashboard from './pages/Voter/VoterDashboard';
// import VoterProfile from './pages/Voter/VoterProfile';
// import VotingPage from './pages/Voter/VotingPage';
// import AdminDashboard from './pages/Admin/AdminDashboard';
// import PartyList from './pages/Admin/PartyList';
// import AddParty from './pages/Admin/AddParty';
// import CandidateList from './pages/Admin/CandidateList';
// import AddCandidate from './pages/Admin/AddCandidate';
// import VoterList from './pages/Admin/VoterList';
// import AnnouncementList from './pages/Admin/AnnouncementList';
// import AddAnnouncement from './pages/Admin/AddAnnouncement';
// import VotingSchedule from './pages/Admin/VotingSchedule';
// import ElectionHistory from './pages/Admin/ElectionHistory';
// import StatsGraph from './pages/Admin/StatsGraph';
// import CandidateDashboard from './pages/Candidate/CandidateDashboard';
// import CandidateProfile from './pages/Candidate/CandidateProfile';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Voter routes */}
        {/* <Route path="/voter/dashboard" element={
          <ProtectedRoute allowedRoles={['voter']}><VoterDashboard /></ProtectedRoute>
        }/>
        <Route path="/voter/profile" element={
          <ProtectedRoute allowedRoles={['voter']}><VoterProfile /></ProtectedRoute>
        }/>
        <Route path="/voter/vote" element={
          <ProtectedRoute allowedRoles={['voter']}><VotingPage /></ProtectedRoute>
        }/> */}

        {/* Admin routes */}
        {/* <Route path="/admin/dashboard" element={
          <ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>
        }/>
        <Route path="/admin/dashboard/party/list" element={
          <ProtectedRoute allowedRoles={['admin']}><PartyList /></ProtectedRoute>
        }/>
        <Route path="/admin/dashboard/party/add" element={
          <ProtectedRoute allowedRoles={['admin']}><AddParty /></ProtectedRoute>
        }/>
        <Route path="/admin/dashboard/candidates" element={
          <ProtectedRoute allowedRoles={['admin']}><CandidateList /></ProtectedRoute>
        }/>
        <Route path="/admin/dashboard/candidates/add" element={
          <ProtectedRoute allowedRoles={['admin']}><AddCandidate /></ProtectedRoute>
        }/>
        <Route path="/admin/dashboard/voters" element={
          <ProtectedRoute allowedRoles={['admin']}><VoterList /></ProtectedRoute>
        }/>
        <Route path="/admin/dashboard/announcements" element={
          <ProtectedRoute allowedRoles={['admin']}><AnnouncementList /></ProtectedRoute>
        }/>
        <Route path="/admin/dashboard/announcements/add" element={
          <ProtectedRoute allowedRoles={['admin']}><AddAnnouncement /></ProtectedRoute>
        }/>
        <Route path="/admin/dashboard/schedule" element={
          <ProtectedRoute allowedRoles={['admin']}><VotingSchedule /></ProtectedRoute>
        }/>
        <Route path="/admin/dashboard/history" element={
          <ProtectedRoute allowedRoles={['admin']}><ElectionHistory /></ProtectedRoute>
        }/>
        <Route path="/admin/dashboard/stats" element={
          <ProtectedRoute allowedRoles={['admin']}><StatsGraph /></ProtectedRoute>
        }/> */}

        {/* Candidate routes */}
        {/* <Route path="/candidate/dashboard" element={
          <ProtectedRoute allowedRoles={['candidate']}><CandidateDashboard /></ProtectedRoute>
        }/>
        <Route path="/candidate/profile" element={
          <ProtectedRoute allowedRoles={['candidate']}><CandidateProfile /></ProtectedRoute>
        }/> */}
      </Routes>
    </BrowserRouter>
  );
}