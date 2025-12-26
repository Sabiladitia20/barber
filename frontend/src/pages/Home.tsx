import { Link } from 'react-router-dom';
import { Scissors, Star, Calendar } from 'lucide-react';

const Home = () => {
  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section style={{ 
        minHeight: '80vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        textAlign: 'center',
        background: 'radial-gradient(circle at center, rgba(99, 102, 241, 0.15) 0%, rgba(15, 23, 42, 0) 70%)'
      }}>
        <div className="container">
          <h1 style={{ fontSize: '4rem', fontWeight: '900', lineHeight: '1.1', marginBottom: '20px' }}>
            Elevate Your <span style={{ color: 'transparent', backgroundClip: 'text', backgroundImage: 'linear-gradient(to right, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text' }}>Style</span>
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 40px' }}>
            Experience premium grooming services tailored to your lifestyle. Book your appointment with top-tier barbers in seconds.
          </p>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
            <Link to="/register" className="btn btn-primary" style={{ padding: '16px 32px', fontSize: '1.1rem' }}>
              Book Appointment
            </Link>
            <Link to="/barbers" className="btn btn-secondary" style={{ padding: '16px 32px', fontSize: '1.1rem' }}>
              View Barbers
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '80px 0' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
          <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
            <div style={{ width: '60px', height: '60px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'var(--primary)' }}>
              <Scissors size={30} />
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>Expert Barbers</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Our team consists of highly skilled professionals dedicated to perfection.</p>
          </div>
          <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
            <div style={{ width: '60px', height: '60px', background: 'rgba(236, 72, 153, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'var(--secondary)' }}>
              <Calendar size={30} />
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>Easy Booking</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Seamless online booking experience. Choose your time and barber in clicks.</p>
          </div>
          <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
            <div style={{ width: '60px', height: '60px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'var(--accent)' }}>
              <Star size={30} />
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>Premium Service</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Relax in our modern lounge while we take care of your look.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
