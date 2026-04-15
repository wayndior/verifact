import React from 'react';
import { Navigate } from 'react-router-dom';

// This file is no longer used as a route — redirect to dashboard if accessed directly.
const HomePage = () => <Navigate to="/dashboard" replace />;

export default HomePage;
