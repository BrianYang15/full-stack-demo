import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import FilePage from './pages/FilePage'

import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./auth/ProtectedRoute";
import LoginPage from "./pages/LoginPage";

function App() {
  const [count, setCount] = useState(0)

  return (
    // <>
    //   <FilePage />
    // </>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <FilePage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
