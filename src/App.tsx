import { Input } from "./components/Input"
import { Button } from "./components/Button"
import { Login } from "./pages/Login"
import { SignUp } from "./pages/SignUp"
import { Main } from "./pages/Main"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import { ProtectedRoute } from "./components/ProtectedRoute"
import { PublicRoute } from "./components/PublicRoute"
import { useEffect } from "react"
import { supabase } from "./lib/supabase"

function App() {
  useEffect(() => {
    async function fetchProfiles() {
      const { data, error } = await supabase.from('profiles').select('*');
      console.log('--- PROFILES TABLE CONTENT ---');
      console.log('Data:', data);
      console.log('Error:', error);
    }

    fetchProfiles();
  }, []);
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/signup" element={
            <PublicRoute>
              <SignUp />
            </PublicRoute>
          } />

          {/* Protexted Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                {/* <div className="min-h-screen p-8 bg-gray-950 text-white"> */}
                {/*   <h1 className="text-2xl font-bold">Welcome to Raidor!</h1> */}
                {/* </div> */}
                <Main>

                </Main>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
