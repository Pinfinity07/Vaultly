"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  Users2,
  Target,
  BarChart3,
  User,
  LogOut,
  Plus,
  Eye,
  EyeOff,
  Search,
} from "lucide-react";
import Dialog from "./ui/Dialog";
import { usePreferences } from "../lib/preferences";

/**
 * Cmd/Ctrl+K: add an expense, jump to a page, toggle amounts, sign out.
 * ARIA combobox: focus stays in the input, arrows move the active option.
 */
export default function CommandPalette({ open, onClose, onAddExpense, onLogout }) {
  const router = useRouter();
  const hideAmounts = usePreferences((s) => s.hideAmounts);
  const setHideAmounts = usePreferences((s) => s.setHideAmounts);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  // Start fresh each time it opens (state reset during render, not in an effect).
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setQuery("");
      setActiveIndex(0);
    }
  }

  const commands = useMemo(() => {
    const go = (href) => () => {
      onClose();
      router.push(href);
    };
    return [
      { id: "add", group: "Actions", label: "Add expense", icon: Plus, run: onAddExpense },
      {
        id: "amounts",
        group: "Actions",
        label: hideAmounts ? "Show amounts" : "Hide amounts",
        icon: hideAmounts ? Eye : EyeOff,
        run: () => {
          setHideAmounts(!hideAmounts);
          onClose();
        },
      },
      { id: "dashboard", group: "Go to", label: "Dashboard", icon: LayoutDashboard, run: go("/dashboard") },
      { id: "expenses", group: "Go to", label: "Expenses", icon: Receipt, run: go("/expenses") },
      { id: "groups", group: "Go to", label: "Groups", icon: Users2, run: go("/groups") },
      { id: "goals", group: "Go to", label: "Goals", icon: Target, run: go("/goals") },
      { id: "reports", group: "Go to", label: "Analytics", keywords: "reports trends", icon: BarChart3, run: go("/reports") },
      { id: "profile", group: "Go to", label: "Profile and settings", keywords: "currency account", icon: User, run: go("/profile") },
      {
        id: "logout",
        group: "Account",
        label: "Sign out",
        keywords: "log out logout",
        icon: LogOut,
        run: () => {
          onClose();
          onLogout();
        },
      },
    ];
  }, [hideAmounts, setHideAmounts, onAddExpense, onClose, onLogout, router]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) => `${c.label} ${c.keywords || ""}`.toLowerCase().includes(q));
  }, [commands, query]);

  const active = Math.min(activeIndex, Math.max(results.length - 1, 0));

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((active + 1) % Math.max(results.length, 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((active - 1 + results.length) % Math.max(results.length, 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      results[active]?.run();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title="Search and commands" size="xl" bare className="mt-[12vh] mb-auto">
      <div className="flex items-center gap-3 border-b border-line px-4">
        <Search size={18} className="shrink-0 text-ink-3" aria-hidden="true" />
        <input
          data-autofocus
          role="combobox"
          aria-expanded="true"
          aria-controls="command-results"
          aria-activedescendant={results[active] ? `command-${results[active].id}` : undefined}
          aria-label="Search commands"
          placeholder="Type a command or page"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveIndex(0);
          }}
          onKeyDown={handleKeyDown}
          className="h-14 w-full bg-transparent text-body text-ink placeholder:text-ink-4 focus:outline-none focus-visible:outline-none"
        />
      </div>

      <ul id="command-results" role="listbox" aria-label="Commands" className="max-h-[50vh] overflow-y-auto p-2">
        {results.length === 0 && (
          <li className="px-3 py-6 text-center text-ui text-ink-3">No matching commands</li>
        )}
        {results.map((command, index) => {
          const Icon = command.icon;
          const showGroup = index === 0 || results[index - 1].group !== command.group;
          return (
            <li key={command.id} role="presentation">
              {showGroup && (
                <div className="px-3 pb-1 pt-3 text-meta font-medium text-ink-3" aria-hidden="true">
                  {command.group}
                </div>
              )}
              <div
                id={`command-${command.id}`}
                role="option"
                aria-selected={index === active}
                onMouseMove={() => index !== active && setActiveIndex(index)}
                onClick={() => command.run()}
                className={`flex h-11 cursor-pointer items-center gap-3 rounded-control px-3 text-ui ${
                  index === active ? "bg-brand-soft text-brand-strong" : "text-ink-2"
                }`}
              >
                <Icon size={16} aria-hidden="true" />
                {command.label}
              </div>
            </li>
          );
        })}
      </ul>

      <div className="hidden sm:flex items-center gap-4 border-t border-line px-4 py-2 text-meta text-ink-3" aria-hidden="true">
        <span>↑↓ to move</span>
        <span>Enter to run</span>
        <span>Esc to close</span>
      </div>
    </Dialog>
  );
}
