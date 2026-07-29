import { Input } from "./components/Input"
import { Button } from "./components/Button"
import { Login } from "./pages/Login"
import { SignUp } from "./pages/SignUp"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import { ProtectedRoute } from "./components/ProtectedRoute"

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Protexted Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <div className="min-h-screen p-8 bg-gray-950 text-white">
                  <h1 className="text-2xl font-bold">Welcome to Raidor!</h1>
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
