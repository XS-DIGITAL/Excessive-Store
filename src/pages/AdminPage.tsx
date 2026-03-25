import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Palette, 
  Package, 
  RefreshCw, 
  Save, 
  LogOut, 
  Edit2, 
  Trash2, 
  AlertCircle,
  X,
  LayoutDashboard,
  ShoppingBag,
  TrendingUp,
  Users,
  DollarSign,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getProducts } from '../lib/shopify';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart as ReBarChart,
  AreaChart,
  Area
} from 'recharts';
import { formatPrice } from '../lib/utils';

type AdminTab = 'dashboard' | 'orders' | 'products' | 'settings' | 'theme';

interface ThemeSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
}

// Mock Data Storage Keys
const STORAGE_KEYS = {
  AUTH: 'excessive_store_admin_auth',
  SETTINGS: 'excessive_store_settings',
  THEME: 'excessive_store_theme',
  PRODUCTS: 'excessive_store_products',
  ORDERS: 'excessive_store_orders'
};

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Login State
  const [loginEmail, setLoginEmail] = useState('admin@admin.com');
  const [loginPassword, setLoginPassword] = useState('password123');
  const [loginLoading, setLoginLoading] = useState(false);

  // Settings State
  const [siteName, setSiteName] = useState('EXCESSIVE STORE');
  const [shopifyDomain, setShopifyDomain] = useState('');
  const [shopifyAccessToken, setShopifyAccessToken] = useState('');
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>({
    primaryColor: '#6c0094',
    secondaryColor: '#4a0066',
    accentColor: '#f5a8ff',
    fontFamily: 'Inter'
  });

  // Data State
  const [localProducts, setLocalProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [viewingOrder, setViewingOrder] = useState<any>(null);

  useEffect(() => {
    // Check local storage for auth
    const savedAuth = localStorage.getItem(STORAGE_KEYS.AUTH);
    if (savedAuth) {
      setUser(JSON.parse(savedAuth));
    }

    // Load other data from local storage
    const savedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (savedSettings) setSiteName(JSON.parse(savedSettings).siteName);

    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
    if (savedTheme) setThemeSettings(JSON.parse(savedTheme));

    const savedProducts = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (savedProducts) setLocalProducts(JSON.parse(savedProducts));

    const savedOrders = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (savedOrders) setOrders(JSON.parse(savedOrders));

    // Load Shopify credentials
    const savedShopify = localStorage.getItem('excessive_store_shopify_credentials');
    if (savedShopify) {
      try {
        const { domain, accessToken } = JSON.parse(savedShopify);
        setShopifyDomain(domain || '');
        setShopifyAccessToken(accessToken || '');
      } catch (e) {
        console.error('Error loading shopify credentials', e);
      }
    }

    setLoading(false);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setError(null);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    if (loginEmail === 'admin@admin.com' && loginPassword === 'password123') {
      const adminUser = { email: loginEmail, role: 'admin', uid: 'admin-1' };
      setUser(adminUser);
      localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(adminUser));
    } else {
      setError('Invalid credentials. Please try again.');
    }
    setLoginLoading(false);
  };

  const handleSignOut = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEYS.AUTH);
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const data = { siteName, updatedAt: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data));
      
      // Save Shopify credentials
      if (shopifyDomain && shopifyAccessToken) {
        let cleanDomain = shopifyDomain.trim()
          .replace(/^https?:\/\//, '')
          .replace(/\/$/, '')
          .split('/')[0];
        if (!cleanDomain.includes('.')) cleanDomain = `${cleanDomain}.myshopify.com`;
        
        localStorage.setItem('excessive_store_shopify_credentials', JSON.stringify({ 
          domain: cleanDomain, 
          accessToken: shopifyAccessToken 
        }));
      } else if (!shopifyDomain && !shopifyAccessToken) {
        localStorage.removeItem('excessive_store_shopify_credentials');
      }

      // Dispatch event for Navbar to update
      window.dispatchEvent(new CustomEvent('settingsUpdated', { detail: data }));
      
      // Optional: Refresh to apply Shopify changes if they were modified
      // window.location.reload(); 
    } catch (err) {
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTheme = async () => {
    setSaving(true);
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, JSON.stringify(themeSettings));
    } catch (err) {
      setError('Failed to save theme');
    } finally {
      setSaving(false);
    }
  };

  const handleSyncProducts = async () => {
    setSyncing(true);
    setError(null);
    try {
      const shopifyProducts = await getProducts();
      const syncedProducts = shopifyProducts.map((p: any) => ({
        ...p,
        syncedAt: new Date().toISOString()
      }));
      setLocalProducts(syncedProducts);
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(syncedProducts));
    } catch (err) {
      setError('Failed to sync products from Shopify');
    } finally {
      setSyncing(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    const updatedOrders = orders.map(o => o.id === orderId ? { ...o, status } : o);
    setOrders(updatedOrders);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updatedOrders));
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;
    const updatedOrders = orders.filter(o => o.id !== orderId);
    setOrders(updatedOrders);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updatedOrders));
    setViewingOrder(null);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setSaving(true);
    try {
      const updatedProducts = localProducts.map(p => 
        p.id === editingProduct.id ? { ...editingProduct, updatedAt: new Date().toISOString() } : p
      );
      setLocalProducts(updatedProducts);
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updatedProducts));
      setEditingProduct(null);
    } catch (err) {
      setError('Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    const updatedProducts = localProducts.filter(p => p.id !== productId);
    setLocalProducts(updatedProducts);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updatedProducts));
  };

  // Analytics Data
  const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  
  const chartData = [
    { name: 'Mon', sales: 4000, orders: 24 },
    { name: 'Tue', sales: 3000, orders: 18 },
    { name: 'Wed', sales: 2000, orders: 12 },
    { name: 'Thu', sales: 2780, orders: 20 },
    { name: 'Fri', sales: 1890, orders: 15 },
    { name: 'Sat', sales: 2390, orders: 22 },
    { name: 'Sun', sales: 3490, orders: 28 },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-brand-orange" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-bg-dark">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-brand-orange/20 rounded-3xl flex items-center justify-center mx-auto">
              <Settings className="w-10 h-10 text-brand-orange" />
            </div>
            <h1 className="text-4xl font-display font-black tracking-tighter uppercase italic">Admin Portal</h1>
            <p className="text-text-secondary">Enter your credentials to manage the store.</p>
          </div>

          <div className="glass-card p-8 space-y-6">
            <div className="p-4 bg-brand-orange/5 border border-brand-orange/20 rounded-xl space-y-2">
              <p className="text-xs font-bold uppercase text-brand-orange">Demo Credentials</p>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Email:</span>
                <span className="font-mono font-bold">admin@admin.com</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Password:</span>
                <span className="font-mono font-bold">password123</span>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-text-muted">Email Address</label>
                <input 
                  type="email" 
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  className="w-full bg-bg-dark border border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-orange transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-text-muted">Password</label>
                <input 
                  type="password" 
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  className="w-full bg-bg-dark border border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-orange transition-colors"
                />
              </div>
              <button 
                type="submit" 
                disabled={loginLoading}
                className="btn-primary w-full py-4 flex items-center justify-center gap-2"
              >
                {loginLoading ? <RefreshCw className="animate-spin" size={20} /> : 'Access Dashboard'}
              </button>
            </form>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm flex items-center gap-2">
                <AlertCircle size={16} />
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-dark pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Navigation */}
          <aside className="lg:w-64 shrink-0">
            <div className="glass-card p-4 space-y-2 sticky top-32">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                { id: 'orders', label: 'Orders', icon: ShoppingBag },
                { id: 'products', label: 'Products', icon: Package },
                { id: 'settings', label: 'Settings', icon: Settings },
                { id: 'theme', label: 'Theme', icon: Palette },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as AdminTab)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === tab.id 
                      ? 'bg-brand-orange text-black font-bold shadow-lg shadow-brand-orange/20' 
                      : 'text-text-secondary hover:bg-surface hover:text-text-primary'
                  }`}
                >
                  <tab.icon size={20} />
                  {tab.label}
                </button>
              ))}
              <div className="pt-4 mt-4 border-t border-white/5">
                <button 
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-all"
                >
                  <LogOut size={20} />
                  Sign Out
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-grow space-y-8">
            <AnimatePresence mode="wait">
              {activeTab === 'dashboard' && (
                <motion.div 
                  key="dashboard"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <h1 className="text-4xl font-display font-black tracking-tighter uppercase italic">Dashboard</h1>
                      <p className="text-text-secondary">Overview of your store's performance.</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold uppercase text-text-muted">Last Updated</p>
                      <p className="text-sm font-mono">{new Date().toLocaleTimeString()}</p>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      { label: 'Total Revenue', value: formatPrice(totalRevenue.toString(), 'USD'), icon: DollarSign, trend: '+12.5%', up: true },
                      { label: 'Total Orders', value: totalOrders, icon: ShoppingBag, trend: '+5.2%', up: true },
                      { label: 'Pending Orders', value: pendingOrders, icon: Clock, trend: '-2.1%', up: false },
                      { label: 'Active Users', value: '1,284', icon: Users, trend: '+18.7%', up: true },
                    ].map((stat, i) => (
                      <div key={i} className="glass-card p-6 space-y-4">
                        <div className="flex justify-between items-start">
                          <div className="p-3 bg-surface rounded-2xl text-brand-orange">
                            <stat.icon size={24} />
                          </div>
                          <div className={`flex items-center gap-1 text-xs font-bold ${stat.up ? 'text-brand-green' : 'text-red-500'}`}>
                            {stat.trend}
                            {stat.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase text-text-muted tracking-widest">{stat.label}</p>
                          <p className="text-2xl font-display font-black mt-1">{stat.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="glass-card p-6 space-y-6">
                      <div className="flex justify-between items-center">
                        <h3 className="font-bold uppercase tracking-widest text-sm">Revenue Over Time</h3>
                        <TrendingUp size={18} className="text-brand-orange" />
                      </div>
                      <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData}>
                            <defs>
                              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                            <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                              itemStyle={{ color: '#22c55e' }}
                            />
                            <Area type="monotone" dataKey="sales" stroke="#22c55e" fillOpacity={1} fill="url(#colorSales)" strokeWidth={3} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="glass-card p-6 space-y-6">
                      <div className="flex justify-between items-center">
                        <h3 className="font-bold uppercase tracking-widest text-sm">Orders Volume</h3>
                        <ShoppingBag size={18} className="text-brand-orange" />
                      </div>
                      <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                            <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px' }}
                              cursor={{ fill: '#ffffff05' }}
                            />
                            <Bar dataKey="orders" fill="#f97316" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'orders' && (
                <motion.div 
                  key="orders"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  <div className="space-y-1">
                    <h1 className="text-4xl font-display font-black tracking-tighter uppercase italic">Orders</h1>
                    <p className="text-text-secondary">Manage and track customer purchases.</p>
                  </div>

                  <div className="glass-card overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-surface/50 text-xs font-bold uppercase tracking-widest text-text-muted border-b border-white/5">
                            <th className="px-6 py-4">Order ID</th>
                            <th className="px-6 py-4">Customer</th>
                            <th className="px-6 py-4">Total</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {orders.map(order => (
                            <tr key={order.id} className="hover:bg-surface/30 transition-colors group">
                              <td className="px-6 py-4 font-mono text-sm font-bold text-brand-orange">{order.orderNumber}</td>
                              <td className="px-6 py-4">
                                <div className="text-sm font-bold">{order.shipping?.firstName} {order.shipping?.lastName}</div>
                                <div className="text-xs text-text-muted">{order.shipping?.email}</div>
                              </td>
                              <td className="px-6 py-4 font-bold">{formatPrice(order.total?.toString(), order.currency)}</td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                  order.status === 'completed' ? 'bg-brand-green/10 text-brand-green' :
                                  order.status === 'shipped' ? 'bg-blue-500/10 text-blue-500' :
                                  'bg-brand-orange/10 text-brand-orange'
                                }`}>
                                  {order.status === 'completed' ? <CheckCircle2 size={10} /> :
                                   order.status === 'shipped' ? <Truck size={10} /> :
                                   <Clock size={10} />}
                                  {order.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-xs text-text-muted">
                                {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'Just now'}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                  <button 
                                    onClick={() => setViewingOrder(order)}
                                    className="p-2 hover:bg-surface rounded-lg transition-colors text-text-secondary hover:text-text-primary"
                                  >
                                    <Eye size={18} />
                                  </button>
                                  <select 
                                    value={order.status}
                                    onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                    className="bg-surface border border-white/5 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-brand-orange"
                                  >
                                    <option value="pending">Pending</option>
                                    <option value="shipped">Shipped</option>
                                    <option value="completed">Completed</option>
                                  </select>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'products' && (
                <motion.div 
                  key="products"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <h1 className="text-4xl font-display font-black tracking-tighter uppercase italic">Products</h1>
                      <p className="text-text-secondary">Manage your store's inventory.</p>
                    </div>
                    <button 
                      onClick={handleSyncProducts} 
                      disabled={syncing}
                      className="btn-secondary flex items-center gap-2"
                    >
                      <RefreshCw size={18} className={syncing ? 'animate-spin' : ''} />
                      {syncing ? 'Syncing...' : 'Sync from Shopify'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {localProducts.map(product => (
                      <div key={product.id} className="glass-card p-4 flex justify-between items-center group hover:border-brand-orange transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-surface rounded-xl overflow-hidden shrink-0">
                            <img src={product.images?.edges?.[0]?.node?.url} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">{product.title}</h3>
                            <p className="text-sm font-mono text-brand-orange">
                              {formatPrice(product.priceRange?.minVariantPrice?.amount, product.priceRange?.minVariantPrice?.currencyCode)}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => setEditingProduct(product)} className="p-3 bg-surface rounded-xl hover:text-brand-orange transition-colors">
                            <Edit2 size={18} />
                          </button>
                          <button onClick={() => handleDeleteProduct(product.id)} className="p-3 bg-surface rounded-xl hover:text-red-500 transition-colors">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'settings' && (
                <motion.div 
                  key="settings"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  <div className="space-y-1">
                    <h1 className="text-4xl font-display font-black tracking-tighter uppercase italic">Settings</h1>
                    <p className="text-text-secondary">Global store configurations.</p>
                  </div>

                  <div className="glass-card p-8 space-y-8">
                    <div className="space-y-4">
                      <label className="block text-sm font-bold uppercase tracking-widest text-text-muted">Store Display Name</label>
                      <input 
                        type="text" 
                        value={siteName}
                        onChange={(e) => setSiteName(e.target.value)}
                        className="w-full bg-bg-dark border border-white/5 rounded-xl px-4 py-4 focus:outline-none focus:border-brand-orange transition-colors text-xl font-display font-bold"
                      />
                    </div>

                    <div className="pt-8 border-t border-white/5 space-y-6">
                      <div className="flex items-center gap-3 text-brand-orange">
                        <ShoppingBag size={20} />
                        <h3 className="text-lg font-display font-black uppercase italic">Shopify Integration</h3>
                      </div>
                      <p className="text-sm text-text-secondary">Connect your Shopify store to sync products and manage inventory. Credentials are stored locally in your browser.</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase text-text-muted">Shopify Domain / URL</label>
                          <input 
                            type="text" 
                            placeholder="your-store.myshopify.com"
                            value={shopifyDomain}
                            onChange={(e) => setShopifyDomain(e.target.value)}
                            className="w-full bg-bg-dark border border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-orange transition-colors font-mono text-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase text-text-muted">Storefront Access Token</label>
                          <input 
                            type="password" 
                            placeholder="shpat_xxxxxxxxxxxxxxxxxxxxxxxx"
                            value={shopifyAccessToken}
                            onChange={(e) => setShopifyAccessToken(e.target.value)}
                            className="w-full bg-bg-dark border border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-orange transition-colors font-mono text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    <button onClick={handleSaveSettings} disabled={saving} className="btn-primary w-full py-5 text-lg">
                      {saving ? 'Saving...' : <><Save size={20} /> Save All Settings</>}
                    </button>
                  </div>
                </motion.div>
              )}

              {activeTab === 'theme' && (
                <motion.div 
                  key="theme"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  <div className="space-y-1">
                    <h1 className="text-4xl font-display font-black tracking-tighter uppercase italic">Theme</h1>
                    <p className="text-text-secondary">Customise the visual identity of your store.</p>
                  </div>

                  <div className="glass-card p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <label className="block text-sm font-bold uppercase tracking-widest text-text-muted">Primary Brand Color</label>
                        <div className="flex gap-4">
                          <input 
                            type="color" 
                            value={themeSettings.primaryColor}
                            onChange={(e) => setThemeSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                            className="h-14 w-24 bg-bg-dark border border-white/5 rounded-xl cursor-pointer"
                          />
                          <input 
                            type="text" 
                            value={themeSettings.primaryColor}
                            onChange={(e) => setThemeSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                            className="flex-grow bg-bg-dark border border-white/5 rounded-xl px-4 font-mono focus:outline-none focus:border-brand-orange"
                          />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <label className="block text-sm font-bold uppercase tracking-widest text-text-muted">Accent Action Color</label>
                        <div className="flex gap-4">
                          <input 
                            type="color" 
                            value={themeSettings.accentColor}
                            onChange={(e) => setThemeSettings(prev => ({ ...prev, accentColor: e.target.value }))}
                            className="h-14 w-24 bg-bg-dark border border-white/5 rounded-xl cursor-pointer"
                          />
                          <input 
                            type="text" 
                            value={themeSettings.accentColor}
                            onChange={(e) => setThemeSettings(prev => ({ ...prev, accentColor: e.target.value }))}
                            className="flex-grow bg-bg-dark border border-white/5 rounded-xl px-4 font-mono focus:outline-none focus:border-brand-orange"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <label className="block text-sm font-bold uppercase tracking-widest text-text-muted">Typography System</label>
                      <select 
                        value={themeSettings.fontFamily}
                        onChange={(e) => setThemeSettings(prev => ({ ...prev, fontFamily: e.target.value }))}
                        className="w-full bg-bg-dark border border-white/5 rounded-xl px-4 py-4 focus:outline-none focus:border-brand-orange transition-colors text-lg"
                      >
                        <option value="Inter">Inter (Modern Sans)</option>
                        <option value="Space Grotesk">Space Grotesk (Tech)</option>
                        <option value="Playfair Display">Playfair Display (Editorial)</option>
                        <option value="JetBrains Mono">JetBrains Mono (Technical)</option>
                      </select>
                    </div>
                    <button onClick={handleSaveTheme} disabled={saving} className="btn-primary w-full py-5 text-lg">
                      {saving ? 'Saving...' : <><Save size={20} /> Apply Theme</>}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* View Order Modal */}
      <AnimatePresence>
        {viewingOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewingOrder(null)}
              className="absolute inset-0 bg-black/95 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-surface border border-white/5 p-8 rounded-3xl w-full max-w-3xl space-y-8 shadow-2xl z-[101] max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <h2 className="text-2xl font-display font-black uppercase italic">Order Details</h2>
                  <p className="text-brand-orange font-mono font-bold">{viewingOrder.orderNumber}</p>
                </div>
                <button onClick={() => setViewingOrder(null)} className="p-2 hover:bg-bg-dark rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase text-text-muted tracking-widest">Customer Information</h4>
                    <div className="glass-card p-4 space-y-1">
                      <p className="font-bold">{viewingOrder.shipping?.firstName} {viewingOrder.shipping?.lastName}</p>
                      <p className="text-sm text-text-secondary">{viewingOrder.shipping?.email}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase text-text-muted tracking-widest">Shipping Address</h4>
                    <div className="glass-card p-4 space-y-1 text-sm">
                      <p>{viewingOrder.shipping?.address}</p>
                      <p>{viewingOrder.shipping?.city}, {viewingOrder.shipping?.zipCode}</p>
                      <p>{viewingOrder.shipping?.country}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase text-text-muted tracking-widest">Order Items</h4>
                  <div className="space-y-3">
                    {viewingOrder.items?.map((item: any, i: number) => (
                      <div key={i} className="flex gap-4 items-center bg-bg-dark/50 p-3 rounded-xl border border-white/5">
                        <img src={item.image} alt="" className="w-12 h-12 object-cover rounded-lg" />
                        <div className="flex-grow">
                          <p className="text-sm font-bold truncate">{item.title}</p>
                          <p className="text-xs text-text-muted">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-mono font-bold">{formatPrice(item.price, item.currencyCode)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                    <span className="font-bold uppercase tracking-widest text-xs">Total Amount</span>
                    <span className="text-xl font-display font-black text-brand-orange">
                      {formatPrice(viewingOrder.total?.toString(), viewingOrder.currency)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => {
                    handleUpdateOrderStatus(viewingOrder.id, 'shipped');
                    setViewingOrder({...viewingOrder, status: 'shipped'});
                  }}
                  className="btn-secondary flex-1 py-4 flex items-center justify-center gap-2"
                >
                  <Truck size={20} /> Mark as Shipped
                </button>
                <button 
                  onClick={() => {
                    handleUpdateOrderStatus(viewingOrder.id, 'completed');
                    setViewingOrder({...viewingOrder, status: 'completed'});
                  }}
                  className="btn-primary flex-1 py-4 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={20} /> Mark as Completed
                </button>
                <button 
                  onClick={() => handleDeleteOrder(viewingOrder.id)}
                  className="p-4 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-xl transition-colors"
                  title="Delete Order"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Product Modal */}
      <AnimatePresence>
        {editingProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingProduct(null)}
              className="absolute inset-0 bg-black/95 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-surface border border-white/5 p-8 rounded-3xl w-full max-w-2xl space-y-6 shadow-2xl z-[101]"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-display font-black uppercase italic">Edit Product</h2>
                <button onClick={() => setEditingProduct(null)} className="p-2 hover:bg-bg-dark rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleSaveProduct} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-text-muted">Title</label>
                  <input 
                    type="text" 
                    value={editingProduct.title}
                    onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })}
                    className="w-full bg-bg-dark border border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-orange transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-text-muted">Description</label>
                  <textarea 
                    value={editingProduct.description}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    className="w-full bg-bg-dark border border-white/5 rounded-xl px-4 py-3 h-32 focus:outline-none focus:border-brand-orange transition-colors resize-none"
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="submit" disabled={saving} className="btn-primary flex-grow">
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button type="button" onClick={() => setEditingProduct(null)} className="btn-secondary">
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
