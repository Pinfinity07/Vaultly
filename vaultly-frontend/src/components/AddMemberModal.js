'use client';

import { useState } from 'react';
import { addGroupMember } from '../lib/api';
import toast from 'react-hot-toast';
import Dialog from './ui/Dialog';
import Button from './ui/Button';
import Field from './ui/Field';
import Select from './ui/Select';

const ROLES = [
  { value: 'member', label: 'Member' },
  { value: 'admin', label: 'Admin' },
];

export default function AddMemberModal({ isOpen, onClose, onMemberAdded, group }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    setEmail('');
    setRole('member');
    setError('');
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Enter their email address');
      return;
    }
    if (!group?.id) return;

    setIsSubmitting(true);
    try {
      const response = await addGroupMember(group.id, { email: email.trim(), role });
      if (response?.error) {
        setError(response.error);
        return;
      }
      onMemberAdded(response.member);
      toast.success('Added to the group');
      handleClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      title={group ? `Add someone to ${group.name}` : 'Add someone'}
      footer={
        <>
          <Button variant="ghost" onClick={handleClose}>Cancel</Button>
          <Button type="submit" form="add-member-form" loading={isSubmitting}>Add to group</Button>
        </>
      }
    >
      <form id="add-member-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Field
          label="Email"
          type="email"
          autoComplete="off"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError('');
          }}
          error={error}
          hint="They need a Vaultly account with this email."
          data-autofocus
          required
        />
        <Select
          label="Role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          options={ROLES}
          hint="Admins can add and remove people. Everyone can add and see the group's expenses."
        />
      </form>
    </Dialog>
  );
}
