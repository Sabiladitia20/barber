import React from 'react';
import { XCircle, CheckCircle, AlertTriangle, Info } from 'lucide-react';

interface AlertModalProps {
  isOpen: boolean;
  mode: 'alert' | 'confirm';
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  onClose: () => void;
  onConfirm: () => void;
}

const AlertModal: React.FC<AlertModalProps> = ({ isOpen, mode, type, title, message, onClose, onConfirm }) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle size={48} className="text-green-500" style={{ color: '#10b981' }} />;
      case 'error': return <XCircle size={48} className="text-red-500" style={{ color: '#ef4444' }} />;
      case 'warning': return <AlertTriangle size={48} className="text-yellow-500" style={{ color: '#f59e0b' }} />;
      default: return <Info size={48} className="text-blue-500" style={{ color: '#3b82f6' }} />;
    }
  };

  const getColor = () => {
    switch (type) {
      case 'success': return '#10b981';
      case 'error': return '#ef4444';
      case 'warning': return '#f59e0b';
      default: return '#3b82f6';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        backgroundColor: '#1e293b',
        border: `1px solid ${getColor()}`,
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '400px',
        width: '90%',
        boxShadow: `0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 0 20px ${getColor()}20`,
        textAlign: 'center',
        position: 'relative',
        animation: 'scaleUp 0.2s ease-out'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          {getIcon()}
        </div>
        
        <h3 style={{ 
          color: '#fff', 
          fontSize: '1.5rem', 
          fontWeight: 'bold', 
          marginBottom: '12px' 
        }}>
          {title}
        </h3>
        
        <p style={{ 
          color: '#94a3b8', 
          fontSize: '1rem', 
          marginBottom: '32px',
          lineHeight: '1.5'
        }}>
          {message}
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          {mode === 'confirm' && (
            <button 
              onClick={onClose}
              style={{
                padding: '12px 24px',
                borderRadius: '8px',
                backgroundColor: 'transparent',
                border: '1px solid #475569',
                color: '#cbd5e1',
                cursor: 'pointer',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#334155'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              Cancel
            </button>
          )}
          
          <button 
            onClick={() => {
              if (mode === 'confirm') onConfirm();
              else onClose();
            }}
            style={{
              padding: '12px 32px',
              borderRadius: '8px',
              backgroundColor: getColor(),
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 'bold',
              boxShadow: `0 4px 12px ${getColor()}40`,
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.filter = 'brightness(1.1)'}
            onMouseOut={(e) => e.currentTarget.style.filter = 'brightness(1)'}
          >
            {mode === 'confirm' ? 'Confirm' : 'OK'}
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleUp { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
};

export default AlertModal;
