import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { UnreadProvider } from './contexts/UnreadContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import CreateRide from './pages/CreateRide';
import Profile from './pages/Profile';
import Chat from './pages/Chat';
import CustomerSupport from './pages/CustomerSupport';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <UnreadProvider>
            <div className="min-h-screen bg-gray-50">
              <Navbar />
              <main className="container mx-auto px-4 py-8">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route 
                    path="/create-ride" 
                    element={
                      <ProtectedRoute>
                        <CreateRide />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/profile" 
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/chat" 
                    element={
                      <ProtectedRoute>
                        <Chat />
                      </ProtectedRoute>
                    } 
                  />
                  <Route path="/support" element={<CustomerSupport />} />
                </Routes>
              </main>
            </div>
          </UnreadProvider>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
