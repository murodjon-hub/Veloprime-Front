import React from 'react';
import type { NextPage } from 'next';
import withAdminLayout from '../../libs/components/layout/LayoutAdmin';
import AdminDashboard from '../../libs/components/admin/AdminDashboard';

const AdminHome: NextPage = () => {
	return <AdminDashboard />;
};

export default withAdminLayout(AdminHome);
