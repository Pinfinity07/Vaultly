'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, ChevronRight } from 'lucide-react';
import Navigation from '../../components/Navigation';
import CreateGroupModal from '../../components/CreateGroupModal';
import { getUserGroups, getCurrentUser } from '../../lib/api';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import PageHeader from '../../components/ui/PageHeader';
import EmptyState from '../../components/ui/EmptyState';
import Skeleton from '../../components/ui/Skeleton';
import MoneyText from '../../components/ui/MoneyText';
import { AvatarStack } from '../../components/ui/Avatar';
import { groupBalances } from '../../lib/groupBalances';

export default function GroupsPage() {
  const [groups, setGroups] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchGroups = useCallback(async () => {
    try {
      const [data, me] = await Promise.all([getUserGroups(), getCurrentUser()]);
      if (me?.user) setUserId(me.user.id);
      if (data?.success) {
        setGroups(data.groups || []);
      } else {
        toast.error(data?.error || data?.message || 'Could not load your groups');
      }
    } catch (err) {
      console.error('Error fetching groups:', err);
      toast.error('Could not load your groups');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  return (
    <div className="min-h-screen">
      <Navigation />

      <main id="main-content" className="mx-auto max-w-6xl space-y-6 px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <PageHeader
          title="Groups"
          description="Costs you share with flatmates, friends or a trip."
          actions={
            groups.length > 0 && (
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus size={16} aria-hidden="true" />
                New group
              </Button>
            )
          }
        />

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2" aria-busy="true">
            <Skeleton className="h-44 rounded-surface" />
            <Skeleton className="h-44 rounded-surface" />
          </div>
        ) : groups.length === 0 ? (
          <div className="rounded-surface border border-line bg-surface">
            <EmptyState
              title="No groups yet"
              description="Make a group for your flat or a trip, add the people in it, and log shared bills there."
              action={
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus size={16} aria-hidden="true" />
                  Create a group
                </Button>
              }
            />
          </div>
        ) : (
          <>
            <ul className="grid gap-4 md:grid-cols-2">
              {groups.map((group) => {
                const { members } = groupBalances(group);
                const me = members.find((m) => m.userId === userId);
                const net = me?.net ?? 0;
                return (
                  <li key={group.id}>
                    <Link
                      href={`/groups/${group.id}`}
                      className="group flex h-full flex-col rounded-surface border border-line bg-surface p-5 transition-colors hover:border-line-strong sm:p-6"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h2 className="truncate text-h3 font-semibold text-ink">{group.name}</h2>
                          <p className="mt-0.5 text-ui text-ink-3">
                            {group.memberCount} {group.memberCount === 1 ? 'person' : 'people'} · {group.expenses.length}{' '}
                            {group.expenses.length === 1 ? 'bill' : 'bills'}
                          </p>
                        </div>
                        <AvatarStack names={group.members.map((m) => m.user?.fullName || m.user?.email || 'Member')} />
                      </div>

                      <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-line pt-4">
                        <div>
                          <dt className="text-ui text-ink-3">Group total</dt>
                          <dd className="mt-0.5 text-body font-medium text-ink">
                            <MoneyText amount={group.totalExpenses} />
                          </dd>
                        </div>
                        <div>
                          <dt className="text-ui text-ink-3">Your balance</dt>
                          <dd className={`mt-0.5 text-body font-medium ${net > 0 ? 'text-positive' : net < 0 ? 'text-negative' : 'text-ink'}`}>
                            {group.memberCount < 2 || Math.abs(net) < 0.01 ? (
                              <span className="text-ink">Settled up</span>
                            ) : net > 0 ? (
                              <>You are owed <MoneyText amount={net} /></>
                            ) : (
                              <>You owe <MoneyText amount={-net} /></>
                            )}
                          </dd>
                        </div>
                      </dl>

                      <span className="mt-4 flex items-center gap-1 text-ui font-medium text-brand">
                        Open group
                        <ChevronRight size={16} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            <p className="text-ui text-ink-3">
              Balances assume every bill is split equally between the group&apos;s current members.
            </p>
          </>
        )}
      </main>

      <CreateGroupModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onGroupCreated={fetchGroups}
      />
    </div>
  );
}
