import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthPage from "./components/auth/AuthPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <h1>Welcome to the Dashboard!</h1>
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<h1>Home Page</h1>} />
      </Routes>
    </Router>
  );
}

export default App;
