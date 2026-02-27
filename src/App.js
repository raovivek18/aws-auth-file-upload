import { Authenticator, useAuthenticator } from "@aws-amplify/ui-react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import "./App.css";

// Custom components for the Authenticator
const components = {
  Header() {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2 style={{
          fontSize: '2rem',
          fontWeight: '800',
          background: 'linear-gradient(to right, var(--accent-blue), var(--accent-purple))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '0.5rem'
        }}>
          Cloud Portal
        </h2>
        <p style={{ color: 'var(--text-muted)' }}>Secure authentication powered by AWS</p>
      </div>
    );
  }
};

function App() {
  return (
    <div className="app-container">
      <Authenticator.Provider>
        <Authenticator components={components}>
          {({ signOut, user }) => (
            <BrowserRouter>
              <Routes>
                <Route
                  path="/"
                  element={<Dashboard user={user} signOut={signOut} />}
                />
                {/* Add other protected routes here */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          )}
        </Authenticator>
      </Authenticator.Provider>
    </div>
  );
}

export default App;
