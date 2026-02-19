import { Routes, Route } from "react-router-dom"
import Login from './pages/Login'
import Signup from './pages/Signup'
import Matching from './pages/Matching'
import Profile from './pages/Profile'
import DatePlanner from './pages/DatePlanner'

function App() {
    return (
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/matching" element={<Matching />} />
            <Route path="/dates" element={<DatePlanner />} />
        </Routes>
    )
}

export default App