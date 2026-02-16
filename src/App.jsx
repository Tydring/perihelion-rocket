import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { AuthProvider } from "./features/auth/AuthContext";
import { RequireAuth } from "./features/auth/components/RequireAuth";
import { LoginPage } from "./features/auth/components/LoginPage";
import { SchedulePage } from "./features/schedule/SchedulePage";
import { AdminDashboard } from "./features/admin/AdminDashboard";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<SchedulePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin" element={
              <RequireAuth>
                <AdminDashboard />
              </RequireAuth>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
