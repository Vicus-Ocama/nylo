import { BrowserRouter, Routes, Route } from 'react-router-dom'
import PrivateRoute from './components/PrivateRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Write from './pages/Write'
import Article from './pages/Article'
import Profile from './pages/Profile'
import EditProfile from './pages/EditProfile'
import Search from './pages/Search'
import Admin from './pages/Admin'
import Notifications from './pages/Notifications'
import InstallPrompt from './components/InstallPrompt'
import Bookmarks from './pages/Bookmarks'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <BrowserRouter>
      <InstallPrompt />
      <Routes>

        {/* ── Public routes ── */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/article/:id" element={<Article />} />
        <Route path="/profile/:username" element={<Profile />} />
        <Route path="/search" element={<Search />} />

        {/* ── Protected routes ── */}
        <Route path="/dashboard" element={
          <PrivateRoute><Dashboard /></PrivateRoute>
        } />
        <Route path="/write" element={
          <PrivateRoute><Write /></PrivateRoute>
        } />
        <Route path="/edit-profile" element={
          <PrivateRoute><EditProfile /></PrivateRoute>
        } />
        <Route path="/notifications" element={
          <PrivateRoute><Notifications /></PrivateRoute>
        } />
        <Route path="/admin" element={
          <PrivateRoute><Admin /></PrivateRoute>
        } />
        <Route path="/bookmarks" element={
          <PrivateRoute><Bookmarks /></PrivateRoute>
        } />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

