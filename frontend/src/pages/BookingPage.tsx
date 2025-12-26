import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Scissors, 
  Calendar, 
  Clock, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  User, 
  Info, 
  Loader2,
  Droplets,
  Palette,
  Sparkles,
  Zap,
  Star,
  MapPin,
  Store,
  X
} from 'lucide-react';
import api from '../utils/api';

const getLocalDateString = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// --- DATA DUMMY STYLE GALLERY ---
const STYLES = [
  { id: 1, name: 'Low Fade', img: '/style_fade.png', desc: 'Clean & Sharp Side Profile' },
  { id: 2, name: 'Textured Crop', img: '/style_crop.png', desc: 'Modern & Trendy Look' },
  { id: 3, name: 'Classic Pomp', img: '/style_classic.png', desc: 'Elegant & Timeless' },
];

import { useAlert } from '../context/AlertContext';

// ...

const BookingPage = () => {
  const { showAlert } = useAlert();
  const [services, setServices] = useState<any[]>([]);
  const [selectedSvc, setSelectedSvc] = useState<any | null>(null);
  const [date, setDate] = useState(new Date());
  const [barbers, setBarbers] = useState<any[]>([]);
  const [selBarber, setSelBarber] = useState<any | null>(null);
  const [selSlot, setSelSlot] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => { 
    api.get('/services').then(r => setServices(r.data)); 
  }, []);

  useEffect(() => {
    setLoading(true);
    // Reset slot selection when date changes
    setSelSlot(null);
    setSelBarber(null);
    
    api.get(`/slots/schedule?date=${getLocalDateString(date)}`)
       .then(r => setBarbers(r.data))
       .finally(() => setLoading(false));
  }, [date]);

  const handleBooking = async () => {
    if (!selectedSvc || !selBarber || !selSlot) return;
    try {
      await api.post('/appointments', { 
        barberId: selBarber.id, 
        serviceId: selectedSvc.id, 
        date: getLocalDateString(date), 
        time: selSlot 
      });
      await showAlert('Booking Successful', 'Your appointment has been confirmed!', 'success');
      navigate('/appointments');
    } catch (e: any) { 
        showAlert('Booking Failed', e.response?.data?.error || 'Failed to create booking', 'error'); 
    }
  };

  const getServiceIcon = (name: string) => {
      const n = name.toLowerCase();
      if (n.includes('cut')) return <Scissors size={24} />;
      if (n.includes('wash')) return <Droplets size={24} />;
      if (n.includes('color')) return <Palette size={24} />;
      if (n.includes('shave')) return <Sparkles size={24} />;
      return <Zap size={24} />;
  }

  // Helper to format currency
  const fmt = (n: number) => 'Rp ' + n.toLocaleString();

  return (
    <div className="app-container">
      
      {/* 1. Header & Location */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
         <h1 className="section-title">Book Your Appointment</h1>
         <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#94a3b8' }}>
            <MapPin size={18} />
            <span>Parmato Main Studio, Jakarta</span>
         </div>
      </div>

      {/* 2. STYLE GALLERY (Inspiration) */}
      <div style={{ marginBottom: '50px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Looking for Inspiration?</h3>
            <span style={{ fontSize: '0.9rem', color: '#D4AF37', cursor: 'pointer' }}>View Gallery</span>
        </div>
        <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '10px' }}>
            {STYLES.map(style => (
                <div key={style.id} className="card" style={{ padding: 0, minWidth: '240px', overflow: 'hidden', cursor: 'pointer' }}>
                    <div style={{ height: '160px', background: '#222', backgroundImage: `url(${style.img})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                    <div style={{ padding: '16px' }}>
                        <div style={{ fontWeight: 'bold' }}>{style.name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{style.desc}</div>
                    </div>
                </div>
            ))}
        </div>
      </div>


      {/* 3. SELECT SERVICE (Redesigned: Interactive Tiles) */}
      <div className="app-container">
        <h2 style={{ 
            textAlign: 'center', 
            fontSize: '2rem', 
            marginBottom: '30px',
            color: '#fff',
            textTransform: 'uppercase',
            letterSpacing: '2px'
        }}>
            Select Service
        </h2>
        
        <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', 
            gap: '20px' 
        }}>
          {services.map(s => {
            const isPremium = s.price >= 100000;
            const isSelected = selectedSvc?.id === s.id;
            
            return (
                <div 
                    key={s.id} 
                    onClick={() => setSelectedSvc(s)}
                    className="service-card"
                    style={{ 
                        position: 'relative',
                        cursor: 'pointer', 
                        background: isSelected 
                            ? (isPremium ? 'linear-gradient(135deg, #D4AF37 0%, #AA771C 100%)' : '#fff') 
                            : 'rgba(255,255,255,0.03)',
                        border: isSelected 
                            ? 'none' 
                            : isPremium ? '1px solid rgba(212, 175, 55, 0.3)' : '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '16px',
                        padding: '24px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                        transform: isSelected ? 'translateY(-5px)' : 'none',
                        boxShadow: isSelected 
                            ? (isPremium ? '0 10px 30px rgba(212, 175, 55, 0.4)' : '0 10px 30px rgba(255, 255, 255, 0.2)') 
                            : 'none',
                        overflow: 'hidden'
                    }}
                >   
                    {/* Premium Label */}
                    {isPremium && !isSelected && (
                        <div style={{ 
                            position: 'absolute', top: '12px', right: '12px', 
                            background: 'rgba(212, 175, 55, 0.1)', color: '#D4AF37', 
                            fontSize: '0.7rem', padding: '4px 8px', borderRadius: '20px', 
                            fontWeight: 'bold', border: '1px solid rgba(212, 175, 55, 0.2)'
                        }}>
                            SIGNATURE
                        </div>
                    )}

                    <div style={{ 
                        marginBottom: '16px', 
                        color: isSelected ? (isPremium ? '#fff' : '#000') : (isPremium ? '#D4AF37' : '#94a3b8'),
                        transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                        transition: 'transform 0.3s'
                    }}>
                        {getServiceIcon(s.name)}
                    </div>
                    
                    <div style={{ 
                        fontWeight: '700', 
                        fontSize: '1.2rem', 
                        marginBottom: '8px', 
                        color: isSelected ? (isPremium ? '#fff' : '#000') : '#fff',
                        lineHeight: '1.2'
                    }}>
                        {s.name}
                    </div>

                    <div style={{ 
                        fontSize: '0.9rem', 
                        color: isSelected ? (isPremium ? 'rgba(255,255,255,0.9)' : '#555') : '#94a3b8',
                        marginBottom: '16px' 
                    }}>
                        {s.duration} mins
                    </div>

                    <div style={{ 
                         background: isSelected ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.05)',
                         padding: '6px 16px',
                         borderRadius: '30px',
                         fontWeight: 'bold',
                         fontSize: '1rem',
                         color: isSelected ? (isPremium ? '#fff' : '#000') : (isPremium ? '#D4AF37' : '#fff')
                    }}>
                        {fmt(s.price)}
                    </div>
                </div>
            );
          })}
        </div>
      </div>

      {/* 4. SELECT DATE */}
      <div style={{ marginBottom: '40px', background: 'var(--card)', padding: '20px', borderRadius: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
             <h3 style={{ margin: 0 }}>2. Select Date</h3>
             <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                {date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
             </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button className="btn btn-secondary" onClick={() => { const d = new Date(date); d.setDate(d.getDate()-1); setDate(d) }}>
             <ChevronLeft size={20} /> Prev Day
          </button>
          
          <button className="btn btn-secondary" onClick={() => { const d = new Date(date); d.setDate(d.getDate()+1); setDate(d) }}>
             Next Day <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* 5. SELECT BARBER & TIME */}
      <div style={{ marginBottom: '40px' }}>
        <h3 style={{ marginBottom: '20px' }}>3. Select Barber & Time</h3>
        {loading ? (
             <div style={{ textAlign: 'center', padding: '40px' }}><Loader2 className="animate-spin" size={32} /></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {barbers.map(b => (
              <div key={b.barber.id} className="card" style={{ padding: '24px' }}>
                {/* Barber Profile */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, #333, #555)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>
                         {b.barber.name.charAt(0)}
                    </div>
                    <div>
                        <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{b.barber.name}</div>
                        <div style={{ color: 'var(--primary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Star size={14} fill="currentColor" /> Expert Barber
                        </div>
                         <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px' }}>
                            {b.barber.specialty || 'General Hairstylist'}
                         </div>
                    </div>
                </div>
                
                {/* Time Slots */}
                 <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {b.slots.map((s: any) => {
                     const isSelected = selBarber?.id === b.barber.id && selSlot === s.time;
                     const isAvailable = s.available;

                     return (
                        <button 
                            key={s.time} 
                            disabled={!isAvailable} 
                            onClick={() => { setSelBarber(b.barber); setSelSlot(s.time) }} 
                            className={`btn`} 
                            style={{ 
                                background: isSelected ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                                border: isSelected ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.1)',
                                color: isSelected ? '#fff' : isAvailable ? '#fff' : '#4b5563',
                                cursor: isAvailable ? 'pointer' : 'not-allowed',
                                minWidth: '80px',
                                opacity: isAvailable ? 1 : 0.5,
                                textDecoration: isAvailable ? 'none' : 'line-through'
                            }}
                        >
                            {s.time}
                        </button>
                     );
                  })}
                 </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CONFIRMATION BUTTON - STICKY */}
      {selectedSvc && selBarber && selSlot && (
         <div style={{ 
            position: 'fixed', 
            bottom: '20px', 
            left: '50%', 
            transform: 'translateX(-50%)', 
            width: '90%', 
            maxWidth: '600px', 
            zIndex: 100 
         }}>
            <button 
                onClick={() => setShowConfirm(true)} 
                className="btn btn-primary" 
                style={{ 
                    width: '100%', 
                    padding: '20px', 
                    fontSize: '1.2rem', 
                    borderRadius: '50px', 
                    boxShadow: '0 10px 25px rgba(99, 102, 241, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px'
                }}
            >
                Review & Confirm Booking <ChevronRight />
            </button>
         </div>
      )}

      {/* BOOKING MODAL */}
      {showConfirm && (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)',
            display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
           <div className="card" style={{ width: '90%', maxWidth: '500px', padding: '32px', position: 'relative', border: '1px solid var(--primary)' }}>
               <button onClick={() => setShowConfirm(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                   <X size={24} />
               </button>

               <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>Confirm Booking</h2>
               
               <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '12px', marginBottom: '24px' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                       <span style={{ color: '#94a3b8' }}>Service</span>
                       <span style={{ fontWeight: 'bold' }}>{selectedSvc?.name}</span>
                   </div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                       <span style={{ color: '#94a3b8' }}>Barber</span>
                       <span style={{ fontWeight: 'bold' }}>{selBarber?.name}</span>
                   </div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                       <span style={{ color: '#94a3b8' }}>Date</span>
                       <span style={{ fontWeight: 'bold' }}>{date.toLocaleDateString()}</span>
                   </div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                       <span style={{ color: '#94a3b8' }}>Time</span>
                       <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{selSlot}</span>
                   </div>
                   <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '16px', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem' }}>
                       <span>Total</span>
                       <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{fmt(selectedSvc?.price)}</span>
                   </div>
               </div>

               <div style={{ display: 'flex', gap: '16px' }}>
                   <button onClick={() => setShowConfirm(false)} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
                   <button onClick={handleBooking} className="btn btn-primary" style={{ flex: 1 }}>Confirm Booking</button>
               </div>
           </div>
        </div>
      )}

    </div>
  );
}

export default BookingPage;
