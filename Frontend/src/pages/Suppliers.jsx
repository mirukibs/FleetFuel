import { useEffect, useMemo, useState } from "react";
import { Store, Star, MapPin, Phone, Globe, Plus, ChevronDown, X, Mail, MapPin as MapIcon } from "lucide-react";
import { PageHeader, Card, CardHeader } from "@/componets/ui-kit/Section";
import { Button } from "@/componets/ui/button";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/componets/ui/dialog";
import { cn } from "@/lib/utils";
import { useLocalStorageState } from "@/lib/storage";

const seedSuppliers = [
  { id: "SUP-001", name: "Total Energies Tanzania",  region: "Dar es Salaam", type: "National Chain", pricePerLitre: 1.48, bulkDiscount: true,  premium: true,  contact: "+255 22 211 1111", email: "contact@total-tz.com", stations: 24, rating: 4.8, website: "www.total-tanzania.com" },
  { id: "SUP-002", name: "Shell Tanzania Ltd",        region: "Nationwide",    type: "National Chain", pricePerLitre: 1.52, bulkDiscount: true,  premium: true,  contact: "+255 22 213 4567", email: "business@shell-tz.com", stations: 18, rating: 4.6, website: "www.shell-tanzania.com" },
  { id: "SUP-003", name: "Oryx Energy Tanzania",      region: "Dar es Salaam", type: "Regional",       pricePerLitre: 1.44, bulkDiscount: true,  premium: false, contact: "+255 22 214 8900", email: "sales@oryx-tz.com", stations: 11, rating: 4.3, website: "www.oryx-tanzania.com" },
  { id: "SUP-004", name: "BP Tanzania",               region: "Arusha",        type: "National Chain", pricePerLitre: 1.55, bulkDiscount: false, premium: false, contact: "+255 27 250 3322", email: "fleet@bp-tz.com", stations: 8,  rating: 4.1, website: "www.bp-tanzania.com" },
  { id: "SUP-005", name: "Engen Petroleum",           region: "Mwanza",        type: "Regional",       pricePerLitre: 1.41, bulkDiscount: true,  premium: false, contact: "+255 28 254 6600", email: "business@engen-tz.com", stations: 6,  rating: 3.9, website: "www.engen-tanzania.com" },
  { id: "SUP-006", name: "Petrol Plus Logistics",     region: "Dodoma",        type: "Local",          pricePerLitre: 1.38, bulkDiscount: false, premium: false, contact: "+255 26 232 1100", email: "info@petrolplus-tz.com", stations: 3,  rating: 3.7, website: "www.petrolplus-tanzania.com" },
];

function Stars({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={cn("size-3", i <= Math.round(rating) ? "fill-warning text-warning" : "text-border")} />
      ))}
      <span className="ml-1 text-xs text-muted-foreground">{rating}</span>
    </div>
  );
}

export default function Suppliers() {
  const [suppliers, setSuppliers] = useLocalStorageState("fleetfuel.suppliers", seedSuppliers);
  const [selected, setSelected] = useState(null);
  const [addSupplierOpen, setAddSupplierOpen] = useState(false);
  const [requestQuoteOpen, setRequestQuoteOpen] = useState(false);
  const [viewProfileOpen, setViewProfileOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [newSupplier, setNewSupplier] = useState({
    name: "",
    region: "",
    type: "",
    pricePerLitre: "",
    contact: "",
    email: "",
  });
  const [quoteRequest, setQuoteRequest] = useState({
    quantity: "",
    deliveryDate: "",
    notes: "",
  });

  const handleAddSupplier = () => {
    // Validate form
    if (!newSupplier.name || !newSupplier.contact) {
      toast.error("Please fill in all required fields");
      return;
    }
    const id = `SUP-${String(suppliers.length + 1).padStart(3, "0")}`;
    const created = {
      id,
      name: newSupplier.name.trim(),
      region: newSupplier.region.trim() || "—",
      type: newSupplier.type || "Local",
      pricePerLitre: Number(newSupplier.pricePerLitre || 0),
      bulkDiscount: false,
      premium: false,
      contact: newSupplier.contact.trim(),
      email: (newSupplier.email || "").trim(),
      stations: 1,
      rating: 4.0,
      website: "—",
    };
    setSuppliers((prev) => [created, ...prev]);
    toast.success(`Supplier "${created.name}" added`);
    toast.message("Marketplace listing fee: TZS 50,000/month");
    setNewSupplier({ name: "", region: "", type: "", pricePerLitre: "", contact: "", email: "" });
    setAddSupplierOpen(false);
  };

  const handleRequestQuote = () => {
    if (!quoteRequest.quantity || !quoteRequest.deliveryDate) {
      toast.error("Please fill in all required fields");
      return;
    }
    toast.success(`Quote request sent to ${selectedSupplier.name}`);
    setQuoteRequest({ quantity: "", deliveryDate: "", notes: "" });
    setRequestQuoteOpen(false);
  };

  const handleViewProfile = (supplier) => {
    setSelectedSupplier(supplier);
    setViewProfileOpen(true);
  };

  useEffect(() => {
    if (!selected?.id) return;
    setSelected(suppliers.find((s) => s.id === selected.id) ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suppliers]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Supplier Marketplace"
        subtitle="Browse and manage commercial fuel supplier storefronts"
        actions={
          <Button size="sm" className="gap-2" onClick={() => setAddSupplierOpen(true)}>
            <Plus className="size-4" /> Add Supplier
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: "Active Suppliers", value: suppliers.length },
          { label: "With Bulk Discounts", value: suppliers.filter(s=>s.bulkDiscount).length },
          { label: "Premium Listed",    value: suppliers.filter(s=>s.premium).length },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4">
            <div className="text-2xl font-semibold font-display">{s.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {suppliers.map((s) => (
          <div
            key={s.id}
            onClick={() => setSelected(selected?.id === s.id ? null : s)}
            className={cn(
              "rounded-2xl border bg-card p-5 cursor-pointer hover:shadow-elevated transition-all",
              selected?.id === s.id ? "border-primary shadow-elevated" : "border-border shadow-card"
            )}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="size-10 rounded-xl bg-primary/10 grid place-items-center">
                <Store className="size-5 text-primary" />
              </div>
              <div className="flex items-center gap-1.5">
                {s.premium && (
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-warning/15 text-warning-foreground">
                    Premium
                  </span>
                )}
                {s.bulkDiscount && (
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-success/10 text-success">
                    Bulk
                  </span>
                )}
              </div>
            </div>

            <h3 className="font-semibold text-sm leading-tight">{s.name}</h3>
            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
              <MapPin className="size-3" /> {s.region}
            </div>

            <Stars rating={s.rating} />

            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
              <div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Price / Litre</div>
                <div className="font-semibold text-base font-display font-numeric">${s.pricePerLitre}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Stations</div>
                <div className="font-semibold text-base font-display font-numeric">{s.stations}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Type</div>
                <div className="text-xs font-medium">{s.type}</div>
              </div>
            </div>

            {selected?.id === s.id && (
              <div className="mt-4 pt-4 border-t border-border space-y-2 animate-slide-up">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Phone className="size-3" /> {s.contact}
                </div>
                <div className="flex gap-2 mt-3">
                  <Button 
                    size="sm" 
                    className="text-xs flex-1"
                    onClick={() => {
                      setSelectedSupplier(s);
                      setRequestQuoteOpen(true);
                    }}
                  >
                    Request Quote
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-xs"
                    onClick={() => handleViewProfile(s)}
                  >
                    View Profile
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Supplier Dialog */}
      <Dialog open={addSupplierOpen} onOpenChange={setAddSupplierOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Supplier</DialogTitle>
            <DialogDescription>
              Register a new fuel supplier on the marketplace. Base listing fee: TZS 50,000/month
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Supplier Name *</label>
              <input
                value={newSupplier.name}
                onChange={(e) => setNewSupplier({...newSupplier, name: e.target.value})}
                placeholder="e.g., Shell Tanzania"
                className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Region *</label>
              <input
                value={newSupplier.region}
                onChange={(e) => setNewSupplier({...newSupplier, region: e.target.value})}
                placeholder="e.g., Dar es Salaam"
                className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Supplier Type</label>
              <select
                value={newSupplier.type}
                onChange={(e) => setNewSupplier({...newSupplier, type: e.target.value})}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none"
              >
                <option value="">Select type</option>
                <option value="National Chain">National Chain</option>
                <option value="Regional">Regional</option>
                <option value="Local">Local</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Price Per Litre ($) *</label>
              <input
                type="number"
                step="0.01"
                value={newSupplier.pricePerLitre}
                onChange={(e) => setNewSupplier({...newSupplier, pricePerLitre: e.target.value})}
                placeholder="1.50"
                className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Contact Number *</label>
              <input
                value={newSupplier.contact}
                onChange={(e) => setNewSupplier({...newSupplier, contact: e.target.value})}
                placeholder="+255 22 123 4567"
                className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Email</label>
              <input
                type="email"
                value={newSupplier.email}
                onChange={(e) => setNewSupplier({...newSupplier, email: e.target.value})}
                placeholder="contact@supplier.com"
                className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddSupplierOpen(false)}>Cancel</Button>
            <Button onClick={handleAddSupplier}>Add Supplier</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Quote Dialog */}
      <Dialog open={requestQuoteOpen} onOpenChange={setRequestQuoteOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Request Quote</DialogTitle>
            <DialogDescription>
              Request a bulk fuel quote from {selectedSupplier?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 bg-muted/50 rounded-lg border border-border">
              <div className="text-sm font-medium mb-1">{selectedSupplier?.name}</div>
              <div className="text-xs text-muted-foreground">Price: ${selectedSupplier?.pricePerLitre}/Litre</div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Quantity (Liters) *</label>
              <input
                type="number"
                value={quoteRequest.quantity}
                onChange={(e) => setQuoteRequest({...quoteRequest, quantity: e.target.value})}
                placeholder="5000"
                className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Delivery Date *</label>
              <input
                type="date"
                value={quoteRequest.deliveryDate}
                onChange={(e) => setQuoteRequest({...quoteRequest, deliveryDate: e.target.value})}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Additional Notes</label>
              <textarea
                value={quoteRequest.notes}
                onChange={(e) => setQuoteRequest({...quoteRequest, notes: e.target.value})}
                placeholder="Any special requirements..."
                rows="3"
                className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRequestQuoteOpen(false)}>Cancel</Button>
            <Button onClick={handleRequestQuote}>Send Quote Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Profile Dialog */}
      <Dialog open={viewProfileOpen} onOpenChange={setViewProfileOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{selectedSupplier?.name}</DialogTitle>
            <DialogDescription>
              Supplier Profile & Details
            </DialogDescription>
          </DialogHeader>
          {selectedSupplier && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Supplier ID</div>
                  <div className="font-medium text-sm">{selectedSupplier.id}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Type</div>
                  <div className="font-medium text-sm">{selectedSupplier.type}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Region</div>
                  <div className="font-medium text-sm">{selectedSupplier.region}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Rating</div>
                  <div className="font-medium text-sm flex items-center gap-1">
                    {selectedSupplier.rating} <Star className="size-4 fill-warning text-warning" />
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-border space-y-3">
                <div className="flex items-center gap-3">
                  <Phone className="size-4 text-muted-foreground" />
                  <div>
                    <div className="text-xs text-muted-foreground">Phone</div>
                    <div className="text-sm">{selectedSupplier.contact}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="size-4 text-muted-foreground" />
                  <div>
                    <div className="text-xs text-muted-foreground">Email</div>
                    <div className="text-sm">{selectedSupplier.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Globe className="size-4 text-muted-foreground" />
                  <div>
                    <div className="text-xs text-muted-foreground">Website</div>
                    <div className="text-sm text-primary">{selectedSupplier.website}</div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Price/Litre</div>
                  <div className="text-lg font-semibold">${selectedSupplier.pricePerLitre}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Stations</div>
                  <div className="text-lg font-semibold">{selectedSupplier.stations}</div>
                </div>
              </div>

              <div className="pt-4 border-t border-border flex gap-2 flex-wrap">
                {selectedSupplier.bulkDiscount && (
                  <span className="text-xs font-semibold px-2 py-1 rounded bg-success/10 text-success">✓ Bulk Discounts Available</span>
                )}
                {selectedSupplier.premium && (
                  <span className="text-xs font-semibold px-2 py-1 rounded bg-warning/15 text-warning-foreground">✓ Premium Listed</span>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setViewProfileOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
