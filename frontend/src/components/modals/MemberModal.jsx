import React, { useState } from 'react';
import { X, UserPlus, AlertCircle } from 'lucide-react';

export const MemberModal = ({ isOpen, onClose, onInvite }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('member');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !name) {
      setErrorMsg('Please enter both name and email.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    try {
      await onInvite({ email, name, role });
      setEmail('');
      setName('');
      setRole('member');
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to invite member');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-dialog"
        id="invite-member-modal"
        style={{ maxWidth: '440px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <UserPlus size={18} color="var(--primary)" />
            <h3 className="modal-title">Invite Team Member</h3>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        {errorMsg && (
          <div
            style={{
              padding: '10px 24px',
              background: 'rgba(244, 63, 94, 0.1)',
              borderBottom: '1px solid rgba(244, 63, 94, 0.2)',
              color: '#fda4af',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <AlertCircle size={14} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label" htmlFor="member-name-input">
                Full Name *
              </label>
              <input
                id="member-name-input"
                type="text"
                placeholder="e.g. Jordan Lee"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ height: '38px', padding: '0 12px' }}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="member-email-input">
                Email Address *
              </label>
              <input
                id="member-email-input"
                type="email"
                placeholder="jordan@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ height: '38px', padding: '0 12px' }}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="member-role-select">
                Workspace Role
              </label>
              <select
                id="member-role-select"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{ height: '38px', padding: '0 10px' }}
              >
                <option value="member">Member (Can create, edit & update tasks)</option>
                <option value="admin">Admin (Can manage members & settings)</option>
                <option value="owner">Owner (Full administrative control)</option>
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              id="btn-confirm-invite"
              disabled={submitting}
            >
              {submitting ? 'Inviting...' : 'Send Invitation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
