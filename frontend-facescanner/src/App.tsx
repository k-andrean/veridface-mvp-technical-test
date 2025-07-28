import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Attendance from './Attendance';
import { MainLayout } from './components/layout/MainLayout';
import DashboardContent from './DashboardContent';
import UsersContent from './UsersContent';
import UserDetailContent from './UserDetailContent';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Attendance />} />
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<DashboardContent />} />
          <Route path="/users" element={<UsersContent />} />
          <Route path="/users/:id" element={<UserDetailContent />} /> 
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
