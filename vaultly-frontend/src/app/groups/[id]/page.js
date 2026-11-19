'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, UserPlus, Trash2, X } from 'lucide-react';
import Navigation from '../../../components/Navigation';
import AddMemberModal from '../../../components/AddMemberModal';
import { getGroupById, getCurrentUser, removeGroupMember, deleteGroup } from '../../../lib/api';
import toast from 'react-hot-toast';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import EmptyState from '../../../components/ui/EmptyState';
import Skeleton from '../../../components/ui/Skeleton';
import MoneyText from '../../../components/ui/MoneyText';
import Avatar from '../../../components/ui/Avatar';
import { useConfirm } from '../../../components/ui/ConfirmDialog';
import { groupBalances } from '../../../lib/groupBalances';
import { formatCategory } from '../../../lib/categories';

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function GroupDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const confirm = useConfirm();
  const [group, setGroup] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);

  const fetchGroup = useCallback(async () => {
    try {
      const [data, me] = await Promise.all([getGroupById(id), getCurrentUser()]);
      if (me?.user) setUserId(me.user.id);
      if (data?.success && data.group) {
        setGroup(data.group);
      } else {
        setNotFound(true);
      }
    } catch (err) {
      console.error('Error fetching group:', err);
      toast.error('Could not load this group');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchGroup();
    window.addEventListener('expenseAdded', fetchGroup);
    return () => window.removeEventListener('expenseAdded', fetchGroup);
  }, [fetchGroup]);

  const handleRemoveMember = async (member) => {
    const name = member.user?.fullName || member.user?.email;
    const ok = await confirm({
      title: `Remove ${name} from ${group.name}?`,
      description: 'Bills they already added stay in the group. They can be added again later.',
      confirmLabel: 'Remove',
    });
    if (!ok) return;

    const data = await removeGroupMember(group.id, member.id);
    if (data?.success) {
      toast.success(`${name} removed`);
      fetchGroup();
    } else {
      toast.error(data?.error || data?.message || 'Could not remove them');
    }
  };

  const handleDeleteGroup = async () => {
    const ok = await confirm({
      title: `Delete ${group.name}?`,
      description: 'The group and its member list are deleted for everyone. Its bills stay in each person’s own expenses, without the group.',
      confirmLabel: 'Delete group',
    });
    if (!ok) return;

    const data = await deleteGroup(group.id);
    if (data?.success) {
      toast.success('Group deleted');
      router.push('/groups');
    } else {
      toast.error(data?.error || data?.message || 'Could not delete the group');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main id="main-content" className="mx-auto max-w-6xl space-y-6 px-4 pt-8 sm:px-6 lg:px-8" aria-busy="true">
          <Skeleton className="h-9 w-56" />
          <div className="grid gap-6 lg:grid-cols-5">
            <Skeleton className="h-64 rounded-surface lg:col-span-3" />
            <Skeleton className="h-64 rounded-surface lg:col-span-2" />
          </div>
        </main>
      </div>
    );
  }

  if (notFound || !group) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main id="main-content" className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 lg:px-8">
          <div className="rounded-surface border border-line bg-surface">
            <EmptyState
              title="Group not found"
              description="It may have been deleted, or you are no longer a member."
              action={<Button href="/groups" variant="secondary">Back to groups</Button>}
            />
          </div>
        </main>
      </div>
    );
  }

  const myMembership = group.members.find((m) => m.user?.id === userId);
  const isCreator = group.createdBy === userId;
  const isAdmin = isCreator || myMembership?.role === 'admin';
  const { members: balances, settlements } = groupBalances(group);
  const expenses = [...group.expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
  const nameOf = (m) => (m.userId === userId ? 'You' : m.name);

  return (
    <div className="min-h-screen">
      <Navigation />

      <main id="main-content" className="mx-auto max-w-6xl space-y-6 px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <Link href="/groups" className="inline-flex h-10 items-center gap-1.5 rounded-control text-ui font-medium text-ink-3 hover:text-ink">
          <ArrowLeft size={16} aria-hidden="true" />
          All groups
        </Link>

        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-h2 font-semibold text-ink">{group.name}</h1>
            <p className="mt-1 text-body text-ink-3">
              <MoneyText amount={group.totalExpenses} className="font-medium text-ink" /> across {group.expenses.length}{' '}
              {group.expenses.length === 1 ? 'bill' : 'bills'} · created by {isCreator ? 'you' : group.creator?.fullName}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {isAdmin && (
              <Button variant="secondary" onClick={() => setShowAddMember(true)}>
                <UserPlus size={16} aria-hidden="true" />
                Add person
              </Button>
            )}
            {isCreator && (
              <Button variant="ghost" onClick={handleDeleteGroup} className="hover:text-negative">
                <Trash2 size={16} aria-hidden="true" />
                Delete group
              </Button>
            )}
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-5">
          <Card title="Who owes whom" description="If every bill is split equally between current members." className="lg:col-span-3">
            {balances.length < 2 ? (
              <p className="text-body text-ink-3">Add someone to the group to see who owes what.</p>
            ) : settlements.length === 0 ? (
              <p className="text-body text-ink">Everyone is settled up.</p>
            ) : (
              <ul className="space-y-3">
                {settlements.map((s) => (
                  <li key={`${s.from.userId}-${s.to.userId}`} className="flex flex-wrap items-center gap-x-2 gap-y-1 text-body text-ink">
                    <span className="font-medium">{nameOf(s.from)}</span>
                    <ArrowRight size={16} className="text-ink-3" aria-label="pays" />
                    <span className="font-medium">{nameOf(s.to)}</span>
                    <MoneyText amount={s.amount} mono className="ml-auto font-medium" />
                  </li>
                ))}
              </ul>
            )}

            {balances.length >= 2 && (
              <>
              <p className="mt-6 text-ui text-ink-3 sm:hidden">
                Equal share: <MoneyText amount={balances[0].share} /> each
              </p>
              <table className="mt-2 w-full text-ui sm:mt-6">
                <caption className="sr-only">What each person paid and their equal share</caption>
                <thead>
                  <tr className="border-b border-line text-left text-meta uppercase tracking-wide text-ink-3">
                    <th scope="col" className="py-2 font-medium">Person</th>
                    <th scope="col" className="py-2 text-right font-medium">Paid</th>
                    <th scope="col" className="hidden py-2 text-right font-medium sm:table-cell">Share</th>
                    <th scope="col" className="py-2 text-right font-medium">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {balances.map((m) => (
                    <tr key={m.userId}>
                      <th scope="row" className="py-2.5 text-left font-normal text-ink">{nameOf(m)}</th>
                      <td className="py-2.5 text-right"><MoneyText amount={m.paid} mono /></td>
                      <td className="hidden py-2.5 text-right text-ink-3 sm:table-cell"><MoneyText amount={m.share} mono /></td>
                      <td className={`py-2.5 text-right ${m.net > 0 ? 'text-positive' : m.net < 0 ? 'text-negative' : 'text-ink'}`}>
                        <MoneyText amount={m.net} signed mono />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </>
            )}
          </Card>

          <Card title="People" padded={false} className="lg:col-span-2">
            <ul className="divide-y divide-line">
              {group.members.map((member) => {
                const name = member.user?.fullName || member.user?.email;
                const isMe = member.user?.id === userId;
                const canRemove = isAdmin && !isMe && member.user?.id !== group.createdBy;
                return (
                  <li key={member.id} className="flex items-center gap-3 px-5 py-3 sm:px-6">
                    <Avatar name={name} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-body text-ink">
                        {name}
                        {isMe && <span className="text-ink-3"> (you)</span>}
                      </p>
                      <p className="truncate text-ui text-ink-3">
                        {member.user?.email}
                        {member.role === 'admin' && ' · Admin'}
                      </p>
                    </div>
                    {canRemove && (
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveMember(member)} aria-label={`Remove ${name}`} className="hover:text-negative">
                        <X size={16} aria-hidden="true" />
                      </Button>
                    )}
                  </li>
                );
              })}
            </ul>
          </Card>
        </div>

        <Card title="Bills" description="Add one with Add expense and choose this group under Shared with." padded={false}>
          {expenses.length === 0 ? (
            <p className="px-5 pb-6 text-body text-ink-3 sm:px-6">No shared bills yet.</p>
          ) : (
            <ul className="divide-y divide-line">
              {expenses.map((expense) => (
                <li key={expense.id} className="flex items-center justify-between gap-4 px-5 py-3.5 sm:px-6">
                  <div className="min-w-0">
                    <p className="truncate text-body text-ink">{expense.description || formatCategory(expense.category?.name)}</p>
                    <p className="mt-0.5 text-ui text-ink-3">
                      Paid by {expense.user?.id === userId ? 'you' : expense.user?.fullName} · {formatDate(expense.date)}
                    </p>
                  </div>
                  <MoneyText amount={expense.amount} mono className="shrink-0 text-body text-ink" />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </main>

      <AddMemberModal
        isOpen={showAddMember}
        group={group}
        onClose={() => setShowAddMember(false)}
        onMemberAdded={fetchGroup}
      />
    </div>
  );
}
