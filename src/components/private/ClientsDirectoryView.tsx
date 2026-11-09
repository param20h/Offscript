"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Users,
  Building,
  Mail,
  Phone,
  Globe,
  ArrowRight,
  X,
  Loader2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { ClientRecord, ClientStatus, ClientType } from "@/lib/db/supabase";

const STATUS_FILTERS: { label: string; value: string }[] = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Lead", value: "lead" },
  { label: "Prospect", value: "prospect" },
  { label: "Inactive", value: "inactive" },
  { label: "Archived", value: "archived" },
];

export default function ClientsDirectoryView({
  initialClients,
}: {
  initialClients: ClientRecord[];
}) {
  const router = useRouter();
  const [clients, setClients] = useState<ClientRecord[]>(initialClients);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [sortOrder, setSortOrder] = useState<"created_desc" | "created_asc" | "updated_desc">("created_desc");

  // Add Client Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    name: "",
    company_name: "Independent",
    email: "",
    phone: "",
    website: "",
    industry: "",
    company_size: "",
    client_type: "startup" as ClientType,
    status: "active" as ClientStatus,
    notes: "",
  });
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // Filtered clients list
  const filteredClients = useMemo(() => {
    let list = [...clients];

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (c) =>
          (c.name || "").toLowerCase().includes(q) ||
          (c.email || "").toLowerCase().includes(q) ||
          (c.company_name || "").toLowerCase().includes(q) ||
          (c.industry || "").toLowerCase().includes(q)
      );
    }

    if (selectedStatus !== "all") {
      list = list.filter((c) => c.status === selectedStatus);
    }

    if (selectedType !== "all") {
      list = list.filter((c) => c.client_type === selectedType);
    }

    list.sort((a, b) => {
      if (sortOrder === "created_asc") {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      if (sortOrder === "updated_desc") {
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return list;
  }, [clients, search, selectedStatus, selectedType, sortOrder]);

  const handleAddClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    setAddError(null);

    try {
      const res = await fetch("/api/private/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addForm),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create client");
      }

      setClients([data.client, ...clients]);
      setIsAddModalOpen(false);
      setAddForm({
        name: "",
        company_name: "Independent",
        email: "",
        phone: "",
        website: "",
        industry: "",
        company_size: "",
        client_type: "startup",
        status: "active",
        notes: "",
      });
      router.refresh();
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "Error creating client");
    } finally {
      setIsAdding(false);
    }
  };

  const getStatusBadge = (status: ClientStatus) => {
    switch (status) {
      case "active":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "lead":
        return "bg-acid/10 text-acid border-acid/30";
      case "prospect":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      case "inactive":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      case "archived":
        return "bg-ivory/10 text-ivory/40 border-ivory/20";
      default:
        return "bg-ivory/10 text-ivory/60 border-ivory/20";
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Action Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-ivory/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by client name, email, company, industry..."
            className="w-full bg-[#161616] border border-ivory/10 pl-9 pr-3.5 py-2 text-xs font-mono text-ivory placeholder-ivory/30 rounded-sm focus:outline-none focus:border-acid transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-[#161616] border border-ivory/10 px-3 py-2 text-xs font-mono text-ivory/80 rounded-sm focus:outline-none focus:border-acid transition-colors cursor-pointer"
          >
            <option value="all">All Client Types</option>
            <option value="startup">Startup</option>
            <option value="small_business">Small Business</option>
            <option value="enterprise">Enterprise</option>
            <option value="agency">Agency</option>
            <option value="individual">Individual</option>
            <option value="other">Other</option>
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as any)}
            className="bg-[#161616] border border-ivory/10 px-3 py-2 text-xs font-mono text-ivory/80 rounded-sm focus:outline-none focus:border-acid transition-colors cursor-pointer"
          >
            <option value="created_desc">Newest Added</option>
            <option value="created_asc">Oldest Added</option>
            <option value="updated_desc">Recently Updated</option>
          </select>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-acid text-obsidian text-xs font-mono font-semibold rounded-sm hover:bg-[#cbf52b] transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Client</span>
          </button>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-ivory/10">
        {STATUS_FILTERS.map((tab) => {
          const isActive = selectedStatus === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => setSelectedStatus(tab.value)}
              className={`px-3 py-1.5 text-xs font-mono rounded-sm transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? "bg-ivory/10 text-acid font-semibold border-b border-acid"
                  : "text-ivory/50 hover:text-ivory hover:bg-ivory/[0.03]"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Counter */}
      <div className="text-xs font-mono text-ivory/40">
        Showing {filteredClients.length} of {clients.length} clients
      </div>

      {/* Directory Cards */}
      {filteredClients.length === 0 ? (
        <div className="border border-ivory/10 bg-[#141414] rounded-sm p-12 text-center">
          <Users className="w-8 h-8 text-ivory/20 mx-auto mb-3" />
          <div className="text-sm font-mono text-ivory/60">No clients found</div>
          <div className="text-xs font-mono text-ivory/30 mt-1">
            Convert an inbound inquiry or add a client directly using the button above.
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredClients.map((client) => {
            const createdStr = new Date(client.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });

            return (
              <div
                key={client.id}
                className="border border-ivory/10 bg-[#141414] hover:border-ivory/25 rounded-sm p-5 space-y-4 transition-all group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-display font-semibold text-base text-ivory">
                        {client.name}
                      </span>
                      <span
                        className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${getStatusBadge(
                          client.status
                        )}`}
                      >
                        {client.status}
                      </span>
                    </div>
                    <div className="text-xs font-mono text-ivory/60 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{client.company_name}</span>
                      {client.industry && (
                        <span className="text-ivory/40">• {client.industry}</span>
                      )}
                    </div>
                  </div>

                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded border border-ivory/10 text-ivory/40 bg-ivory/[0.02] shrink-0">
                    {client.client_type.replace(/_/g, " ")}
                  </span>
                </div>

                {/* Contact details */}
                <div className="space-y-1 text-xs font-mono text-ivory/50">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-ivory/30" />
                    <span className="text-ivory/70 truncate">{client.email}</span>
                  </div>
                  {client.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-ivory/30" />
                      <span className="text-ivory/70">{client.phone}</span>
                    </div>
                  )}
                  {client.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="w-3.5 h-3.5 text-ivory/30" />
                      <a
                        href={client.website.startsWith("http") ? client.website : `https://${client.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-acid/80 hover:text-acid hover:underline truncate"
                      >
                        {client.website.replace(/^https?:\/\//, "")}
                      </a>
                    </div>
                  )}
                </div>

                {/* Footer and action */}
                <div className="pt-3 border-t border-ivory/10 flex items-center justify-between text-[11px] font-mono text-ivory/40">
                  <span>Since {createdStr}</span>
                  <Link
                    href={`/private/clients/${client.id}`}
                    className="inline-flex items-center gap-1.5 text-ivory hover:text-acid transition-colors font-medium"
                  >
                    <span>Client Dossier</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Client Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#141414] border border-ivory/20 rounded-sm w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-ivory/10">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-acid" />
                <h3 className="font-display font-semibold text-base text-ivory">
                  Create New Client Record
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-ivory/40 hover:text-ivory transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {addError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono rounded">
                {addError}
              </div>
            )}

            <form onSubmit={handleAddClientSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-ivory/60 mb-1">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={addForm.name}
                    onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                    placeholder="Jane Doe"
                    className="w-full bg-[#181818] border border-ivory/15 px-3 py-2 text-xs font-mono text-ivory rounded focus:border-acid focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase text-ivory/60 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={addForm.company_name}
                    onChange={(e) => setAddForm({ ...addForm, company_name: e.target.value })}
                    placeholder="Acme Corp"
                    className="w-full bg-[#181818] border border-ivory/15 px-3 py-2 text-xs font-mono text-ivory rounded focus:border-acid focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-ivory/60 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={addForm.email}
                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                    placeholder="client@acme.com"
                    className="w-full bg-[#181818] border border-ivory/15 px-3 py-2 text-xs font-mono text-ivory rounded focus:border-acid focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase text-ivory/60 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={addForm.phone}
                    onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-[#181818] border border-ivory/15 px-3 py-2 text-xs font-mono text-ivory rounded focus:border-acid focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-ivory/60 mb-1">
                    Website
                  </label>
                  <input
                    type="text"
                    value={addForm.website}
                    onChange={(e) => setAddForm({ ...addForm, website: e.target.value })}
                    placeholder="https://acme.com"
                    className="w-full bg-[#181818] border border-ivory/15 px-3 py-2 text-xs font-mono text-ivory rounded focus:border-acid focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase text-ivory/60 mb-1">
                    Client Type
                  </label>
                  <select
                    value={addForm.client_type}
                    onChange={(e) => setAddForm({ ...addForm, client_type: e.target.value as ClientType })}
                    className="w-full bg-[#181818] border border-ivory/15 px-3 py-2 text-xs font-mono text-ivory rounded focus:border-acid focus:outline-none cursor-pointer"
                  >
                    <option value="startup">Startup</option>
                    <option value="small_business">Small Business</option>
                    <option value="enterprise">Enterprise</option>
                    <option value="agency">Agency</option>
                    <option value="individual">Individual</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase text-ivory/60 mb-1">
                    CRM Status
                  </label>
                  <select
                    value={addForm.status}
                    onChange={(e) => setAddForm({ ...addForm, status: e.target.value as ClientStatus })}
                    className="w-full bg-[#181818] border border-ivory/15 px-3 py-2 text-xs font-mono text-ivory rounded focus:border-acid focus:outline-none cursor-pointer"
                  >
                    <option value="active">Active</option>
                    <option value="prospect">Prospect</option>
                    <option value="lead">Lead</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-ivory/60 mb-1">
                  Internal Overview / Notes
                </label>
                <textarea
                  rows={2}
                  value={addForm.notes}
                  onChange={(e) => setAddForm({ ...addForm, notes: e.target.value })}
                  placeholder="Engagement history, scope, key stakeholders..."
                  className="w-full bg-[#181818] border border-ivory/15 px-3 py-2 text-xs font-mono text-ivory rounded focus:border-acid focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-ivory/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-mono text-ivory/60 hover:text-ivory transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdding}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-acid text-obsidian font-mono text-xs font-semibold rounded hover:bg-[#cbf52b] transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isAdding ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Client...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create Client</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
