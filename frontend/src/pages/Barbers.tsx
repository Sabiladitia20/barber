import { useEffect, useState } from 'react';
import api from '../utils/api';
import type { Barber, Service } from '../types';
import { Calendar, Clock, DollarSign, CheckCircle } from 'lucide-react';

const Barbers = () => {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedBarber, setSelectedBarber] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [dateTime, setDateTime] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [barbersRes, servicesRes] = await Promise.all([
          api.get('/barbers'),
          api.get('/services')
        ]);
        setBarbers(barbersRes.data);
        setServices(servicesRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const handleBooking = async () => {
    if (!selectedBarber || !selectedService || !dateTime) {
      setMessage('Please select all fields');
      return;
    }

    try {
      await api.post('/appointments', {
        barberId: selectedBarber,
        serviceId: selectedService,
        startTime: new Date(dateTime).toISOString()
      });
      setMessage('Booking successful!');
      setSelectedBarber(null);
      setSelectedService(null);
      setDateTime('');
    } catch (err: any) {
      setMessage(err.response?.data?.error || 'Booking failed');
    }
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '40px 20px' }}>
      <h1 className="section-title">Book Your Style</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
        {/* Step 1: Select Barber */}
        <div className="glass-panel" style={{ padding: '30px' }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ background: 'var(--primary)', color: 'white', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>1</span>
            Select Barber
          </h3>
          <div style={{ display: 'grid', gap: '15px' }}>
            {barbers.map((barber) => (
              <div
                key={barber.id}
                onClick={() => setSelectedBarber(barber.id)}
                style={{
                  padding: '15px',
                  borderRadius: 'var(--radius)',
                  border: `2px solid ${selectedBarber === barber.id ? 'var(--primary)' : 'transparent'}`,
                  background: selectedBarber === barber.id ? 'rgba(99, 102, 241, 0.1)' : 'var(--surface)',
                  cursor: 'pointer',
                  transition: 'var(--transition)'
                }}
              >
                <div style={{ fontWeight: 'bold' }}>{barber.name}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{barber.specialty || 'Master Barber'}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Step 2: Select Service */}
        <div className="glass-panel" style={{ padding: '30px', opacity: selectedBarber ? 1 : 0.5, pointerEvents: selectedBarber ? 'auto' : 'none' }}>
           <h3 style={{ fontSize: '1.5rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ background: 'var(--primary)', color: 'white', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>2</span>
            Select Service
          </h3>
          <div style={{ display: 'grid', gap: '15px' }}>
            {services.map((service) => (
              <div
                key={service.id}
                onClick={() => setSelectedService(service.id)}
                style={{
                  padding: '15px',
                  borderRadius: 'var(--radius)',
                  border: `2px solid ${selectedService === service.id ? 'var(--primary)' : 'transparent'}`,
                  background: selectedService === service.id ? 'rgba(99, 102, 241, 0.1)' : 'var(--surface)',
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontWeight: 'bold' }}>{service.name}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', gap: '10px', marginTop: '5px' }}>
                     <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> {service.duration} mins</span>
                  </div>
                </div>
                <div style={{ color: 'var(--success)', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                  <DollarSign size={14} />{service.price}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step 3: Select Time & Confirm */}
        <div className="glass-panel" style={{ padding: '30px', opacity: selectedService ? 1 : 0.5, pointerEvents: selectedService ? 'auto' : 'none' }}>
           <h3 style={{ fontSize: '1.5rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ background: 'var(--primary)', color: 'white', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>3</span>
            Date & Time
          </h3>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px', color: 'var(--text-secondary)' }}>Select Appointment Time</label>
            <input
              type="datetime-local"
              className="input-field"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              style={{ colorScheme: 'dark' }}
            />
          </div>

          <button 
            onClick={handleBooking}
            className="btn btn-primary"
            style={{ width: '100%', padding: '15px', fontSize: '1.1rem' }}
            disabled={!dateTime}
          >
            Confirm Booking <CheckCircle size={20} />
          </button>

          {message && (
             <div style={{ marginTop: '20px', padding: '15px', borderRadius: '8px', background: message.includes('success') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: message.includes('success') ? 'var(--success)' : 'var(--error)', textAlign: 'center' }}>
               {message}
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Barbers;
