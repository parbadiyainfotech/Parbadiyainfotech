/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { AdminLayout } from './components/layout/AdminLayout';
import { Home } from './pages/Home';
import { Services } from './pages/Services';
import { Dashboard } from './pages/admin/Dashboard';
import { ContentManagement } from './pages/admin/ContentManagement';
import { ManageServices } from './pages/admin/ManageServices';
import { TestimonialsManagement } from './pages/admin/TestimonialsManagement';
import { BusinessSettings } from './pages/admin/BusinessSettings';
import { AdminProfile } from './pages/admin/AdminProfile';
import { ServiceRequests } from './pages/admin/ServiceRequests';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<MainLayout><Home /></MainLayout>} />
        <Route path="/services" element={<MainLayout><Services /></MainLayout>} />

        {/* Admin Routes */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/dashboard" element={<AdminLayout><Dashboard /></AdminLayout>} />
        <Route path="/admin/content" element={<AdminLayout><ContentManagement /></AdminLayout>} />
        <Route path="/admin/services" element={<AdminLayout><ManageServices /></AdminLayout>} />
        <Route path="/admin/testimonials" element={<AdminLayout><TestimonialsManagement /></AdminLayout>} />
        <Route path="/admin/settings" element={<AdminLayout><BusinessSettings /></AdminLayout>} />
        <Route path="/admin/profile" element={<AdminLayout><AdminProfile /></AdminLayout>} />
        <Route path="/admin/requests" element={<AdminLayout><ServiceRequests /></AdminLayout>} />
      </Routes>
    </Router>
  );
}

