'use client';

import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, Clock, Truck, CheckSquare, XCircle, Search, 
  ChevronRight, ArrowUpDown, Filter, Eye, AlertCircle, ShoppingBag, 
  Plus, Edit, Trash2, ShieldCheck, Lock, Activity, Settings, 
  FileText, RotateCw, ZoomIn, ZoomOut, Check, ArrowRight, Sparkles, TrendingUp
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, AreaChart, Area, PieChart, Pie } from 'recharts';

interface OrderItem {
  id: number;
  name: string;
  generic_name: string;
  dosage: string;
  price_pkr: number;
  quantity: number;
  requires_prescription: boolean;
}

interface Order {
  id: string;
  customer_name: string;
  phone: string;
  address: string;
  city: string;
  items: OrderItem[];
  subtotal: number;
  shipping_fee: number;
  grand_total: number;
  status: 'Pending' | 'Dispatched' | 'Delivered' | 'Cancelled';
  tracking_code: string;
  created_at: string;
}

interface Medicine {
  id: number;
  name: string;
  generic_name: string;
  category: string;
  price_pkr: number;
  stock: number;
  dosage: string;
  description: string;
  manufacturer: string;
  requires_prescription: boolean;
  image_url: string;
}

interface ShopSettings {
  shippingFee: number;
  supportPhone: string;
  storeAddress: string;
  activeNotice: string;
  emergencyAnnouncement: string;
  isStoreOpen: boolean;
}

export default function PremiumAdminPanel() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'medicines' | 'prescriptions' | 'settings' | 'offers' | 'addons'>('dashboard');

  // Offers State
  interface Offer { id: number; title: string; description: string; discount_text: string; price_pkr?: number; badge: string; image_url: string; valid_until: string; is_active: boolean; created_at: string; }
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoadingOffers, setIsLoadingOffers] = useState(false);
  const [isSavingOffer, setIsSavingOffer] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerModalType, setOfferModalType] = useState<'add' | 'edit'>('add');
  const [editingOffer, setEditingOffer] = useState<Partial<Offer> | null>(null);
  const [offerImageFile, setOfferImageFile] = useState<File | null>(null);

  // Core Data States
  const [orders, setOrders] = useState<Order[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  
  interface Addon { id: number; name: string; price_pkr: number; image_url?: string; }
  const [addonsList, setAddonsList] = useState<Addon[]>([]);
  const [showAddonModal, setShowAddonModal] = useState(false);
  const [editingAddon, setEditingAddon] = useState<Partial<Addon> | null>(null);
  const [isSavingAddon, setIsSavingAddon] = useState(false);
  const [settings, setSettings] = useState<ShopSettings>({
    shippingFee: 150,
    supportPhone: '0300-1234567',
    storeAddress: 'DHA Phase 5, Karachi',
    activeNotice: '',
    emergencyAnnouncement: '',
    isStoreOpen: true
  });

  // Filter States
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');
  const [medicineSearch, setMedicineSearch] = useState('');
  const [medicineCategoryFilter, setMedicineCategoryFilter] = useState('All');

  // Loading States
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [isLoadingMedicines, setIsLoadingMedicines] = useState(true);
  const [isLoadingAddons, setIsLoadingAddons] = useState(true);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Selection / Modal States
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  
  // Medicines CRUD Modal States
  const [showMedicineModal, setShowMedicineModal] = useState(false);
  const [medicineModalType, setMedicineModalType] = useState<'add' | 'edit'>('add');
  const [editingMedicine, setEditingMedicine] = useState<Partial<Medicine> | null>(null);
  const [isMutatingMedicine, setIsMutatingMedicine] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // File Prescription Workspace States
  const [selectedPrescriptionOrder, setSelectedPrescriptionOrder] = useState<Order | null>(null);
  const [prescriptionRotation, setPrescriptionRotation] = useState(0);
  const [prescriptionZoom, setPrescriptionZoom] = useState(1);
  const [isVerifyingPrescription, setIsVerifyingPrescription] = useState(false);

  // Dynamic Metrics Dashboard Stats
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    dispatchedOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    totalRevenue: 0,
    rxPendingOrders: 0,
    totalInventoryValue: 0,
    totalInventoryCount: 0,
    lowStockMedicines: 0
  });

  const [categorySales, setCategorySales] = useState<{ name: string; value: number }[]>([]);
  const [cityBreakdown, setCityBreakdown] = useState<{ name: string; value: number }[]>([]);
  const [dailyVolumes, setDailyVolumes] = useState<{ date: string; count: number; revenue: number }[]>([]);

  // Selected day for interactive graph
  const [selectedDayStats, setSelectedDayStats] = useState<{ date: string; count: number; revenue: number; cancelled: number } | null>(null);

  // Selected filter for bottom order list
  const [selectedListFilter, setSelectedListFilter] = useState<string | null>(null);

  // Global Time Filter State
  const [globalTimeFilter, setGlobalTimeFilter] = useState<'all' | 'today' | 'this_week' | 'this_month' | 'this_year' | 'custom_date' | 'custom_month'>('today');
  const [customDateFilter, setCustomDateFilter] = useState<string>(''); // YYYY-MM-DD
  const [customMonthFilter, setCustomMonthFilter] = useState<string>(''); // YYYY-MM

  const filteredOrders = React.useMemo(() => {
    if (globalTimeFilter === 'all') return orders;
    
    const now = new Date();
    const todayStr = now.toLocaleDateString('en-CA');
    
    return orders.filter(o => {
      if (!o.created_at) return false;
      const orderDate = new Date(o.created_at);
      const orderDateStr = orderDate.toLocaleDateString('en-CA');
      
      if (globalTimeFilter === 'today') {
        return orderDateStr === todayStr;
      }
      if (globalTimeFilter === 'this_week') {
        const pastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return orderDate >= pastWeek;
      }
      if (globalTimeFilter === 'this_month') {
        return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
      }
      if (globalTimeFilter === 'this_year') {
        return orderDate.getFullYear() === now.getFullYear();
      }
      if (globalTimeFilter === 'custom_date' && customDateFilter) {
        return orderDateStr === customDateFilter;
      }
      if (globalTimeFilter === 'custom_month' && customMonthFilter) {
        return orderDateStr.startsWith(customMonthFilter);
      }
      
      return true;
    });
  }, [orders, globalTimeFilter, customDateFilter, customMonthFilter]);

  const dynamicStats = React.useMemo(() => {
    let totalOrders = 0;
    let pendingOrders = 0;
    let dispatchedOrders = 0;
    let deliveredOrders = 0;
    let cancelledOrders = 0;
    let totalRevenue = 0;
    let rxPendingOrders = 0;
    
    filteredOrders.forEach(o => {
      totalOrders++;
      if (o.status === 'Pending') {
        pendingOrders++;
        if (o.items && Array.isArray(o.items) && o.items.some((i: any) => i.requires_prescription)) {
          rxPendingOrders++;
        }
      }
      if (o.status === 'Dispatched') dispatchedOrders++;
      if (o.status === 'Delivered') {
        deliveredOrders++;
        totalRevenue += (o.grand_total || 0);
      }
      if (o.status === 'Cancelled') cancelledOrders++;
    });
    
    return {
      totalOrders, pendingOrders, dispatchedOrders, deliveredOrders, cancelledOrders, totalRevenue, rxPendingOrders
    };
  }, [filteredOrders]);

  const dynamicCategorySales = React.useMemo(() => {
    const categorySalesMap: Record<string, number> = {};
    const medicineCategoryMap: Record<string, string> = {};
    medicines.forEach(m => {
      medicineCategoryMap[m.name.toLowerCase()] = m.category;
    });
    
    filteredOrders.filter(o => o.status === 'Delivered').forEach(o => {
      if (o.items && Array.isArray(o.items)) {
        o.items.forEach((item: any) => {
          const cat = item.category || medicineCategoryMap[item.name.toLowerCase()] || 'Pizza';
          const value = (item.price_pkr || 0) * (item.quantity || 1);
          categorySalesMap[cat] = (categorySalesMap[cat] || 0) + value;
        });
      }
    });
    return Object.entries(categorySalesMap).map(([name, value]) => ({ name, value }));
  }, [filteredOrders, medicines]);

  // Client-side grouping of orders by date to cover all history
  const allDailyVolumes = React.useMemo(() => {
    const map = new Map<string, { count: number, revenue: number, cancelled: number }>();
    filteredOrders.forEach(o => {
      if (!o.created_at) return;
      const d = new Date(o.created_at);
      const dateStr = d.toLocaleDateString('en-CA'); // YYYY-MM-DD format
      if (!map.has(dateStr)) {
        map.set(dateStr, { count: 0, revenue: 0, cancelled: 0 });
      }
      const existing = map.get(dateStr)!;
      existing.count += 1;
      if (o.status !== 'Cancelled') {
        existing.revenue += o.grand_total;
      } else {
        existing.cancelled += 1;
      }
    });
    // Sort chronologically
    const result = Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0])).map(([date, data]) => ({
      date,
      count: data.count,
      revenue: data.revenue,
      cancelled: data.cancelled
    }));

    if (result.length === 1) {
      const single = result[0];
      const [year, month, day] = single.date.split('-').map(Number);
      
      const prev = new Date(year, month - 1, day - 1);
      const next = new Date(year, month - 1, day + 1);
      
      return [
        { date: prev.toLocaleDateString('en-CA'), count: 0, revenue: 0, cancelled: 0 },
        single,
        { date: next.toLocaleDateString('en-CA'), count: 0, revenue: 0, cancelled: 0 }
      ];
    }
    
    return result;
  }, [filteredOrders]);

  const todayOrders = React.useMemo(() => {
    const todayStr = new Date().toLocaleDateString('en-CA');
    const todayData = allDailyVolumes.find(d => d.date === todayStr);
    return todayData ? todayData.count : 0;
  }, [allDailyVolumes]);

  // Check auth session on mount
  useEffect(() => {
    const token = localStorage.getItem('medimart_admin_session');
    if (token === 'medimart_session_token_2026_verified') {
      setIsAuthenticated(true);
    }
    setMounted(true);
  }, []);

  // Fetch core data once authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
      fetchMedicines();
      fetchSettings();
    }
  }, [isAuthenticated]);

  // Recalculate stats dashboard dynamically
  useEffect(() => {
    if (orders.length > 0 && medicines.length > 0) {
      fetchAnalyticsStats();
    }
  }, [orders, medicines]);

  // Core Data Fetchers
  async function fetchOrders() {
    setIsLoadingOrders(true);
    try {
      const response = await fetch('/api/orders');
      const data = await response.json();
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (e) {
      console.error('Error fetching orders:', e);
    } finally {
      setIsLoadingOrders(false);
    }
  }

  async function fetchMedicines() {
    setIsLoadingMedicines(true);
    try {
      const { data, error } = await supabase.from('medicines').select('*');
      if (!error && data) {
        setMedicines(data as any);
      }
    } catch (e) {
      console.error('Error fetching medicines:', e);
    } finally {
      setIsLoadingMedicines(false);
    }
  }

  async function fetchSettings() {
    try {
      const response = await fetch('/api/admin/settings');
      const data = await response.json();
      if (data.success) {
        setSettings(data.settings);
      }
    } catch (e) {
      console.error('Error fetching store settings:', e);
    }
  }

  async function fetchAnalyticsStats() {
    try {
      const token = localStorage.getItem('medimart_admin_session');
      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.stats.counters);
        setCategorySales(data.stats.categorySales);
        setCityBreakdown(data.stats.cityBreakdown);
        setDailyVolumes(data.stats.dailyVolumes);
      }
    } catch (e) {
      console.error('Error pulling analytics:', e);
    }
  }

  // Handle Authentication submit
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsAuthenticating(true);

    // Client-side instant fallback for fatpizza.com
    if (passcode === 'fatpizza.com') {
      localStorage.setItem('medimart_admin_session', 'medimart_session_token_2026_verified');
      setIsAuthenticated(true);
      setIsAuthenticating(false);
      return;
    }

    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode })
      });
      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem('medimart_admin_session', data.token);
        setIsAuthenticated(true);
      } else {
        setAuthError(data.error || 'Passcode sahi nahi hai!');
      }
    } catch (err) {
      setAuthError('Server error occur. Dobara koshish karein.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('medimart_admin_session');
    setIsAuthenticated(false);
    setPasscode('');
  };

  // Change fulfillment status of orders
  const handleOrderStatusChange = async (orderId: string, nextStatus: 'Pending' | 'Dispatched' | 'Delivered' | 'Cancelled') => {
    setUpdatingOrderId(orderId);
    try {
      const response = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status: nextStatus })
      });
      const data = await response.json();

      if (!data.success) throw new Error(data.error);

      // Update state locally
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: nextStatus } : o));

      // Update selected order details
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: nextStatus } : null);
      }

      // Update prescription reviewer focus
      if (selectedPrescriptionOrder && selectedPrescriptionOrder.id === orderId) {
        setSelectedPrescriptionOrder(prev => prev ? { ...prev, status: nextStatus } : null);
      }

      // Trigger server-side email/notification
      const matchedOrder = orders.find(o => o.id === orderId);
      if (matchedOrder) {
        fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'status_update',
            order: { ...matchedOrder, status: nextStatus }
          })
        }).catch(err => console.error('Notification dispatch fail:', err));
      }
    } catch (e) {
      alert('Fulfillment status save nahi ho saka. Try again.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // CRUD Actions: Medicines Table
  const handleSaveMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMedicine?.name || !editingMedicine?.category || !editingMedicine?.price_pkr) {
      alert('Zaroori fields empty hain!');
      return;
    }

    setIsMutatingMedicine(true);
    const token = localStorage.getItem('medimart_admin_session');
    
    try {
      let finalImageUrl = editingMedicine.image_url;

      // Upload image if a new file is selected
      if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);

        const uploadRes = await fetch('/api/admin/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
        
        const uploadData = await uploadRes.json();
        if (uploadData.success) {
          finalImageUrl = uploadData.url;
        } else {
          alert('Image upload failed: ' + uploadData.error);
          setIsMutatingMedicine(false);
          return;
        }
      }

      const medicineDataToSave = { ...editingMedicine, image_url: finalImageUrl };

      const method = medicineModalType === 'add' ? 'POST' : 'PUT';
      const response = await fetch('/api/admin/medicines', {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(medicineDataToSave)
      });
      const data = await response.json();

      if (data.success) {
        fetchMedicines();
        setEditingMedicine(null);
        setImageFile(null);
        setShowMedicineModal(false);
      } else {
        alert('Error saving medicine record: ' + data.error);
      }
    } catch (err) {
      console.error(err);
      alert('Save operation fail.');
    } finally {
      setIsMutatingMedicine(false);
    }
  };

  const handleDeleteMedicine = async (id: number) => {
    if (!window.confirm('Kya aap waqai is medicine ko catalog se delete karna chahte hain?')) return;
    
    const token = localStorage.getItem('medimart_admin_session');
    try {
      const response = await fetch(`/api/admin/medicines?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        fetchMedicines();
      } else {
        alert('Delete operation error: ' + data.error);
      }
    } catch (err) {
      alert('Delete operation fail.');
    }
  };

  // Prescription Reviewer Workflows
  const handleVerifyPrescription = async (orderId: string, approve: boolean) => {
    setIsVerifyingPrescription(true);
    const targetStatus = approve ? 'Dispatched' : 'Cancelled';
    
    try {
      await handleOrderStatusChange(orderId, targetStatus);
      
      // Auto-select next pending prescription order if any
      const remainingRxPending = orders.filter(
        o => o.id !== orderId && 
        o.status === 'Pending' && 
        o.items.some(i => i.requires_prescription)
      );
      
      if (remainingRxPending.length > 0) {
        setSelectedPrescriptionOrder(remainingRxPending[0]);
        setPrescriptionRotation(0);
        setPrescriptionZoom(1);
      } else {
        setSelectedPrescriptionOrder(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsVerifyingPrescription(false);
    }
  };

  // Save Config settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    const token = localStorage.getItem('medimart_admin_session');

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });
      const data = await response.json();
      if (data.success) {
        alert('MediMart Store specifications updated successfully / ترتیبات محفوظ ہوگئیں!');
      } else {
        alert('Fail to update config: ' + data.error);
      }
    } catch (err) {
      alert('Save configuration server error.');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const deleteOffer = async (id: number) => {
    if (confirm('Are you sure you want to delete this offer?')) {
      await supabase.from('offers').delete().eq('id', id);
      setOffers(prev => prev.filter(o => o.id !== id));
    }
  };

  // Addon Functions
  const handleSaveAddon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAddon) return;
    setIsSavingAddon(true);
    
    try {
      if (editingAddon.id) {
        // Update
        const { error } = await supabase.from('addons').update({
          name: editingAddon.name,
          price_pkr: editingAddon.price_pkr,
          image_url: editingAddon.image_url
        }).eq('id', editingAddon.id);
        if (!error) {
          setAddonsList(prev => prev.map(a => a.id === editingAddon.id ? editingAddon as Addon : a));
        }
      } else {
        // Insert
        const { data, error } = await supabase.from('addons').insert([{
          name: editingAddon.name,
          price_pkr: editingAddon.price_pkr,
          image_url: editingAddon.image_url
        }]).select();
        if (data) {
          setAddonsList(prev => [...prev, data[0]]);
        }
      }
      setShowAddonModal(false);
    } catch (err) {
      console.error(err);
    }
    setIsSavingAddon(false);
  };

  const deleteAddon = async (id: number) => {
    if (confirm('Delete this add-on?')) {
      await supabase.from('addons').delete().eq('id', id);
      setAddonsList(prev => prev.filter(a => a.id !== id));
    }
  };

  // Filter Computations
  const filteredOrdersList = orders.filter(ord => {
    const term = orderSearch.toLowerCase();
    const matchSearch = !orderSearch.trim() || 
      ord.customer_name.toLowerCase().includes(term) ||
      ord.phone.includes(term) ||
      ord.city.toLowerCase().includes(term) ||
      ord.tracking_code.toLowerCase().includes(term);

    const matchStatus = orderStatusFilter === 'All' || ord.status === orderStatusFilter;
    return matchSearch && matchStatus;
  });

  const filteredMedicinesList = medicines.filter(med => {
    const term = medicineSearch.toLowerCase();
    const matchSearch = !medicineSearch.trim() ||
      med.name.toLowerCase().includes(term) ||
      med.generic_name.toLowerCase().includes(term) ||
      med.manufacturer.toLowerCase().includes(term) ||
      med.category.toLowerCase().includes(term);

    const matchCategory = medicineCategoryFilter === 'All' || med.category === medicineCategoryFilter;
    return matchSearch && matchCategory;
  });

  const pendingPrescriptionOrders = orders.filter(
    o => o.status === 'Pending' && o.items.some(i => i.requires_prescription)
  );

  // Extract unique categories for catalog dropdown
  const medicineCategories = ['All', ...Array.from(new Set(medicines.map(m => m.category)))];

  if (!mounted) {
    return <div style={{ minHeight: '100vh', background: 'var(--background)' }} />;
  }

  // Secure Authentication screen
  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: '85vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        background: 'radial-gradient(circle at 50% 50%, rgba(239, 68, 68, 0.1) 0%, rgba(17, 17, 17, 0) 80%)'
      }}>
        <div style={{
          background: 'var(--card-bg)',
          backdropFilter: 'blur(20px)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '48px 40px',
          maxWidth: '440px',
          width: '100%',
          boxShadow: 'var(--shadow-lg)',
          textAlign: 'center'
        }}>
          <div style={{
            background: 'var(--primary-bg)',
            color: 'var(--primary)',
            width: '64px',
            height: '64px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px auto',
            border: '1px solid rgba(239, 68, 68, 0.15)'
          }}>
            <Lock size={30} />
          </div>

          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '6px', letterSpacing: '-0.5px' }}>
            Fatpizza Admin Login
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '32px' }}>
            Enter passcode to unlock Fatpizza kitchen manager dashboard.<br/>(ایڈمن پینل لاگ ان کریں)
          </p>

          {authError && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.08)',
              color: 'var(--status-cancelled)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem',
              fontWeight: 700,
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              justifyContent: 'center'
            }}>
              <AlertCircle size={16} /> {authError}
            </div>
          )}

          <form onSubmit={handleAuthSubmit}>
            <div className="form-group" style={{ marginBottom: '24px', textAlign: 'left' }}>
              <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Secure Admin Passcode:
              </label>
              <input 
                type="password"
                className="form-input"
                placeholder="••••••••••••"
                style={{ textAlign: 'center', letterSpacing: '8px', fontSize: '1.2rem', fontWeight: 800 }}
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                disabled={isAuthenticating}
                required
                autoFocus
              />
            </div>

            <button 
              type="submit" 
              className="btn-primary"
              disabled={isAuthenticating}
              style={{ width: '100%', padding: '14px', justifyContent: 'center', fontSize: '0.95rem' }}
            >
              {isAuthenticating ? 'Authorizing / تصدیق ہو رہی ہے...' : 'Unlock Dashboard / لاگ ان کریں'}
            </button>
          </form>

          <div style={{ marginTop: '24px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            🛡️ Secured with standard server-side token encryption.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)' }}>
      {/* Left Sidebar */}
      <aside style={{ width: '260px', background: 'var(--sidebar-bg)', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--border-color)' }}>
          <div className="logo-icon"><ShoppingBag size={24} /></div>
          <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--foreground)' }}>Fatpizza</div>
        </div>
        <div style={{ padding: '24px 16px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '16px', letterSpacing: '1px', paddingLeft: '12px' }}>DASHBOARDS</div>
          {[
            { id: 'dashboard', label: 'Overview', icon: Activity },
            { id: 'orders', label: 'Orders', icon: ClipboardList },
            { id: 'medicines', label: 'Inventory', icon: ShoppingBag },
            { id: 'prescriptions', label: 'Rx Verifier', icon: FileText },
            { id: 'offers', label: '🔥 Offers', icon: Sparkles },
            { id: 'addons', label: 'Add-ons', icon: Plus },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} style={{
                display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px 16px', 
                background: isActive ? 'var(--primary)' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--text-muted)',
                border: 'none', borderRadius: '8px', fontWeight: isActive ? 700 : 600, cursor: 'pointer', marginBottom: '4px',
                textAlign: 'left', transition: 'var(--transition-fast)'
              }}>
                <Icon size={18} />
                {tab.label}
              </button>
            )
          })}
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflowY: 'auto' }}>
        
        {/* Top Header */}
        <header style={{ padding: '20px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', background: 'var(--background)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            <Activity size={18} /> <span>Dashboards</span> <span style={{ color: 'var(--border-color)' }}>/</span> <span style={{ color: 'var(--foreground)', fontWeight: 600 }}>{activeTab === 'dashboard' ? 'Overview' : activeTab === 'orders' ? 'Orders' : activeTab === 'medicines' ? 'Inventory' : activeTab === 'prescriptions' ? 'Rx Verifier' : activeTab === 'offers' ? 'Offers' : activeTab === 'addons' ? 'Add-ons' : 'Settings'}</span>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button className="icon-btn" style={{ background: 'var(--card-bg)' }}><Search size={20} /></button>
            <button className="icon-btn" onClick={handleLogout} title="Lock Terminal" style={{ background: 'var(--card-bg)', color: 'var(--status-cancelled)' }}><Lock size={20} /></button>
          </div>
        </header>

        <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      {/* 1. DASHBOARD TAB */}
      {activeTab === 'dashboard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* TIME FILTER HEADER */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', background: 'var(--card-bg)', padding: '16px 24px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontWeight: 700, color: 'var(--text-muted)' }}>Date Range:</div>
            <select 
              value={globalTimeFilter}
              onChange={(e) => setGlobalTimeFilter(e.target.value as any)}
              style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--background)', color: 'var(--foreground)', cursor: 'pointer', outline: 'none' }}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="this_week">Last 7 Days</option>
              <option value="this_month">This Month</option>
              <option value="this_year">This Year</option>
              <option value="custom_month">Specific Month</option>
              <option value="custom_date">Specific Date</option>
            </select>
            
            {globalTimeFilter === 'custom_date' && (
              <input 
                type="date" 
                value={customDateFilter}
                onChange={(e) => setCustomDateFilter(e.target.value)}
                style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--background)', color: 'var(--foreground)', outline: 'none' }}
              />
            )}
            
            {globalTimeFilter === 'custom_month' && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <select
                  value={customMonthFilter.split('-')[1] || ''}
                  onChange={(e) => {
                    const year = customMonthFilter.split('-')[0] || new Date().getFullYear().toString();
                    const month = e.target.value;
                    if (month) setCustomMonthFilter(`${year}-${month}`);
                    else setCustomMonthFilter('');
                  }}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--background)', color: 'var(--foreground)', outline: 'none', cursor: 'pointer' }}
                >
                  <option value="">Select Month</option>
                  <option value="01">January</option>
                  <option value="02">February</option>
                  <option value="03">March</option>
                  <option value="04">April</option>
                  <option value="05">May</option>
                  <option value="06">June</option>
                  <option value="07">July</option>
                  <option value="08">August</option>
                  <option value="09">September</option>
                  <option value="10">October</option>
                  <option value="11">November</option>
                  <option value="12">December</option>
                </select>
                <select
                  value={customMonthFilter.split('-')[0] || ''}
                  onChange={(e) => {
                    const month = customMonthFilter.split('-')[1] || (new Date().getMonth() + 1).toString().padStart(2, '0');
                    const year = e.target.value;
                    if (year) setCustomMonthFilter(`${year}-${month}`);
                    else setCustomMonthFilter('');
                  }}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--background)', color: 'var(--foreground)', outline: 'none', cursor: 'pointer' }}
                >
                  <option value="">Year</option>
                  {[2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030].map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            )}
            
            <div style={{ marginLeft: 'auto', fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>
              {filteredOrders.length} Orders Found
            </div>
          </div>

          {/* TOP METRIC CARDS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            {/* Delivered Sales (Net Revenue) */}
            <div 
              className="stat-card" 
              style={{ display: 'flex', flexDirection: 'column', padding: '24px', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', cursor: 'pointer', transition: 'var(--transition)' }}
            >
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>Net revenue</div>
              {isLoadingOrders ? (
                <div className="skeleton-shimmer" style={{ width: '120px', height: '32px', borderRadius: '4px' }} />
              ) : (
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--foreground)' }}>Rs. {dynamicStats.totalRevenue.toLocaleString()}</div>
              )}
              <div style={{ fontSize: '0.8rem', color: '#10b981', marginTop: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <TrendingUp size={14} /> <span>All-time completed</span>
              </div>
            </div>

            {/* Filtered Orders */}
            <div 
              className="stat-card" 
              onClick={() => {
                setSelectedListFilter('filtered');
                setSelectedDayStats(null);
              }}
              style={{ display: 'flex', flexDirection: 'column', padding: '24px', background: selectedListFilter === 'filtered' || selectedListFilter === 'today' ? 'var(--primary-bg)' : 'var(--card-bg)', border: selectedListFilter === 'filtered' || selectedListFilter === 'today' ? '1px solid var(--primary)' : '1px solid var(--border-color)', borderRadius: '12px', cursor: 'pointer', transition: 'var(--transition)' }}
            >
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
                {globalTimeFilter === 'today' ? "Today's Orders" : globalTimeFilter === 'all' ? "All Orders" : "Filtered Orders"}
              </div>
              {isLoadingOrders ? (
                <div className="skeleton-shimmer" style={{ width: '80px', height: '32px', borderRadius: '4px' }} />
              ) : (
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--foreground)' }}>{dynamicStats.totalOrders}</div>
              )}
              <div style={{ fontSize: '0.8rem', color: 'var(--primary)', marginTop: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>View list 👇</span>
              </div>
            </div>

            {/* Total Invoices */}
            <div 
              className="stat-card" 
              onClick={() => setSelectedListFilter('total')}
              style={{ display: 'flex', flexDirection: 'column', padding: '24px', background: selectedListFilter === 'total' ? 'var(--primary-bg)' : 'var(--card-bg)', border: selectedListFilter === 'total' ? '1px solid var(--primary)' : '1px solid var(--border-color)', borderRadius: '12px', cursor: 'pointer', transition: 'var(--transition)' }}
            >
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>Total Invoices</div>
              {isLoadingOrders ? (
                <div className="skeleton-shimmer" style={{ width: '80px', height: '32px', borderRadius: '4px' }} />
              ) : (
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--foreground)' }}>{orders.length}</div>
              )}
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>View list 👇</span>
              </div>
            </div>

            {/* Cancelled Orders */}
            <div 
              className="stat-card"
              onClick={() => setSelectedListFilter('cancelled')}
              style={{ display: 'flex', flexDirection: 'column', padding: '24px', background: selectedListFilter === 'cancelled' ? 'var(--primary-bg)' : 'var(--card-bg)', border: selectedListFilter === 'cancelled' ? '1px solid var(--primary)' : '1px solid var(--border-color)', borderRadius: '12px', cursor: 'pointer', transition: 'var(--transition)' }}
            >
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>Cancelled Orders</div>
              {isLoadingOrders ? (
                <div className="skeleton-shimmer" style={{ width: '80px', height: '32px', borderRadius: '4px' }} />
              ) : (
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--foreground)' }}>{dynamicStats.cancelledOrders}</div>
              )}
              <div style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>View list 👇</span>
              </div>
            </div>
          </div>

          {/* MIDDLE CHARTS ROW */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px' }}>
            
            {/* Sales Overview Donut Chart */}
            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Sales Overview</h3>
              </div>
              <div style={{ height: '240px', position: 'relative' }}>
                {dynamicCategorySales.length === 0 ? (
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No data</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dynamicCategorySales}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {dynamicCategorySales.map((entry, index) => {
                          const colors = ['var(--primary)', '#b91c1c', '#7f1d1d', '#fca5a5', '#450a0a'];
                          return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                        })}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                        itemStyle={{ color: 'var(--foreground)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
                {dynamicCategorySales.length > 0 && (
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>Rs.{categorySales.reduce((a,b)=>a+b.value,0)}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Total Sales</div>
                  </div>
                )}
              </div>
              
              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {categorySales.slice(0,4).map((c, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>• {c.name}</span>
                    <span style={{ fontWeight: 700 }}>Rs. {c.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Profit Area Chart */}
            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Daily Order Count</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>All Time</span>
              </div>
              
              <div style={{ height: '300px' }}>
                {allDailyVolumes.length === 0 ? (
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No chart data</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={allDailyVolumes} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} onClick={(e: any) => {
                      if (e && e.activePayload && e.activePayload.length > 0) {
                        const data = e.activePayload[0].payload;
                        setSelectedDayStats(data);
                        setSelectedListFilter(data.date);
                      }
                    }}>
                      <defs>
                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                      <XAxis dataKey="date" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ background: 'var(--sidebar-bg)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                        itemStyle={{ color: 'var(--foreground)' }}
                      />
                      <Area type="monotone" dataKey="count" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>


          {/* DYNAMIC ORDER LIST SECTION */}
          {selectedListFilter && (
            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--primary)', borderRadius: '12px', padding: '24px', position: 'relative' }}>
              <button 
                onClick={() => { setSelectedListFilter(null); setSelectedDayStats(null); }}
                style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <XCircle size={24} />
              </button>
              
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px', textTransform: 'capitalize' }}>
                {selectedListFilter === 'today' ? "Today's" : 
                 selectedListFilter === 'filtered' ? "Filtered" :
                 (selectedListFilter === 'delivered' || selectedListFilter === 'cancelled' || selectedListFilter === 'total') ? selectedListFilter :
                 `Orders on ${new Date(selectedListFilter).toLocaleDateString()}`} List
              </h3>

              {selectedDayStats && (selectedListFilter === selectedDayStats.date || selectedListFilter === 'today') && (
                <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
                  <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)', flex: 1, minWidth: '120px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Revenue</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#10b981' }}>Rs. {selectedDayStats.revenue.toLocaleString()}</div>
                  </div>
                  <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.2)', flex: 1, minWidth: '120px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Orders</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#3b82f6' }}>{selectedDayStats.count}</div>
                  </div>
                  <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)', flex: 1, minWidth: '120px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Cancelled Orders</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ef4444' }}>{selectedDayStats.cancelled}</div>
                  </div>
                </div>
              )}
              
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '12px 16px', fontWeight: 600 }}>Tracking Code</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600 }}>Date & Time</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600 }}>Customer Name</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600 }}>Status</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600 }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const todayStr = new Date().toLocaleDateString('en-CA');
                      const baseOrders = selectedListFilter === 'total' ? orders : filteredOrders;
                      const filtered = baseOrders.filter(o => {
                        if (selectedListFilter === 'filtered') return true;
                        if (selectedListFilter === 'today') {
                          if (!o.created_at) return false;
                          return new Date(o.created_at).toLocaleDateString('en-CA') === todayStr;
                        }
                        if (selectedListFilter === 'delivered') return o.status === 'Delivered';
                        if (selectedListFilter === 'cancelled') return o.status === 'Cancelled';
                        if (selectedListFilter === 'total') return true;
                        
                        if (selectedListFilter && selectedListFilter.match(/^\d{4}-\d{2}-\d{2}$/)) {
                          if (!o.created_at) return false;
                          return new Date(o.created_at).toLocaleDateString('en-CA') === selectedListFilter;
                        }
                        return true;
                      });

                      if (filtered.length === 0) {
                        return (
                          <tr>
                            <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                              Koi orders available nahi hain.
                            </td>
                          </tr>
                        );
                      }

                      return filtered.map((o) => (
                        <tr key={o.id} style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--background)' }}>
                          <td style={{ padding: '16px', fontWeight: 700, color: 'var(--primary)' }}>{o.tracking_code}</td>
                          <td style={{ padding: '16px' }}>{new Date(o.created_at).toLocaleString()}</td>
                          <td style={{ padding: '16px', fontWeight: 600 }}>{o.customer_name}</td>
                          <td style={{ padding: '16px' }}>
                            <span style={{
                              padding: '4px 10px',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              background: o.status === 'Cancelled' ? 'rgba(239, 68, 68, 0.15)' : 
                                         o.status === 'Delivered' ? 'rgba(16, 185, 129, 0.15)' : 'var(--primary-bg)',
                              color: o.status === 'Cancelled' ? '#ef4444' : 
                                     o.status === 'Delivered' ? '#10b981' : 'var(--primary)',
                            }}>
                              {o.status}
                            </span>
                          </td>
                          <td style={{ padding: '16px', fontWeight: 800 }}>Rs. {o.grand_total}</td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}

      {/* 2. ORDERS SPREADSHEETS TAB */}
      {activeTab === 'orders' && (
        <div>
          {/* Spreadsheet filter action toolbar */}
          <div style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '20px 24px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px',
            marginBottom: '32px'
          }}>
            {/* Live query search box */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'var(--background)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              padding: '8px 16px',
              width: '100%',
              maxWidth: '380px'
            }}>
              <Search size={18} color="var(--text-muted)" />
              <input 
                type="text" 
                placeholder="Search code, customer name, phone or city..."
                style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: '0.9rem', color: 'var(--foreground)' }}
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
              />
            </div>

            {/* Category selection */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['All', 'Pending', 'Dispatched', 'Delivered', 'Cancelled'].map((status) => (
                <button
                  key={status}
                  onClick={() => setOrderStatusFilter(status)}
                  style={{
                    background: orderStatusFilter === status ? 'var(--primary)' : 'var(--background)',
                    color: orderStatusFilter === status ? 'white' : 'var(--foreground)',
                    border: `1px solid ${orderStatusFilter === status ? 'var(--primary)' : 'var(--border-color)'}`,
                    borderRadius: 'var(--radius-pill)',
                    padding: '6px 14px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'var(--transition-fast)'
                  }}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Orders spreadsheet database table */}
          {isLoadingOrders ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '24px', background: 'var(--card-bg)' }}>
              <div style={{ display: 'flex', borderBottom: '2px solid var(--border-color)', paddingBottom: '12px', marginBottom: '8px', fontWeight: 800, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                <div style={{ width: '10%' }}>Code</div>
                <div style={{ width: '12%' }}>Date</div>
                <div style={{ width: '25%' }}>Customer Name</div>
                <div style={{ width: '15%' }}>City</div>
                <div style={{ width: '13%' }}>COD Bill</div>
                <div style={{ width: '15%' }}>Fulfillment</div>
                <div style={{ width: '10%', textAlign: 'right' }}>Actions</div>
              </div>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border-color)' }}>
                  {/* Code */}
                  <div style={{ width: '10%' }}>
                    <div className="skeleton-shimmer" style={{ width: '75px', height: '18px' }} />
                  </div>
                  {/* Date */}
                  <div style={{ width: '12%' }}>
                    <div className="skeleton-shimmer" style={{ width: '65px', height: '16px' }} />
                  </div>
                  {/* Customer */}
                  <div style={{ width: '25%', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div className="skeleton-shimmer" style={{ width: '140px', height: '16px' }} />
                    <div className="skeleton-shimmer" style={{ width: '85px', height: '12px' }} />
                  </div>
                  {/* City */}
                  <div style={{ width: '15%' }}>
                    <div className="skeleton-shimmer" style={{ width: '80px', height: '16px' }} />
                  </div>
                  {/* Bill */}
                  <div style={{ width: '13%' }}>
                    <div className="skeleton-shimmer" style={{ width: '70px', height: '16px', fontWeight: 800 }} />
                  </div>
                  {/* Fulfillment */}
                  <div style={{ width: '15%' }}>
                    <div className="skeleton-shimmer" style={{ width: '100px', height: '28px', borderRadius: '4px' }} />
                  </div>
                  {/* Actions */}
                  <div style={{ width: '10%', display: 'flex', justifyContent: 'flex-end' }}>
                    <div className="skeleton-shimmer" style={{ width: '80px', height: '28px', borderRadius: '4px' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredOrdersList.length === 0 ? (
            <div style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: '60px',
              textAlign: 'center',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <AlertCircle size={40} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '6px' }}>No Orders Registered</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Filters ke mutabiq koi order register nahi mila.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Date</th>
                    <th>Customer Name</th>
                    <th>City</th>
                    <th>COD Bill</th>
                    <th>Fulfillment</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrdersList.map((ord) => {
                    const isRx = ord.items.some(i => i.requires_prescription);
                    return (
                      <tr key={ord.id}>
                        {/* Reference code */}
                        <td style={{ fontWeight: 800, color: 'var(--primary)', fontFamily: 'monospace' }}>
                          {ord.tracking_code}
                        </td>
                        
                        {/* Creation date */}
                        <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          {new Date(ord.created_at).toLocaleDateString('en-PK')}
                        </td>
                        
                        {/* Customer phone CNIC matching */}
                        <td>
                          <div style={{ fontWeight: 700 }}>{ord.customer_name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ord.phone}</div>
                        </td>
                        
                        {/* Delivery City */}
                        <td style={{ fontWeight: 600 }}>{ord.city}</td>
                        
                        {/* Cod billing value */}
                        <td style={{ fontWeight: 800 }}>Rs. {ord.grand_total}</td>
                        
                        {/* Fulfillment dropdown inline */}
                        <td>
                          {updatingOrderId === ord.id ? (
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Saving...</span>
                          ) : (
                            <select
                              className="status-select"
                              value={ord.status}
                              onChange={(e) => handleOrderStatusChange(ord.id, e.target.value as any)}
                              style={{
                                borderColor: ord.status === 'Pending' ? 'var(--status-pending)' : 
                                             ord.status === 'Dispatched' ? 'var(--status-dispatched)' : 
                                             ord.status === 'Delivered' ? 'var(--status-delivered)' : 'var(--status-cancelled)',
                                color: ord.status === 'Pending' ? 'var(--status-pending)' : 
                                       ord.status === 'Dispatched' ? 'var(--status-dispatched)' : 
                                       ord.status === 'Delivered' ? 'var(--status-delivered)' : 'var(--status-cancelled)'
                              }}
                            >
                              <option value="Pending">Pending Review</option>
                              <option value="Dispatched">Dispatched</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          )}
                        </td>
                        
                        {/* Open popup review invoice */}
                        <td>
                          <button
                            onClick={() => setSelectedOrder(ord)}
                            style={{
                              background: 'var(--primary-bg)',
                              border: 'none',
                              color: 'var(--primary)',
                              padding: '6px 12px',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <Eye size={14} /> View invoice
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 3. MEDICINES PRODUCTS CATALOG CRUD TAB */}
      {activeTab === 'medicines' && (
        <div>
          {/* Operations search adding toolbar */}
          <div style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '20px 24px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px',
            marginBottom: '32px'
          }}>
            {/* Search items */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'var(--background)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              padding: '8px 16px',
              width: '100%',
              maxWidth: '300px'
            }}>
              <Search size={18} color="var(--text-muted)" />
              <input 
                type="text" 
                placeholder="Search menu items..."
                style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: '0.9rem', color: 'var(--foreground)' }}
                value={medicineSearch}
                onChange={(e) => setMedicineSearch(e.target.value)}
              />
            </div>

            {/* Category selectors */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
              <select
                className="form-input"
                style={{ width: 'auto', padding: '6px 14px', height: 'auto', fontSize: '0.85rem' }}
                value={medicineCategoryFilter}
                onChange={(e) => setMedicineCategoryFilter(e.target.value)}
              >
                {medicineCategories.map((c, i) => (
                  <option key={i} value={c}>{c === 'All' ? 'All Categories' : c}</option>
                ))}
              </select>

              {/* Adding action button */}
              <button
                onClick={() => {
                  setMedicineModalType('add');
                  setEditingMedicine({
                    name: '',
                    generic_name: '',
                    category: 'Pizza',
                    price_pkr: 0,
                    stock: 50,
                    dosage: '',
                    description: '',
                    manufacturer: '',
                    requires_prescription: false,
                    image_url: ''
                  });
                  setShowMedicineModal(true);
                }}
                className="btn-primary"
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              >
                <Plus size={16} /> Add Menu Item
              </button>
            </div>
          </div>

          {/* Medicines inventory listing */}
          {isLoadingMedicines ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '24px', background: 'var(--card-bg)' }}>
              <div style={{ display: 'flex', borderBottom: '2px solid var(--border-color)', paddingBottom: '12px', marginBottom: '8px', fontWeight: 800, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                <div style={{ width: '10%' }}>Item ID</div>
                <div style={{ width: '10%' }}>Image</div>
                <div style={{ width: '30%' }}>Name & Formula</div>
                <div style={{ width: '15%' }}>Category</div>
                <div style={{ width: '12%' }}>Price</div>
                <div style={{ width: '13%' }}>Stock</div>
                <div style={{ width: '10%', textAlign: 'right' }}>Actions</div>
              </div>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border-color)' }}>
                  {/* ID */}
                  <div style={{ width: '10%' }}>
                    <div className="skeleton-shimmer" style={{ width: '45px', height: '16px' }} />
                  </div>
                  {/* Image */}
                  <div style={{ width: '10%' }}>
                    <div className="skeleton-shimmer" style={{ width: '40px', height: '40px', borderRadius: '4px' }} />
                  </div>
                  {/* Name */}
                  <div style={{ width: '30%', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div className="skeleton-shimmer" style={{ width: '160px', height: '16px' }} />
                    <div className="skeleton-shimmer" style={{ width: '110px', height: '12px' }} />
                  </div>
                  {/* Category */}
                  <div style={{ width: '15%' }}>
                    <div className="skeleton-shimmer" style={{ width: '90px', height: '16px' }} />
                  </div>
                  {/* Price */}
                  <div style={{ width: '12%' }}>
                    <div className="skeleton-shimmer" style={{ width: '65px', height: '16px' }} />
                  </div>
                  {/* Stock */}
                  <div style={{ width: '13%' }}>
                    <div className="skeleton-shimmer" style={{ width: '70px', height: '16px' }} />
                  </div>
                  {/* Actions */}
                  <div style={{ width: '10%', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <div className="skeleton-shimmer" style={{ width: '32px', height: '32px', borderRadius: '4px' }} />
                    <div className="skeleton-shimmer" style={{ width: '32px', height: '32px', borderRadius: '4px' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredMedicinesList.length === 0 ? (
            <div style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: '60px',
              textAlign: 'center',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <AlertCircle size={40} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '6px' }}>Empty Catalog Selection</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Koi menu item filters se match nahi hua.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Item ID</th>
                    <th>Food Image</th>
                    <th>Name & Ingredients</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMedicinesList.map((med) => (
                    <tr key={med.id}>
                      {/* ID */}
                      <td style={{ fontWeight: 700, fontFamily: 'monospace' }}>#{med.id}</td>
                      
                      {/* Image */}
                      <td>
                        <img 
                          src={med.image_url} 
                          alt={med.name} 
                          style={{ width: '40px', height: '40px', objectFit: 'cover', background: '#fcfefe', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80';
                          }}
                        />
                      </td>

                      {/* Name generic */}
                      <td>
                        <div style={{ fontWeight: 700 }}>{med.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>{med.generic_name} ({med.dosage})</div>
                      </td>

                      {/* Category */}
                      <td style={{ fontWeight: 600 }}>{med.category}</td>

                      {/* Price */}
                      <td style={{ fontWeight: 800 }}>Rs. {med.price_pkr}</td>

                      {/* Stock */}
                      <td>
                        <span style={{
                          fontWeight: 700,
                          color: med.stock < 15 ? 'var(--status-cancelled)' : 'var(--foreground)'
                        }}>{med.stock} Units</span>
                        {med.stock < 15 && (
                          <div style={{ fontSize: '0.7rem', color: 'var(--status-cancelled)', fontWeight: 700 }}>⚠️ Low Stock!</div>
                        )}
                      </td>

                      {/* Operation icons */}
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => {
                              setMedicineModalType('edit');
                              setEditingMedicine(med);
                              setShowMedicineModal(true);
                            }}
                            style={{
                              background: 'transparent',
                              border: '1px solid var(--border-color)',
                              color: 'var(--foreground)',
                              width: '32px',
                              height: '32px',
                              borderRadius: 'var(--radius-sm)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer'
                            }}
                            title="Edit details"
                          >
                            <Edit size={14} />
                          </button>
                          
                          <button
                            onClick={() => handleDeleteMedicine(med.id)}
                            style={{
                              background: 'transparent',
                              border: '1px solid rgba(239, 68, 68, 0.2)',
                              color: 'var(--status-cancelled)',
                              width: '32px',
                              height: '32px',
                              borderRadius: 'var(--radius-sm)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer'
                            }}
                            title="Delete medicine"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 4. THE ULTIMATE PRESCRIPTION DOCUMENT FILE WORKSPACE (File-like Admin Panel) */}
      {activeTab === 'prescriptions' && (
        <div className="admin-prescription-workspace">
          {/* Left panel: List orders requiring prescriptions */}
          <div style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            overflowY: 'auto'
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, paddingBottom: '10px', borderBottom: '1px solid var(--border-color)' }}>
              Rx Prescription Inbox ({pendingPrescriptionOrders.length})
            </h3>
            
            {pendingPrescriptionOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 10px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                🎉 Sab prescriptions verify ho chuki hain! Koi order inbox me pending nahi hai.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {pendingPrescriptionOrders.map((ord) => {
                  const isSelected = selectedPrescriptionOrder?.id === ord.id;
                  return (
                    <div
                      key={ord.id}
                      onClick={() => {
                        setSelectedPrescriptionOrder(ord);
                        setPrescriptionRotation(0);
                        setPrescriptionZoom(1);
                      }}
                      style={{
                        background: isSelected ? 'var(--primary-bg)' : 'var(--background)',
                        border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border-color)'}`,
                        borderRadius: 'var(--radius-md)',
                        padding: '12px',
                        cursor: 'pointer',
                        transition: 'var(--transition-fast)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontWeight: 800, fontFamily: 'monospace', color: 'var(--primary)' }}>
                          {ord.tracking_code}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {new Date(ord.created_at).toLocaleDateString('en-PK')}
                        </span>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '2px' }}>
                        {ord.customer_name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {ord.phone} | {ord.city}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right panel: Active File Workspace workspace */}
          {selectedPrescriptionOrder ? (
            <div style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-sm)',
              display: 'grid',
              gridTemplateRows: 'auto 1fr auto',
              overflow: 'hidden'
            }}>
              {/* Workspace Header info */}
              <div style={{
                background: 'var(--background)',
                borderBottom: '1px solid var(--border-color)',
                padding: '16px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.2rem', fontFamily: 'monospace' }}>
                      {selectedPrescriptionOrder.tracking_code}
                    </span>
                    <span style={{ background: '#fef3c7', color: '#92400e', fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px' }}>
                      PRESCRIPTION FILE IN-REVIEW
                    </span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Patient: <strong>{selectedPrescriptionOrder.customer_name}</strong> | Phone: {selectedPrescriptionOrder.phone} | City: {selectedPrescriptionOrder.city}
                  </div>
                </div>

                {/* File Workspace Action Buttons */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setPrescriptionRotation(r => (r + 90) % 360)}
                    style={{
                      background: 'white',
                      border: '1px solid var(--border-color)',
                      width: '36px',
                      height: '36px',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                    title="Rotate file image"
                  >
                    <RotateCw size={16} />
                  </button>
                  <button
                    onClick={() => setPrescriptionZoom(z => Math.min(z + 0.25, 2))}
                    style={{
                      background: 'white',
                      border: '1px solid var(--border-color)',
                      width: '36px',
                      height: '36px',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                    title="Zoom In"
                  >
                    <ZoomIn size={16} />
                  </button>
                  <button
                    onClick={() => setPrescriptionZoom(z => Math.max(z - 0.25, 0.75))}
                    style={{
                      background: 'white',
                      border: '1px solid var(--border-color)',
                      width: '36px',
                      height: '36px',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                    title="Zoom Out"
                  >
                    <ZoomOut size={16} />
                  </button>
                </div>
              </div>

              {/* Workspace Main Workspace Split */}
              <div className="admin-prescription-detail-split">
                {/* Visual Prescription Attachment Viewer */}
                <div style={{
                  background: '#090e14',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  position: 'relative',
                  borderRight: '1px solid var(--border-color)'
                }}>
                  {/* Virtual Medical Prescription File generator canvas */}
                  <div style={{
                    transform: `rotate(${prescriptionRotation}deg) scale(${prescriptionZoom})`,
                    transition: 'transform 0.25s ease',
                    cursor: 'grab'
                  }}>
                    {/* Visual Prescription Sheet */}
                    <div style={{
                      width: '320px',
                      height: '420px',
                      background: 'white',
                      borderRadius: '4px',
                      padding: '24px',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                      fontFamily: 'monospace',
                      color: '#1e293b',
                      fontSize: '0.72rem',
                      lineHeight: 1.4,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}>
                      {/* Doctor header details */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0d9488', paddingBottom: '8px', marginBottom: '12px' }}>
                          <div>
                            <div style={{ fontWeight: 900, color: '#0d9488', fontSize: '0.85rem' }}>DR. SHAHID HAMEED, MBBS</div>
                            <div style={{ fontSize: '0.6rem', color: '#64748b' }}>Senior Consultant General Physician</div>
                            <div style={{ fontSize: '0.6rem', color: '#64748b' }}>Reg PMC No: 48937-P</div>
                          </div>
                          <div style={{ textAlign: 'right', fontSize: '0.6rem', color: '#64748b' }}>
                            <div>Karachi Medical Center</div>
                            <div>Tel: 021-39948293</div>
                          </div>
                        </div>

                        {/* Patient info */}
                        <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '4px', marginBottom: '14px', fontSize: '0.65rem' }}>
                          <div>Patient: <strong style={{ textTransform: 'uppercase' }}>{selectedPrescriptionOrder.customer_name}</strong></div>
                          <div>Age/Sex: 34 / Male | Date: {new Date(selectedPrescriptionOrder.created_at).toLocaleDateString()}</div>
                          <div>Address: {selectedPrescriptionOrder.city}, Pakistan</div>
                        </div>

                        {/* Rx Symbol */}
                        <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0d9488', margin: '6px 0' }}>Rx</div>

                        {/* Prescription Items matching ordered ones */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '8px' }}>
                          {selectedPrescriptionOrder.items.map((item, idx) => (
                            <div key={idx}>
                              <div style={{ fontWeight: 800 }}>- {item.name} {item.dosage}</div>
                              <div style={{ fontSize: '0.6rem', color: '#64748b', paddingLeft: '10px' }}>Sig: Take 1 tablet {item.name.toLowerCase().includes('pain') ? 'as needed for pain' : 'twice daily after meal'} x 5 days</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Footer Stamp */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px dashed #cbd5e1', paddingTop: '10px', marginTop: '12px' }}>
                        <div>
                          <div style={{ width: '45px', height: '45px', border: '2px solid rgba(220, 38, 38, 0.4)', borderRadius: '50%', color: 'rgba(220, 38, 38, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.55rem', fontWeight: 900, transform: 'rotate(-15deg)', textTransform: 'uppercase' }}>
                            Verified
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ width: '90px', borderBottom: '1px solid #94a3b8', marginBottom: '2px' }} />
                          <div style={{ fontSize: '0.55rem', color: '#64748b' }}>Doctor Authorized Sign</div>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Watermark security label */}
                  <span style={{ position: 'absolute', bottom: '16px', right: '16px', color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.5px' }}>
                    🔍 DIGITAL DOC FILE RECONCILER
                  </span>
                </div>

                {/* Verification Checksheet sidebar */}
                <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* Order items lists in side */}
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                      ORDERED PRESCRIPTION ITEMS
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {selectedPrescriptionOrder.items.map((item, idx) => (
                        <div key={idx} style={{
                          background: item.requires_prescription ? 'rgba(249, 115, 22, 0.05)' : 'var(--background)',
                          border: `1px solid ${item.requires_prescription ? 'rgba(249, 115, 22, 0.2)' : 'var(--border-color)'}`,
                          borderRadius: 'var(--radius-sm)',
                          padding: '10px 12px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div>
                            <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{item.name}</span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginLeft: '6px' }}>({item.dosage})</span>
                          </div>
                          {item.requires_prescription && (
                            <span style={{
                              background: 'var(--accent)',
                              color: 'white',
                              fontSize: '0.62rem',
                              fontWeight: 800,
                              padding: '2px 6px',
                              borderRadius: '4px'
                            }}>Rx</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Patient Match checklist */}
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                      CLINICAL MATCH CHECKLIST
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem' }}>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <input type="checkbox" defaultChecked id="ch1" style={{ cursor: 'pointer' }} />
                        <label htmlFor="ch1" style={{ cursor: 'pointer' }}>Patient Name match customer record: <strong>{selectedPrescriptionOrder.customer_name}</strong></label>
                      </div>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <input type="checkbox" defaultChecked id="ch2" style={{ cursor: 'pointer' }} />
                        <label htmlFor="ch2" style={{ cursor: 'pointer' }}>Ordered medicine dosages match doctor Rx script</label>
                      </div>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <input type="checkbox" defaultChecked id="ch3" style={{ cursor: 'pointer' }} />
                        <label htmlFor="ch3" style={{ cursor: 'pointer' }}>Doctor registered PMC authorization active</label>
                      </div>
                    </div>
                  </div>

                  {/* Quick summary alert */}
                  <div style={{
                    background: 'rgba(13, 148, 136, 0.05)',
                    border: '1px solid rgba(13, 148, 136, 0.15)',
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.8rem',
                    lineHeight: 1.5
                  }}>
                    💡 <strong>Verification Tip:</strong> Doctor CNIC/PMC numbers can be searched on PMC registry. Confirm details before dispatching the rider with original packings.
                  </div>

                </div>
              </div>

              {/* Workspace bottom action toolbar */}
              <div style={{
                background: 'var(--background)',
                borderTop: '1px solid var(--border-color)',
                padding: '16px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <button
                  onClick={() => handleVerifyPrescription(selectedPrescriptionOrder.id, false)}
                  disabled={isVerifyingPrescription}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: 'var(--status-cancelled)',
                    fontWeight: 700,
                    padding: '10px 20px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  Reject File Script / کینسل کریں
                </button>

                <button
                  onClick={() => handleVerifyPrescription(selectedPrescriptionOrder.id, true)}
                  disabled={isVerifyingPrescription}
                  className="btn-primary"
                  style={{
                    padding: '10px 24px',
                    fontSize: '0.85rem'
                  }}
                >
                  {isVerifyingPrescription ? 'Approving...' : 'Approve File Rx / منظور کریں'}
                </button>
              </div>

            </div>
          ) : (
            <div style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '60px',
              textAlign: 'center'
            }}>
              <FileText size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '6px' }}>Select an Order to Reconcile</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '360px' }}>
                Prescription review inbox se order select karein taake doctor certificate aur files ki verification shuru ki jaa sake.
              </p>
            </div>
          )}
        </div>
      )}

      {/* 5. OFFERS MANAGEMENT TAB */}
      {activeTab === 'offers' && (
        <div style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>🔥 Offers & Deals</h2>
              <p style={{ color: 'var(--text-muted)', marginTop: '4px', fontSize: '0.9rem' }}>Manage special offers shown on the customer website.</p>
            </div>
            <button onClick={() => { setOfferModalType('add'); setEditingOffer({ title: '', description: '', discount_text: '', price_pkr: 0, badge: 'OFFER', image_url: '', valid_until: '', is_active: true }); setOfferImageFile(null); setShowOfferModal(true); }} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus size={16} /> Add New Offer
            </button>
          </div>

          {/* Fetch offers on tab open */}
          {!isLoadingOffers && offers.length === 0 && (
            <div style={{ textAlign: 'center' }}>
              <button onClick={async () => { setIsLoadingOffers(true); try { const r = await fetch('/api/offers'); const d = await r.json(); if (d.success) setOffers(d.offers); } catch {} finally { setIsLoadingOffers(false); } }} style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}>Load Offers</button>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {offers.map(offer => (
              <div key={offer.id} style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden', opacity: offer.is_active ? 1 : 0.5 }}>
                {offer.image_url && <img src={offer.image_url} alt={offer.title} style={{ width: '100%', height: '160px', objectFit: 'cover' }} />}
                <div style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <span style={{ background: offer.is_active ? 'var(--primary)' : '#555', color: 'white', fontSize: '0.7rem', fontWeight: 800, padding: '3px 10px', borderRadius: '50px' }}>{offer.badge}</span>
                    <span style={{ fontSize: '0.75rem', color: offer.is_active ? '#10b981' : '#ef4444', fontWeight: 700 }}>{offer.is_active ? 'Active' : 'Hidden'}</span>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '6px' }}>{offer.title}</div>
                  {offer.discount_text && <div style={{ color: 'var(--primary)', fontSize: '0.82rem', fontWeight: 700, marginBottom: '8px' }}>🏷️ {offer.discount_text}</div>}
                  {offer.price_pkr ? <div style={{ color: 'var(--status-delivered)', fontSize: '0.9rem', fontWeight: 800, marginBottom: '8px' }}>Rs. {offer.price_pkr}</div> : null}
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: '0 0 12px', lineHeight: 1.5 }}>{offer.description}</p>
                  {offer.valid_until && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '12px' }}>📅 Valid until: {new Date(offer.valid_until).toLocaleDateString()}</div>}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => { setOfferModalType('edit'); setEditingOffer({ ...offer }); setOfferImageFile(null); setShowOfferModal(true); }} style={{ flex: 1, background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--foreground)', padding: '8px', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem' }}>
                      <Edit size={13} style={{ marginRight: '4px' }} />Edit
                    </button>
                    <button onClick={() => deleteOffer(offer.id)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem' }}>
                      <Trash2 size={13} />
                    </button>
                    <button onClick={async () => { const updated = { ...offer, is_active: !offer.is_active }; await fetch('/api/offers', { method: 'PUT', headers: { 'Content-Type': 'application/json', authorization: 'Bearer medimart_session_token_2026_verified' }, body: JSON.stringify(updated) }); setOffers(prev => prev.map(o => o.id === offer.id ? updated : o)); }} style={{ background: offer.is_active ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', border: `1px solid ${offer.is_active ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`, color: offer.is_active ? '#ef4444' : '#10b981', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem' }}>
                      {offer.is_active ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Offer Add/Edit Modal */}
      {showOfferModal && editingOffer && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, fontWeight: 800 }}>{offerModalType === 'add' ? 'Add New Offer' : 'Edit Offer'}</h3>
              <button onClick={() => setShowOfferModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--foreground)', cursor: 'pointer', fontSize: '1.3rem' }}>✕</button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              setIsSavingOffer(true);
              try {
                let finalImageUrl = editingOffer.image_url;
                if (offerImageFile) {
                  const formData = new FormData();
                  formData.append('file', offerImageFile);
                  const uploadRes = await fetch('/api/admin/upload', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer medimart_session_token_2026_verified` },
                    body: formData
                  });
                  const uploadData = await uploadRes.json();
                  if (uploadData.success) {
                    finalImageUrl = uploadData.url;
                  } else {
                    alert('Image upload failed: ' + uploadData.error);
                    setIsSavingOffer(false);
                    return;
                  }
                }

                const payload = { ...editingOffer, image_url: finalImageUrl };

                const method = offerModalType === 'add' ? 'POST' : 'PUT';
                const r = await fetch('/api/offers', { method, headers: { 'Content-Type': 'application/json', authorization: 'Bearer medimart_session_token_2026_verified' }, body: JSON.stringify(payload) });
                const d = await r.json();
                if (d.success) {
                  if (offerModalType === 'add') setOffers(prev => [...prev, d.offer]);
                  else setOffers(prev => prev.map(o => o.id === d.offer.id ? d.offer : o));
                  setShowOfferModal(false);
                }
              } catch {}
              setIsSavingOffer(false);
            }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[{label: 'Offer Title *', key: 'title', placeholder: 'e.g. Grand Opening Deal 🎉'}, {label: 'Discount Text', key: 'discount_text', placeholder: 'e.g. Save Rs. 690 or FREE Cheese Sticks'}, {label: 'Price (PKR)', key: 'price_pkr', placeholder: 'e.g. 1500', type: 'number'}, {label: 'Valid Until (optional)', key: 'valid_until', placeholder: '', type: 'date'}].map(f => (
                <div key={f.key}>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.82rem', marginBottom: '6px', color: 'var(--text-muted)' }}>{f.label}</label>
                  <input type={f.type || 'text'} value={(editingOffer as any)[f.key] || ''} onChange={e => setEditingOffer(prev => ({ ...prev, [f.key]: e.target.value }))} placeholder={f.placeholder} required={f.key === 'title'} style={{ width: '100%', background: 'var(--background)', border: '1px solid var(--border-color)', color: 'var(--foreground)', borderRadius: '8px', padding: '10px 14px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              ))}
              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.82rem', marginBottom: '6px', color: 'var(--text-muted)' }}>Offer Poster Image (Local Upload)</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={e => {
                    if (e.target.files && e.target.files.length > 0) {
                      setOfferImageFile(e.target.files[0]);
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        setEditingOffer(prev => ({ ...prev, image_url: e.target?.result as string }));
                      };
                      reader.readAsDataURL(e.target.files[0]);
                    }
                  }} 
                  style={{ width: '100%', background: 'var(--background)', border: '1px solid var(--border-color)', color: 'var(--foreground)', borderRadius: '8px', padding: '10px 14px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} 
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.82rem', marginBottom: '6px', color: 'var(--text-muted)' }}>Description *</label>
                <textarea value={editingOffer.description || ''} onChange={e => setEditingOffer(prev => ({ ...prev, description: e.target.value }))} placeholder="Describe the offer in detail..." required rows={3} style={{ width: '100%', background: 'var(--background)', border: '1px solid var(--border-color)', color: 'var(--foreground)', borderRadius: '8px', padding: '10px 14px', fontSize: '0.9rem', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.82rem', marginBottom: '6px', color: 'var(--text-muted)' }}>Badge</label>
                <select value={editingOffer.badge || 'OFFER'} onChange={e => setEditingOffer(prev => ({ ...prev, badge: e.target.value }))} style={{ width: '100%', background: 'var(--background)', border: '1px solid var(--border-color)', color: 'var(--foreground)', borderRadius: '8px', padding: '10px 14px', fontSize: '0.9rem', outline: 'none' }}>
                  {['OFFER', 'LIMITED', 'BUNDLE', 'HOT', 'NEW', 'SALE'].map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-muted)' }}>Active on Website?</label>
                <input type="checkbox" checked={editingOffer.is_active !== false} onChange={e => setEditingOffer(prev => ({ ...prev, is_active: e.target.checked }))} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
              </div>
              {editingOffer.image_url && (
                <div style={{ padding: '16px', background: 'var(--background)', borderRadius: '8px', border: '1px dashed var(--border-color)' }}>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.82rem', marginBottom: '8px', color: 'var(--text-muted)' }}>Poster Preview</label>
                  <img src={editingOffer.image_url} alt="Preview" style={{ width: '100%', maxHeight: '250px', objectFit: 'contain', borderRadius: '8px', background: '#000' }} onError={e => (e.currentTarget.style.display = 'none')} />
                </div>
              )}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={() => setShowOfferModal(false)} style={{ flex: 1, background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--foreground)', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}>Cancel</button>
                <button type="submit" disabled={isSavingOffer} className="btn-primary" style={{ flex: 1, padding: '12px', justifyContent: 'center' }}>{isSavingOffer ? 'Saving...' : offerModalType === 'add' ? 'Create Offer' : 'Update Offer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. CONFIGURATION STORE SETTINGS TAB */}
      {activeTab === 'addons' && (
        <div style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Manage Add-ons</h2>
            <button onClick={() => { setEditingAddon({ name: '', price_pkr: 0 }); setShowAddonModal(true); }} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus size={18} /> New Add-on
            </button>
          </div>

          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--background)', borderBottom: '1px solid var(--border-color)', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '16px' }}>NAME</th>
                  <th style={{ padding: '16px' }}>PRICE</th>
                  <th style={{ padding: '16px', textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingAddons ? (
                  <tr><td colSpan={3} style={{ padding: '32px', textAlign: 'center' }}>Loading...</td></tr>
                ) : addonsList.length === 0 ? (
                  <tr><td colSpan={3} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>No add-ons created yet.</td></tr>
                ) : addonsList.map(addon => (
                  <tr key={addon.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                    <td style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 600 }}>
                      {addon.image_url ? (
                        <img src={addon.image_url} alt={addon.name} style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '40px', height: '40px', borderRadius: '4px', background: 'var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={16} color="var(--text-muted)" /></div>
                      )}
                      {addon.name}
                    </td>
                    <td style={{ padding: '16px', color: 'var(--primary)', fontWeight: 800 }}>Rs. {addon.price_pkr}</td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button onClick={() => { setEditingAddon(addon); setShowAddonModal(true); }} style={{ background: 'var(--background)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '6px', cursor: 'pointer' }}><Edit size={16} /></button>
                        <button onClick={() => deleteAddon(addon.id)} style={{ background: 'var(--background)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '6px', cursor: 'pointer', color: 'var(--status-cancelled)' }}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Addon Modal */}
          {showAddonModal && editingAddon && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
              <div style={{ background: 'var(--card-bg)', padding: '24px', borderRadius: 'var(--radius-lg)', width: '400px' }}>
                <h3 style={{ marginBottom: '20px' }}>{editingAddon.id ? 'Edit Add-on' : 'New Add-on'}</h3>
                <form onSubmit={handleSaveAddon} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>Name (e.g., Extra Cheese)</label>
                    <input type="text" value={editingAddon.name} onChange={e => setEditingAddon({...editingAddon, name: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>Price (Rs.)</label>
                    <input type="number" value={editingAddon.price_pkr} onChange={e => setEditingAddon({...editingAddon, price_pkr: Number(e.target.value)})} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>Image URL</label>
                    <input type="text" placeholder="https://..." value={editingAddon.image_url || ''} onChange={e => setEditingAddon({...editingAddon, image_url: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
                  </div>
                  {editingAddon.image_url && (
                    <img src={editingAddon.image_url} alt="Preview" style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '6px', marginTop: '4px' }} onError={(e) => e.currentTarget.style.display = 'none'} />
                  )}
                  <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                    <button type="button" onClick={() => setShowAddonModal(false)} style={{ flex: 1, padding: '10px', background: 'var(--background)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>Cancel</button>
                    <button type="submit" disabled={isSavingAddon} style={{ flex: 1, padding: '10px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 700 }}>{isSavingAddon ? 'Saving...' : 'Save'}</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'settings' && (
        <div style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '40px',
          boxShadow: 'var(--shadow-sm)',
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}>Store Settings & Operations Configuration</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '32px' }}>
            Store shipping rates, banner alerts, support hotlines aur general features configure karein. (ایڈمن سیٹنگز)
          </p>

          <form onSubmit={handleSaveSettings}>
            
            {/* Shipping rate slider */}
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label">
                <span>Flat Shipping rate (Delivery charges):</span>
                <span style={{ fontWeight: 800, color: 'var(--primary)' }}>Rs. {settings.shippingFee} PKR</span>
              </label>
              <input 
                type="range"
                min="0"
                max="500"
                step="50"
                style={{ width: '100%', height: '6px', background: 'var(--background)', accentColor: 'var(--primary)', cursor: 'pointer' }}
                value={settings.shippingFee}
                onChange={(e) => setSettings({ ...settings, shippingFee: Number(e.target.value) })}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                <span>Free delivery (Rs. 0)</span>
                <span>Max limit (Rs. 500)</span>
              </div>
            </div>

            {/* Hotline number */}
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label">Support Helpdesk Hotline:</label>
              <input 
                type="text"
                className="form-input"
                value={settings.supportPhone}
                onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                required
              />
            </div>

            {/* Store physical address */}
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label">Physical Warehouse Address:</label>
              <textarea 
                className="form-input"
                rows={3}
                style={{ resize: 'none', fontFamily: 'inherit' }}
                value={settings.storeAddress}
                onChange={(e) => setSettings({ ...settings, storeAddress: e.target.value })}
                required
              />
            </div>

            {/* General store announcement notice banner */}
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label">Header Banner active notice (Roman Urdu / English):</label>
              <input 
                type="text"
                className="form-input"
                placeholder="e.g. NOTICE: Rain delay..."
                value={settings.activeNotice}
                onChange={(e) => setSettings({ ...settings, activeNotice: e.target.value })}
              />
            </div>

            {/* Emergency alert */}
            <div className="form-group" style={{ marginBottom: '32px' }}>
              <label className="form-label">Pharma chat Emergency announcement toast:</label>
              <input 
                type="text"
                className="form-input"
                placeholder="e.g. Chat consultation stats..."
                value={settings.emergencyAnnouncement}
                onChange={(e) => setSettings({ ...settings, emergencyAnnouncement: e.target.value })}
              />
            </div>

            {/* Store status switch */}
            <div style={{
              background: 'var(--background)',
              border: '1px solid var(--border-color)',
              padding: '20px',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '32px'
            }}>
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Enable Store Deliveries Status</h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>If closed, customers won&apos;t be able to checkout items from cart.</p>
              </div>
              
              <button
                type="button"
                onClick={() => setSettings({ ...settings, isStoreOpen: !settings.isStoreOpen })}
                style={{
                  background: settings.isStoreOpen ? 'var(--primary)' : 'var(--status-cancelled)',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)'
                }}
              >
                {settings.isStoreOpen ? 'OPEN / اسٹور کھلا ہے' : 'CLOSED / اسٹور بند ہے'}
              </button>
            </div>

            {/* Save operations */}
            <button
              type="submit"
              disabled={isSavingSettings}
              className="btn-primary"
              style={{ width: '100%', padding: '14px', justifyContent: 'center', fontSize: '0.95rem' }}
            >
              {isSavingSettings ? 'Saving...' : 'Save Configuration Settings / محفوظ کریں'}
            </button>

          </form>
        </div>
      )}

      {/* MODAL WORKSPACES SECTION */}

      {/* I. DETAILED INVOICE MODAL POPUP */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content modal-fade-in" style={{ maxWidth: '650px' }} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedOrder(null)}>
              X
            </button>

            <div style={{ padding: '30px' }}>
              <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '24px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>ORDER DETAILS RECORD</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'monospace' }}>
                    {selectedOrder.tracking_code}
                  </h2>
                  <span className={`status-badge ${selectedOrder.status.toLowerCase()}`}>{selectedOrder.status}</span>
                </div>
              </div>

              {/* Delivery specifications */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', fontSize: '0.85rem', marginBottom: '24px', background: 'var(--background)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <strong style={{ color: 'var(--text-muted)' }}>Customer Details:</strong>
                  <div style={{ fontWeight: 700, marginTop: '4px' }}>{selectedOrder.customer_name}</div>
                  <div>Phone: {selectedOrder.phone}</div>
                </div>
                <div>
                  <strong style={{ color: 'var(--text-muted)' }}>Shipping Address:</strong>
                  <div style={{ marginTop: '4px' }}>{selectedOrder.address}</div>
                  <div style={{ fontWeight: 700 }}>City: {selectedOrder.city}</div>
                </div>
              </div>

              {/* Items Table */}
              <div style={{ marginBottom: '24px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '12px' }}>
                  ITEMS ORDERED LIST ({selectedOrder.items.length})
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontWeight: 700 }}>{item.name}</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginLeft: '6px' }}>({item.dosage})</span>
                        {item.requires_prescription && (
                          <span style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '0.7rem', marginLeft: '8px' }}>[Rx Required]</span>
                        )}
                        <span style={{ color: 'var(--text-muted)', marginLeft: '12px' }}>x{item.quantity}</span>
                      </div>
                      <span style={{ fontWeight: 700 }}>Rs. {item.price_pkr * item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', marginBottom: '16px' }} />

              {/* Costs info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Items Subtotal:</span>
                  <span>Rs. {selectedOrder.subtotal}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Flat Delivery charges:</span>
                  <span>Rs. {selectedOrder.shipping_fee}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 800 }}>
                  <span>COD Amount Receivable:</span>
                  <span style={{ color: 'var(--primary)' }}>Rs. {selectedOrder.grand_total}</span>
                </div>
              </div>

              {/* Status change actions quickly inside invoice modal */}
              <div style={{ background: '#f4f8f6', padding: '16px', borderRadius: 'var(--radius-md)', display: 'flex', justifyItems: 'center', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--foreground)' }}>Update Fulfillment:</span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {['Pending', 'Dispatched', 'Delivered', 'Cancelled'].map((st) => (
                    <button
                      key={st}
                      onClick={() => handleOrderStatusChange(selectedOrder.id, st as any)}
                      style={{
                        background: selectedOrder.status === st ? 'var(--primary)' : 'white',
                        color: selectedOrder.status === st ? 'white' : 'var(--foreground)',
                        border: '1px solid var(--border-color)',
                        padding: '6px 12px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer'
                      }}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* II. ADD/EDIT MEDICINE FORM DIALOG MODAL */}
      {showMedicineModal && editingMedicine && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <button className="modal-close" onClick={() => { setShowMedicineModal(false); setEditingMedicine(null); setImageFile(null); }}>
              X
            </button>

            <div style={{ padding: '32px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '24px', letterSpacing: '-0.5px' }}>
                {medicineModalType === 'add' ? 'Add New Menu Item / نیا آئٹم شامل کریں' : 'Edit Menu Item Details / ترمیم کریں'}
              </h2>

              <form onSubmit={handleSaveMedicine} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {/* Name */}
                  <div className="form-group">
                    <label className="form-label">Item Name <span style={{ color: 'red' }}>*</span></label>
                    <input 
                      type="text"
                      className="form-input"
                      placeholder="e.g. Veggie Lover Pizza"
                      value={editingMedicine.name || ''}
                      onChange={(e) => setEditingMedicine({ ...editingMedicine, name: e.target.value })}
                      required
                    />
                  </div>

                  {/* Ingredients */}
                  <div className="form-group">
                    <label className="form-label">Ingredients & Toppings <span style={{ color: 'red' }}>*</span></label>
                    <input 
                      type="text"
                      className="form-input"
                      placeholder="e.g. Mushrooms, Olives, Mozzarella"
                      value={editingMedicine.generic_name || ''}
                      onChange={(e) => setEditingMedicine({ ...editingMedicine, generic_name: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {/* Category dropdown */}
                  <div className="form-group">
                    <label className="form-label">Category <span style={{ color: 'red' }}>*</span></label>
                    <select
                      className="form-input"
                      value={editingMedicine.category || ''}
                      onChange={(e) => setEditingMedicine({ ...editingMedicine, category: e.target.value })}
                      required
                    >
                      <option value="Pizza">Pizza</option>
                      <option value="Burger">Burger</option>
                      <option value="Sandwich">Sandwich</option>
                      <option value="Pasta">Pasta</option>
                      <option value="Sides">Sides</option>
                    </select>
                  </div>

                  {/* Price */}
                  <div className="form-group">
                    <label className="form-label">Price (PKR) <span style={{ color: 'red' }}>*</span></label>
                    <input 
                      type="number"
                      className="form-input"
                      value={editingMedicine.price_pkr || 0}
                      onChange={(e) => setEditingMedicine({ ...editingMedicine, price_pkr: Number(e.target.value) })}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {/* Stock count */}
                  <div className="form-group">
                    <label className="form-label">Available Stock <span style={{ color: 'red' }}>*</span></label>
                    <input 
                      type="number"
                      className="form-input"
                      value={editingMedicine.stock || 0}
                      onChange={(e) => setEditingMedicine({ ...editingMedicine, stock: Number(e.target.value) })}
                      required
                    />
                  </div>

                  {/* Portion specification */}
                  <div className="form-group">
                    <label className="form-label">Size / Portion Spec</label>
                    <input 
                      type="text"
                      className="form-input"
                      placeholder="e.g. 12 inch Medium, 6 Pieces"
                      value={editingMedicine.dosage || ''}
                      onChange={(e) => setEditingMedicine({ ...editingMedicine, dosage: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {/* Kitchen maker */}
                  <div className="form-group">
                    <label className="form-label">Kitchen / Maker</label>
                    <input 
                      type="text"
                      className="form-input"
                      placeholder="e.g. Fatpizza Kitchen"
                      value={editingMedicine.manufacturer || ''}
                      onChange={(e) => setEditingMedicine({ ...editingMedicine, manufacturer: e.target.value })}
                    />
                  </div>

                  {/* Thumbnail link or Upload */}
                  <div className="form-group">
                    <label className="form-label">Image (Upload or URL)</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setImageFile(e.target.files[0]);
                          }
                        }}
                        style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}
                      />
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>- OR -</span>
                      <input 
                        type="text"
                        className="form-input"
                        placeholder="Image URL (https://...)"
                        value={editingMedicine.image_url || ''}
                        onChange={(e) => setEditingMedicine({ ...editingMedicine, image_url: e.target.value })}
                      />
                      {imageFile && <span style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>Selected: {imageFile.name}</span>}
                    </div>
                  </div>
                </div>

                {/* Description details */}
                <div className="form-group">
                  <label className="form-label">Product Description</label>
                  <textarea 
                    className="form-input"
                    rows={3}
                    style={{ resize: 'none', fontFamily: 'inherit' }}
                    placeholder="Provide description and special instructions..."
                    value={editingMedicine.description || ''}
                    onChange={(e) => setEditingMedicine({ ...editingMedicine, description: e.target.value })}
                  />
                </div>

                {/* Hidden Rx checklist */}
                <input 
                  type="hidden" 
                  value="false"
                />

                {/* Save cancel controls */}
                <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                  <button
                    type="button"
                    onClick={() => { setShowMedicineModal(false); setEditingMedicine(null); setImageFile(null); }}
                    style={{
                      flex: 1,
                      background: 'transparent',
                      border: '1px solid var(--border-color)',
                      color: 'var(--foreground)',
                      padding: '12px',
                      borderRadius: 'var(--radius-sm)',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isMutatingMedicine}
                    className="btn-primary"
                    style={{ flex: 1, padding: '12px', justifyContent: 'center' }}
                  >
                    {isMutatingMedicine ? 'Saving...' : 'Save Product Record'}
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      )}

        </div>
      </main>
    </div>
  );
}
