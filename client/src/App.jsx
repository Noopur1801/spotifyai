import React from 'react';
import { BrowserRouter, Routes, Route, useParams, Navigate } from 'react-router-dom';
import LoungeDashboard from './pages/LoungeDashboard.jsx';
import AuthForm from './components/AuthForm.jsx';
import ProtectedRoute from './components/ProtectedRouter.jsx';

const LoungeRouteWrapper = () => {
  const { id } = useParams();
  return <LoungeDashboard loungeId={id} />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Auth Route */}
        <Route path="/auth" element={<AuthForm />} />

        {/* Protected Routes Wrapper */}
        <Route element={<ProtectedRoute />}>
          <Route path="/lounge/:id" element={<LoungeRouteWrapper />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;