import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Scissors, LogOut, Calendar } from 'lucide-react';
import { AuthContext } from '../App';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)', textDecoration: 'none' }}>
        <Scissors size={28} />
        <span>Parmato</span>
      </Link>

      <div>
        {user ? (
          <>
            {user.role === 'ADMIN' && <Link to="/admin" className="btn btn-secondary" style={{ border: '1px solid var(--primary)' }}>Admin</Link>}
            <Link to="/booking" className="btn btn-secondary">Booking</Link>
            <Link to="/appointments" className="btn btn-secondary">
              <Calendar size={18} /> History
            </Link>
            <button onClick={handleLogout} className="btn btn-secondary" style={{ color: '#ef4444' }}>
              <LogOut size={18} /> Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-secondary">Sign In</Link>
            <Link to="/register" className="btn btn-primary">Get Started</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
