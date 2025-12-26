import { useEffect, useState } from 'react';
import api from '../utils/api';
import type { Appointment } from '../types';
import { Calendar, Clock, User, Scissors } from 'lucide-react';

const Dashboard = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await api.get('/appointments/my');
        setAppointments(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAppointments();
  }, []);

  return (
    <div className="container animate-fade-in" style={{ padding: '40px 20px' }}>
      <h1 className="section-title">My Appointments</h1>

      {appointments.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '50px' }}>
          <p style={{ fontSize: '1.2rem' }}>You have no upcoming appointments.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {appointments.map((apt) => (
            <div key={apt.id} className="glass-panel" style={{ padding: '25px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'linear-gradient(to bottom, var(--primary), var(--secondary))' }}></div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
                <div>
                   <h3 style={{ fontSize: '1.2rem', margin: 0 }}>{apt.service.name}</h3>
                   <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px', marginTop: '5px', display: 'inline-block' }}>
                     {apt.status}
                   </span>
                </div>
                <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '10px', borderRadius: '50%', color: 'var(--primary)' }}>
                  <Scissors size={24} />
                </div>
              </div>

              <div style={{ display: 'grid', gap: '15px', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <User size={18} style={{ color: 'var(--accent)' }} />
                  <span style={{ color: 'var(--text)' }}>{apt.barber.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Calendar size={18} style={{ color: 'var(--accent)' }} />
                  <span>{new Date(apt.startTime).toLocaleDateString()}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Clock size={18} style={{ color: 'var(--accent)' }} />
                  <span>{new Date(apt.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
