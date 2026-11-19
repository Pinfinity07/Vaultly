'use client';

import { useState } from 'react';
import { createGroup } from '../lib/api';
import toast from 'react-hot-toast';
import Dialog from './ui/Dialog';
import Button from './ui/Button';
import Field from './ui/Field';

export default function CreateGroupModal({ isOpen, onClose, onGroupCreated }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    setName('');
    setError('');
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Give the group a name');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await createGroup({ name: name.trim() });
      if (response?.error) {
        setError(response.error);
        return;
      }
      onGroupCreated(response.group);
      toast.success('Group created');
      handleClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      title="New group"
      description="For a flat, a trip or anything you split. You can add people next."
      footer={
        <>
          <Button variant="ghost" onClick={handleClose}>Cancel</Button>
          <Button type="submit" form="create-group-form" loading={isSubmitting}>Create group</Button>
        </>
      }
    >
      <form id="create-group-form" onSubmit={handleSubmit} noValidate>
        <Field
          label="Group name"
          placeholder="Flat 4B, Goa trip…"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError('');
          }}
          error={error}
          data-autofocus
          required
        />
      </form>
    </Dialog>
  );
}
