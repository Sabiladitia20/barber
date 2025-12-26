import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useAlert } from '../context/AlertContext';
import {
  CheckCircle,
  XCircle,
  Clock,
  Scissors,
  TrendingUp,
  Calendar as CalendarIcon,
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  Bell,
  Search,
  Menu,
  ChevronRight,
  MoreVertical,
  Briefcase,
  CalendarOff
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:8000';
const api = axios.create({ baseURL: API_URL });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const AdminDashboard = () => {
  const { showAlert, showConfirm } = useAlert();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [appointments, setAppointments] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalBookings: 0, pending: 0, confirmed: 0, revenue: 0, topBarber: null as any });
  const [barbers, setBarbers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [appts, brbrs, svcs] = await Promise.all([
        api.get('/admin/appointments'),
        api.get('/admin/barbers'),
        api.get('/services')
      ]);
      setAppointments(appts.data);
      setBarbers(brbrs.data);
      setServices(svcs.data);
    } catch (err) {
      console.error('Failed to fetch admin data', err);
      showAlert('Error', 'Failed to fetch admin data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (appointments.length > 0) {
      setStats({
        totalBookings: appointments.length,
        pending: appointments.filter(a => a.status === 'PENDING').length,
        confirmed: appointments.filter(a => a.status === 'CONFIRMED').length,
        revenue: appointments
          .filter(a => a.status === 'CONFIRMED')
          .reduce((acc, curr) => acc + curr.service.price, 0),
        topBarber: Object.entries(appointments
          .filter(a => a.status === 'CONFIRMED')
          .reduce((acc: any, curr) => {
            acc[curr.barber.name] = (acc[curr.barber.name] || 0) + 1;
            return acc;
          }, {}))
          .sort(([,a]: any, [,b]: any) => b - a)[0]
      });
    }
  }, [appointments]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/admin/appointments/${id}/status`, { status });
      const updated = appointments.map(a => a.id === id ? { ...a, status } : a);
      setAppointments(updated);
      showAlert('Success', `Appointment marked as ${status}`, 'success');
    } catch (err) {
      showAlert('Error', 'Gagal mengupdate status', 'error');
    }
  };

  const renderDashboard = () => (
    <div className="admin-fade-in">
      {/* 1. Key Metrics Section - 4 Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}><LayoutDashboard size={24} /></div>
          <div>
            <div className="stat-label">Total Bookings</div>
            <div className="stat-value">{stats.totalBookings}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}><Clock size={24} /></div>
          <div>
            <div className="stat-label">Pending</div>
            <div className="stat-value">{stats.pending}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}><CheckCircle size={24} /></div>
          <div>
            <div className="stat-label">Confirmed</div>
            <div className="stat-value">{stats.confirmed}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7' }}><TrendingUp size={24} /></div>
          <div>
            <div className="stat-label">Est. Revenue</div>
            <div className="stat-value">Rp {stats.revenue.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* 2. Content Grid - Highlights & Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>

        {/* Left Col: Top Barber & Quick Actions/Insights */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Top Barber Card */}
            <div className="stat-card" style={{ background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(236, 72, 153, 0.05))', border: '1px solid rgba(236, 72, 153, 0.2)' }}>
                <div className="stat-icon" style={{ background: 'rgba(236, 72, 153, 0.2)', color: '#ec4899' }}><Users size={24} /></div>
                <div>
                    <div className="stat-label" style={{ color: '#ec4899', fontWeight: 'bold' }}>⭐ Top Barber of the Month</div>
                    <div className="stat-value" style={{ fontSize: '1.5rem', marginTop: '8px' }}>
                        {stats.topBarber ? stats.topBarber[0] : '-'}
                    </div>
                    {stats.topBarber && (
                        <div style={{ fontSize: '0.9rem', color: '#94a3b8', marginTop: '4px' }}>
                            {stats.topBarber[1]} Complated Bookings
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Right Col: Recent Activity */}
        <div style={{ background: 'var(--card)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', padding: '24px' }}>
          <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Bell size={18} /> Recent Activity
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {appointments.length === 0 ? (
                <div style={{ color: '#555', fontStyle: 'italic' }}>No recent activity</div>
            ) : (
                appointments.slice(0, 5).map(apt => (
                    <div key={apt.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 'bold' }}>
                        {apt.user.name[0].toUpperCase()}
                        </div>
                        <div>
                        <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{apt.user.name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>booked {apt.service.name}</div>
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                         <div style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{new Date(apt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                         <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{new Date(apt.startTime).toLocaleDateString()}</div>
                    </div>
                    </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAppointments = () => (
    <div className="admin-fade-in card" style={{ padding: '0', overflow: 'hidden' }}>
      <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>Appointment Management</h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search..."
              className="input-field"
              style={{ paddingLeft: '40px', marginBottom: 0, height: '40px', width: '240px', fontSize: '0.9rem' }}
            />
          </div>
        </div>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderSpacing: '0', width: '100%' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.01)' }}>
              <th style={{ color: '#94a3b8', fontWeight: '500', fontSize: '0.85rem' }}>CUSTOMER</th>
              <th style={{ color: '#94a3b8', fontWeight: '500', fontSize: '0.85rem' }}>SERVICE</th>
              <th style={{ color: '#94a3b8', fontWeight: '500', fontSize: '0.85rem' }}>BARBER</th>
              <th style={{ color: '#94a3b8', fontWeight: '500', fontSize: '0.85rem' }}>TIME</th>
              <th style={{ color: '#94a3b8', fontWeight: '500', fontSize: '0.85rem' }}>STATUS</th>
              <th style={{ color: '#94a3b8', fontWeight: '500', fontSize: '0.85rem' }}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map(item => (
              <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ fontWeight: '600' }}>{item.user.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{item.user.email}</div>
                </td>
                <td style={{ padding: '16px 24px' }}>{item.service.name}</td>
                <td style={{ padding: '16px 24px' }}>{item.barber.name}</td>
                <td style={{ padding: '16px 24px' }}>
                  <div>{new Date(item.startTime).toLocaleDateString()}</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{new Date(item.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <span className="badge" style={{
                    background: item.status === 'CONFIRMED' ? 'rgba(16, 185, 129, 0.1)' :
                                item.status === 'PENDING' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: item.status === 'CONFIRMED' ? '#10b981' :
                           item.status === 'PENDING' ? '#f59e0b' : '#ef4444',
                  }}>
                    {item.status}
                  </span>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  {item.status === 'PENDING' ? (
                    <button onClick={() => updateStatus(item.id, 'CONFIRMED')} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Confirm</button>
                  ) : (
                    <button onClick={() => updateStatus(item.id, 'PENDING')} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Reset</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // State for CRUD
  const [editingBarber, setEditingBarber] = useState<any>(null);
  const [editingService, setEditingService] = useState<any>(null);
  const [newBarber, setNewBarber] = useState({ name: '', specialty: '' });
  const [newService, setNewService] = useState({ name: '', price: 0, duration: 30 });
  const [showBarberForm, setShowBarberForm] = useState(false);
  const [showServiceForm, setShowServiceForm] = useState(false);

  // State for Blocked Dates
  const [managingScheduleFor, setManagingScheduleFor] = useState<any>(null);
  const [newBlockDate, setNewBlockDate] = useState('');
  const [newBlockReason, setNewBlockReason] = useState('Off Day');

  // Handlers for Blocked Dates (Fix for blank page issue)
  const handleBlockDate = async () => {
    if (!newBlockDate) return showAlert('Validation', 'Please select a date', 'warning');
    try {
      await api.post(`/admin/barbers/${managingScheduleFor.id}/blocked-dates`, {
        date: newBlockDate,
        reason: newBlockReason
      });
      fetchData();
      setNewBlockDate('');
      setManagingScheduleFor(null);
      showAlert('Success', 'Date blocked successfully', 'success');
    } catch (e: any) { showAlert('Error', e.response?.data?.error || 'Failed', 'error'); }
  };

  const handleUnblockDate = async (blockedDateId: string) => {
    if (!await showConfirm('Unblock Date', 'Are you sure you want to unblock this date?')) return;
    try {
      await api.delete(`/admin/blocked-dates/${blockedDateId}`);
      fetchData();
      setManagingScheduleFor(null);
      showAlert('Success', 'Date unblocked successfully', 'success');
    } catch (e: any) { showAlert('Error', e.response?.data?.error || 'Failed', 'error'); }
  };

  // CRUD Handlers - Barber
  const handleCreateBarber = async () => {
    try {
      await api.post('/admin/barbers', newBarber);
      fetchData();
      setShowBarberForm(false);
      setNewBarber({ name: '', specialty: '' });
      showAlert('Success', 'Barber added successfully', 'success');
    } catch (e: any) { showAlert('Error', e.response?.data?.error || 'Failed', 'error'); }
  };

  const handleUpdateBarber = async () => {
    try {
      await api.put(`/admin/barbers/${editingBarber.id}`, editingBarber);
      fetchData();
      setEditingBarber(null);
      showAlert('Success', 'Barber updated successfully', 'success');
    } catch (e: any) { showAlert('Error', e.response?.data?.error || 'Failed', 'error'); }
  };

  const handleDeleteBarber = async (id: string) => {
    if (!await showConfirm('Delete Barber', 'Are you sure you want to delete this barber? This cannot be undone.')) return;
    try {
      await api.delete(`/admin/barbers/${id}`);
      fetchData();
      showAlert('Deleted', 'Barber deleted successfully', 'success');
    } catch (e: any) { showAlert('Error', e.response?.data?.error || 'Failed', 'error'); }
  };

  // CRUD Handlers - Service
  const handleCreateService = async () => {
    try {
      await api.post('/admin/services', newService);
      fetchData();
      setShowServiceForm(false);
      setNewService({ name: '', price: 0, duration: 30 });
      showAlert('Success', 'Service added successfully', 'success');
    } catch (e: any) { showAlert('Error', e.response?.data?.error || 'Failed', 'error'); }
  };

  const handleUpdateService = async () => {
    try {
      await api.put(`/admin/services/${editingService.id}`, editingService);
      fetchData();
      setEditingService(null);
      showAlert('Success', 'Service updated successfully', 'success');
    } catch (e: any) { showAlert('Error', e.response?.data?.error || 'Failed', 'error'); }
  };

  const handleDeleteService = async (id: string) => {
    if (!await showConfirm('Delete Service', 'Are you sure you want to delete this service?')) return;
    try {
      await api.delete(`/admin/services/${id}`);
      fetchData();
      showAlert('Deleted', 'Service deleted successfully', 'success');
    } catch (e: any) { showAlert('Error', e.response?.data?.error || 'Failed', 'error'); }
  };

  const renderBarbers = () => (
    <div className="admin-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h3>Barbers</h3>
        <button onClick={() => setShowBarberForm(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          + Add Barber
        </button>
      </div>


      {showBarberForm && (
        <div className="card" style={{ marginBottom: '24px', border: '1px solid var(--primary)' }}>
          <h4>New Barber</h4>
          <div style={{ display: 'grid', gap: '12px', marginTop: '12px' }}>
             <input className="input-field" placeholder="Name" value={newBarber.name} onChange={e => setNewBarber({...newBarber, name: e.target.value})} />
             <input className="input-field" placeholder="Specialty" value={newBarber.specialty} onChange={e => setNewBarber({...newBarber, specialty: e.target.value})} />
             <div style={{ display: 'flex', gap: '8px' }}>
               <button onClick={handleCreateBarber} className="btn btn-primary">Save</button>
               <button onClick={() => setShowBarberForm(false)} className="btn btn-secondary">Cancel</button>
             </div>
          </div>
        </div>
      )}

      {managingScheduleFor && (
        <div style={{ 
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
            background: 'rgba(0,0,0,0.8)', zIndex: 1000, 
            display: 'flex', alignItems: 'center', justifyContent: 'center' 
        }}>
            <div className="card" style={{ width: '400px', maxWidth: '90%' }}>
                <h3 style={{ marginBottom: '16px' }}>Manage Off Days: {managingScheduleFor.name}</h3>
                
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Add Off Day</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <input type="date" className="input-field" value={newBlockDate} onChange={e => setNewBlockDate(e.target.value)} />
                        <button onClick={handleBlockDate} className="btn btn-primary">Add</button>
                    </div>
                </div>

                <h4 style={{ marginBottom: '12px' }}>Upcoming Off Days</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                    {managingScheduleFor.blockedDates && managingScheduleFor.blockedDates.length > 0 ? (
                        managingScheduleFor.blockedDates.map((bd: any) => (
                            <div key={bd.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '8px 12px', borderRadius: '8px' }}>
                                <span>{new Date(bd.date).toLocaleDateString()}</span>
                                <button onClick={() => handleUnblockDate(bd.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                                    <XCircle size={16} />
                                </button>
                            </div>
                        ))
                    ) : (
                        <div style={{ color: '#94a3b8', fontStyle: 'italic' }}>No off days scheduled</div>
                    )}
                </div>

                <div style={{ marginTop: '20px', textAlign: 'right' }}>
                    <button onClick={() => setManagingScheduleFor(null)} className="btn btn-secondary">Close</button>
                </div>
            </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
        {barbers.map(b => (
          <div key={b.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {editingBarber?.id === b.id ? (
               <div style={{ width: '100%' }}>
                  <input className="input-field" value={editingBarber.name} onChange={e => setEditingBarber({...editingBarber, name: e.target.value})} />
                  <input className="input-field" value={editingBarber.specialty} onChange={e => setEditingBarber({...editingBarber, specialty: e.target.value})} />
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <button onClick={handleUpdateBarber} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Save</button>
                    <button onClick={() => setEditingBarber(null)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Cancel</button>
                  </div>
               </div>
            ) : (
              <>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                  <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}>
                    <Users size={24} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0 }}>{b.name}</h4>
                    <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{b.specialty || 'General Barber'}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                   <button onClick={() => setManagingScheduleFor(b)} className="btn btn-secondary" style={{ padding: '8px', color: '#f59e0b' }} title="Manage Off Days"><CalendarOff size={16} /></button>
                   <button onClick={() => setEditingBarber(b)} className="btn btn-secondary" style={{ padding: '8px' }}><Settings size={16} /></button>
                   <button onClick={() => handleDeleteBarber(b.id)} className="btn btn-secondary" style={{ padding: '8px', color: '#ef4444' }}><XCircle size={16} /></button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderServices = () => (
    <div className="admin-fade-in card" style={{ padding: '24px' }}>
       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h3>Services</h3>
        <button onClick={() => setShowServiceForm(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          + Add Service
        </button>
      </div>

      {showServiceForm && (
        <div style={{ marginBottom: '24px', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
          <h4>New Service</h4>
          <div style={{ display: 'grid', gap: '12px', marginTop: '12px' }}>
             <input className="input-field" placeholder="Service Name" value={newService.name} onChange={e => setNewService({...newService, name: e.target.value})} />
             <div style={{ display: 'flex', gap: '12px' }}>
               <input type="number" className="input-field" placeholder="Price" value={newService.price} onChange={e => setNewService({...newService, price: Number(e.target.value)})} />
               <input type="number" className="input-field" placeholder="Duration (mins)" value={newService.duration} onChange={e => setNewService({...newService, duration: Number(e.target.value)})} />
             </div>
             <div style={{ display: 'flex', gap: '8px' }}>
               <button onClick={handleCreateService} className="btn btn-primary">Save</button>
               <button onClick={() => setShowServiceForm(false)} className="btn btn-secondary">Cancel</button>
             </div>
          </div>
        </div>
      )}

       <table style={{ width: '100%', borderSpacing: 0 }}>
         <thead>
           <tr style={{ background: 'rgba(255,255,255,0.01)' }}>
             <th style={{ padding: '16px 24px', color: '#94a3b8', textAlign: 'left' }}>SERVICE NAME</th>
             <th style={{ padding: '16px 24px', color: '#94a3b8', textAlign: 'left' }}>DURATION</th>
             <th style={{ padding: '16px 24px', color: '#94a3b8', textAlign: 'left' }}>PRICE</th>
             <th style={{ padding: '16px 24px', color: '#94a3b8', textAlign: 'right' }}>ACTIONS</th>
           </tr>
         </thead>
         <tbody>
           {services.map(s => (
             <tr key={s.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
               {editingService?.id === s.id ? (
                 <>
                   <td style={{ padding: '16px 24px' }}><input className="input-field" value={editingService.name} onChange={e => setEditingService({...editingService, name: e.target.value})} style={{ marginBottom: 0 }} /></td>
                   <td style={{ padding: '16px 24px' }}><input type="number" className="input-field" value={editingService.duration} onChange={e => setEditingService({...editingService, duration: Number(e.target.value)})} style={{ marginBottom: 0, width: '80px' }} /></td>
                   <td style={{ padding: '16px 24px' }}><input type="number" className="input-field" value={editingService.price} onChange={e => setEditingService({...editingService, price: Number(e.target.value)})} style={{ marginBottom: 0, width: '120px' }} /></td>
                   <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button onClick={handleUpdateService} className="btn btn-primary" style={{ padding: '6px' }}><CheckCircle size={16} /></button>
                        <button onClick={() => setEditingService(null)} className="btn btn-secondary" style={{ padding: '6px' }}><XCircle size={16} /></button>
                      </div>
                   </td>
                 </>
               ) : (
                 <>
                   <td style={{ padding: '16px 24px' }}>
                      <div style={{ fontWeight: '600' }}>{s.name}</div>
                   </td>
                   <td style={{ padding: '16px 24px', color: '#94a3b8' }}>{s.duration} mins</td>
                   <td style={{ padding: '16px 24px', fontWeight: 'bold' }}>Rp {s.price.toLocaleString()}</td>
                   <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button onClick={() => setEditingService(s)} className="btn btn-secondary" style={{ padding: '6px' }}><Settings size={16} /></button>
                        <button onClick={() => handleDeleteService(s.id)} className="btn btn-secondary" style={{ padding: '6px', color: '#ef4444' }}><XCircle size={16} /></button>
                      </div>
                   </td>
                 </>
               )}
             </tr>
           ))}
         </tbody>
       </table>
    </div>
  );

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#07070a', color: '#fff' }}>
      <style>{`
        .admin-sidebar {
          width: 260px;
          background: #101017;
          border-right: 1px solid rgba(255,255,255,0.05);
          display: flex;
          flex-direction: column;
          padding: 24px;
          transition: all 0.3s ease;
          z-index: 100;
        }
        .admin-sidebar.closed { width: 0; padding: 0; overflow: hidden; border: none; }
        .sidebar-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 12px;
          color: #94a3b8;
          text-decoration: none;
          cursor: pointer;
          transition: 0.2s;
          margin-bottom: 4px;
        }
        .sidebar-item:hover { background: rgba(255,255,255,0.03); color: #fff; }
        .sidebar-item.active { background: #6366f1; color: #fff; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3); }
        .admin-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
        .admin-navbar {
          height: 70px;
          background: rgba(16, 16, 23, 0.8);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255,255,255,0.05);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 32px;
        }
        .admin-content { flex: 1; overflow-y: auto; padding: 32px; background: #07070a; }
        .stat-card { background: var(--card); padding: 24px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.05); display: flex; gap: 16px; align-items: center; }
        .stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; alignItems: center; justifyContent: center; }
        .stat-label { color: #94a3b8; font-size: 0.85rem; }
        .stat-value { font-size: 1.5rem; fontWeight: 800; }
        .admin-fade-in { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Sidebar */}
      <aside className={`admin-sidebar ${!isSidebarOpen ? 'closed' : ''}`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px', padding: '0 8px' }}>
          <Scissors size={28} color="#6366f1" />
          <span style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-1px' }}>ParmatoAdmin</span>
        </div>

        <div style={{ flex: 1 }}>
          <div className={`sidebar-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <LayoutDashboard size={20} /> Dashboard
          </div>
          <div className={`sidebar-item ${activeTab === 'appointments' ? 'active' : ''}`} onClick={() => setActiveTab('appointments')}>
            <CalendarIcon size={20} /> Appointments
          </div>
          <div className={`sidebar-item ${activeTab === 'barbers' ? 'active' : ''}`} onClick={() => setActiveTab('barbers')}>
            <Users size={20} /> Barbers
          </div>
          <div className={`sidebar-item ${activeTab === 'services' ? 'active' : ''}`} onClick={() => setActiveTab('services')}>
            <Briefcase size={20} /> Services
          </div>
        </div>

        <div className="sidebar-item" onClick={handleLogout} style={{ color: '#ef4444' }}>
          <LogOut size={20} /> Logout
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {/* Navbar */}
        <header className="admin-navbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
              <Menu size={24} />
            </button>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '600' }}>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <button style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><Bell size={20} /></button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '24px', borderLeft: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>Admin Parmato</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Super Admin</div>
              </div>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}></div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <section className="admin-content">
          {loading ? (
             <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
               <div className="animate-spin" style={{ color: '#6366f1' }}><Scissors size={40} /></div>
             </div>
          ) : (
            <>
              {activeTab === 'dashboard' && renderDashboard()}
              {activeTab === 'appointments' && renderAppointments()}
              {activeTab === 'barbers' && renderBarbers()}
              {activeTab === 'services' && renderServices()}
            </>
          )}
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;
