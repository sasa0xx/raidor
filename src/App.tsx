import { Input } from "./components/Input"
import { Button } from "./components/Button"
import { Login } from "./pages/Login"
import { SignUp } from "./pages/SignUp"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
