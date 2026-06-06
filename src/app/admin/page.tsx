'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ orders: 0, revenue: 0, users: 0, items: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const { data: orders } = await supabase.from('orders').select('id');
      const { data: revenue } = await supabase.from('orders').select('total_price');
      const { data: users } = await supabase.from('users').select('id');
      const { data: items } = await supabase.from('menu_items').select('id');
      setStats({
        orders: orders?.length || 0,
        revenue: revenue?.reduce((sum, o) => sum + (o.total_price || 0), 0) || 0,
        users: users?.length || 0,
        items: items?.length || 0,
      });
    };
    fetchStats();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded shadow">Orders: {stats.orders}</div>
        <div className="bg-white p-4 rounded shadow">Revenue: ${stats.revenue}</div>
        <div className="bg-white p-4 rounded shadow">Users: {stats.users}</div>
        <div className="bg-white p-4 rounded shadow">Menu Items: {stats.items}</div>
      </div>
      <div className="flex gap-4">
        <Link href="/admin/menu" className="bg-orange-500 text-white px-4 py-2 rounded">Manage Menu</Link>
        <Link href="/admin/users" className="bg-orange-500 text-white px-4 py-2 rounded">Manage Users</Link>
        <Link href="/admin/reports" className="bg-orange-500 text-white px-4 py-2 rounded">Reports</Link>
      </div>
    </div>
  );
}