import { Loader2, RefreshCw, Send } from "lucide-react";
import { useState } from "react";

import { EmptyState } from "../../components/admin/EmptyState";
import { LoadingSkeleton } from "../../components/admin/LoadingSkeleton";
import { useNotifications } from "../../hooks/useNotifications";

export default function Notifications() {
  const [recipient, setRecipient] = useState("");
  const [message, setMessage] = useState("");
  const { error, history, loading, refetch, send, sending, templates } = useNotifications();
  const characterCount = message.length;

  async function handleSend() {
    if (!recipient.trim() || !message.trim()) {
      return;
    }

    await send({ recipient: recipient.trim(), message: message.trim() });
    setRecipient("");
    setMessage("");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Notifications</h2>
          <p className="mt-1 text-sm text-admin-muted dark:text-slate-400">
            Send operational messages, manage templates, and review notification history.
          </p>
        </div>
        <button
          className="inline-flex h-10 items-center justify-center gap-2 rounded-admin bg-admin-gold px-4 text-sm font-medium text-white transition hover:bg-[#B67B24]"
          type="button"
          onClick={() => void refetch()}
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Refresh
        </button>
      </div>

      {error ? <EmptyState title="Notifications unavailable" description={error} /> : null}

      <section className="grid gap-4 xl:grid-cols-[1fr_0.8fr]">
        <form
          className="rounded-admin border border-admin-border bg-white p-5 shadow-admin dark:border-slate-800 dark:bg-slate-900"
          onSubmit={(event) => {
            event.preventDefault();
            void handleSend();
          }}
        >
          <h3 className="text-base font-semibold">Send Notification</h3>
          <div className="mt-5 grid gap-4">
            <label className="block">
              <span className="text-sm font-medium">Recipient</span>
              <input
                className="mt-2 h-10 w-full rounded-admin border border-admin-border bg-white px-3 text-sm outline-none focus:border-admin-gold focus:ring-2 focus:ring-admin-gold/20 dark:border-slate-800 dark:bg-slate-950"
                value={recipient}
                onChange={(event) => setRecipient(event.target.value)}
                placeholder="Recipient identifier"
              />
            </label>
            <label className="block">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Message</span>
                <span className="text-xs text-admin-muted">{characterCount}/500</span>
              </div>
              <textarea
                className="mt-2 min-h-32 w-full rounded-admin border border-admin-border bg-white px-3 py-2 text-sm outline-none focus:border-admin-gold focus:ring-2 focus:ring-admin-gold/20 dark:border-slate-800 dark:bg-slate-950"
                value={message}
                onChange={(event) => setMessage(event.target.value.slice(0, 500))}
                placeholder="Write a notification message"
              />
            </label>
            <button
              className="inline-flex h-10 items-center justify-center gap-2 rounded-admin bg-admin-gold px-4 text-sm font-medium text-white hover:bg-[#B67B24] disabled:cursor-not-allowed disabled:opacity-60"
              type="submit"
              disabled={sending || !recipient.trim() || !message.trim()}
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Send className="h-4 w-4" aria-hidden="true" />
              )}
              Send
            </button>
          </div>
        </form>

        <section className="rounded-admin border border-admin-border bg-white p-5 shadow-admin dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-base font-semibold">Templates</h3>
          {loading ? (
            <LoadingSkeleton rows={4} />
          ) : templates.length > 0 ? (
            <div className="mt-5 space-y-3">
              {templates.map((template) => (
                <button
                  key={template.id}
                  className="block w-full rounded-admin border border-admin-border px-4 py-3 text-left text-sm hover:bg-admin-cream dark:border-slate-800 dark:hover:bg-slate-950"
                  type="button"
                  onClick={() => setMessage(template.name)}
                >
                  <span className="font-medium">{template.name}</span>
                  <span className="mt-1 block text-xs text-admin-muted">
                    {template.channels.length > 0 ? template.channels.join(", ") : "No channel data available"}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <EmptyState title="No templates available" />
          )}
        </section>
      </section>

      <section className="rounded-admin border border-admin-border bg-white p-5 shadow-admin dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-base font-semibold">Notification History</h3>
        {loading ? (
          <LoadingSkeleton rows={5} />
        ) : history.length > 0 ? (
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-admin-muted">
                <tr>
                  <th className="py-3 pr-4">ID</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Channel</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="py-3 pl-4">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {history.map((item) => (
                  <tr key={item.id}>
                    <td className="py-4 pr-4 font-medium">{item.id}</td>
                    <td className="px-4 py-4">{item.title}</td>
                    <td className="px-4 py-4">{item.channel}</td>
                    <td className="px-4 py-4">{item.status}</td>
                    <td className="py-4 pl-4">{item.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="No notification history available" />
        )}
      </section>
    </div>
  );
}
