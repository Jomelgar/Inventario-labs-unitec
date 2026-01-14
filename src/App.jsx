import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Inventories from "./pages/Inventories";
import Users from "./pages/Users";
import Profile from "./pages/Profile";
import Laboratories from "./pages/Laboratories";
import CreateInventory from "./pages/CreateInventory";
import UpdateInventory from "./pages/UpdateInventory";
import Dashboard from "./pages/Dashboard";
import { authUser,RedirectUser } from "./components/ProtectedRoute"; // tu función async
import { supabase } from "./supabaseClient";

// 🔹 Componente para rutas privadas
function PrivateRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = await authUser();
      setAuthenticated(isAuth);
      setLoading(false);
    };
    checkAuth();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-64">Cargando...</div>;

  return authenticated ? children : <Navigate to="/login" />;
}

// 🔹 App con rutas
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas privadas */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />

          {/* Usuarios solo admin */}
          <Route
            path="users"
            element={
              <RedirectUser/>
            }
          />

          <Route path="profile/:id?" element={<Profile />} />

          {/* Inventarios */}
          <Route path="inventories" element={<Inventories />} />
          <Route path="inventories/:id" element={<UpdateInventory />} />
          <Route path="inventories/new" element={<CreateInventory />} />

          {/* Laboratorios */}
          <Route path="laboratories" element={<Laboratories />} />
        </Route>

        {/* Login público */}
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
