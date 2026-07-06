import { useEffect, useState } from "react";
import { Store, Star, Phone, Globe, Plus, Mail, Droplets, ArrowRightLeft, TrendingDown } from "lucide-react";
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
import { FleetFuelApi } from "@/lib/client";
import { useNavigate } from "react-router-dom";

export default function Suppliers({ user }) {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  
  const [addSupplierOpen, setAddSupplierOpen] = useState(false);
  const [viewProfileOpen, setViewProfileOpen] = useState(false);
  const [addOfferOpen, setAddOfferOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  const [newSupplier, setNewSupplier] = useState({
    supplierName: "",
    contactPerson: "",
    email: "",
    phoneNumber: "",
  });

  const [newOffer, setNewOffer] = useState({
    fuelType: "DIESEL",
    pricePerUnit: "",
    availableQuantityLitres: "",
    minimumOrderQuantityLitres: "",
  });

  const [editSupplierOpen, setEditSupplierOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState({
    supplierName: "",
    contactPerson: "",
    email: "",
    phoneNumber: "",
  });
  
  const [editOfferOpen, setEditOfferOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState({
    fuelType: "DIESEL",
    pricePerUnit: "",
    availableQuantityLitres: "",
    minimumOrderQuantityLitres: "",
  });

  const [comparePricesOpen, setComparePricesOpen] = useState(false);
  const [compareFuelType, setCompareFuelType] = useState("DIESEL");
  const [compareResults, setCompareResults] = useState([]);
  const [comparing, setComparing] = useState(false);



  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const data = await FleetFuelApi.fuelSuppliers.list();
      
      if (user?.role === "fuel_supplier") {
        const mySupplier = data.find(s => s.id === user.affiliatedServiceId);
        setSuppliers(mySupplier ? [mySupplier] : []);
        if (mySupplier) {
          setSelectedSupplier(mySupplier);
          setViewProfileOpen(true);
        }
      } else {
        setSuppliers(data || []);
      }
    } catch (err) {
      toast.error(err.message || "Failed to load suppliers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const handleAddSupplier = async () => {
    if (!newSupplier.supplierName || !newSupplier.email) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      await FleetFuelApi.fuelSuppliers.register(newSupplier);
      toast.success(`Supplier "${newSupplier.supplierName}" added`);
      setNewSupplier({ supplierName: "", contactPerson: "", email: "", phoneNumber: "" });
      setAddSupplierOpen(false);
      loadSuppliers();
    } catch (err) {
      toast.error(err.message || "Failed to add supplier");
    }
  };

  const handleEditSupplier = async () => {
    try {
      await FleetFuelApi.fuelSuppliers.updateDetails(selectedSupplier.id, {
        supplierName: editingSupplier.supplierName,
        contactPerson: editingSupplier.contactPerson,
        email: editingSupplier.email,
        phoneNumber: editingSupplier.phoneNumber
      });
      toast.success("Supplier details updated");
      setEditSupplierOpen(false);
      const data = await FleetFuelApi.fuelSuppliers.list();
      setSuppliers(data || []);
      setSelectedSupplier(data.find(s => s.id === selectedSupplier.id));
    } catch (err) {
      toast.error(err.message || "Failed to update supplier");
    }
  };

  const handleComparePrices = async () => {
    try {
      setComparing(true);
      const data = await FleetFuelApi.fuelSuppliers.comparePrices(compareFuelType);
      setCompareResults(data || []);
    } catch (err) {
      toast.error(err.message || "Failed to compare prices");
    } finally {
      setComparing(false);
    }
  };

  useEffect(() => {
    if (comparePricesOpen) {
      handleComparePrices();
    }
  }, [comparePricesOpen, compareFuelType]);

  const handleAddOffer = async () => {
    if (!newOffer.fuelType || !newOffer.pricePerUnit) {
      toast.error("Please provide fuel type and price");
      return;
    }
    try {
      await FleetFuelApi.fuelSuppliers.addOffer(selectedSupplier.id, {
        fuelType: newOffer.fuelType,
        pricePerUnit: Number(newOffer.pricePerUnit),
        availableQuantityLitres: Number(newOffer.availableQuantityLitres || 0),
        minimumOrderQuantityLitres: Number(newOffer.minimumOrderQuantityLitres || 1),
      });
      toast.success("Fuel offer added");
      setAddOfferOpen(false);
      setNewOffer({ fuelType: "DIESEL", pricePerUnit: "", availableQuantityLitres: "", minimumOrderQuantityLitres: "" });
      
      // Reload specific supplier to update offers in the view profile modal
      const data = await FleetFuelApi.fuelSuppliers.list();
      setSuppliers(data || []);
      setSelectedSupplier(data.find(s => s.id === selectedSupplier.id));
    } catch (err) {
      toast.error(err.message || "Failed to add fuel offer");
    }
  };

  const handleEditOffer = async () => {
    try {
      await FleetFuelApi.fuelSuppliers.updateOffer(selectedSupplier.id, {
        fuelType: editingOffer.fuelType,
        pricePerUnit: Number(editingOffer.pricePerUnit),
        availableQuantityLitres: Number(editingOffer.availableQuantityLitres || 0),
        minimumOrderQuantityLitres: Number(editingOffer.minimumOrderQuantityLitres || 1),
      });
      toast.success("Fuel offer updated");
      setEditOfferOpen(false);
      
      const data = await FleetFuelApi.fuelSuppliers.list();
      setSuppliers(data || []);
      setSelectedSupplier(data.find(s => s.id === selectedSupplier.id));
    } catch (err) {
      toast.error(err.message || "Failed to update fuel offer");
    }
  };

  const handleRemoveOffer = async (fuelType) => {
    try {
      await FleetFuelApi.fuelSuppliers.removeOffer(selectedSupplier.id, fuelType);
      toast.success("Fuel offer removed");
      
      // Reload specific supplier
      const data = await FleetFuelApi.fuelSuppliers.list();
      setSuppliers(data || []);
      setSelectedSupplier(data.find(s => s.id === selectedSupplier.id));
    } catch (err) {
      toast.error(err.message || "Failed to remove offer");
    }
  };

  const handleViewProfile = (supplier) => {
    setSelectedSupplier(supplier);
    setViewProfileOpen(true);
  };

  if (loading && suppliers.length === 0) {
    return <div className="p-8 text-center text-muted-foreground">Loading suppliers...</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={user?.role === "fuel_supplier" ? "My Supplier Profile" : "Supplier Marketplace"}
        subtitle={user?.role === "fuel_supplier" ? "Manage your profile and fuel offers" : "Browse and manage commercial fuel supplier storefronts"}
        actions={
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="gap-2" onClick={() => setComparePricesOpen(true)}>
              <ArrowRightLeft className="size-4" /> Compare Prices
            </Button>
          </div>
        }
      />

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
            </div>

            <h3 className="font-semibold text-sm leading-tight">{s.supplierName}</h3>
            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
              {s.contactPerson || "No contact person"}
            </div>

            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
              <div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Active Offers</div>
                <div className="font-semibold text-base font-display font-numeric">{s.fuelOffers?.length || 0}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Contact</div>
                <div className="text-xs font-medium mt-1">{s.phoneNumber || s.email}</div>
              </div>
            </div>

            {selected?.id === s.id && (
              <div className="mt-4 pt-4 border-t border-border space-y-2 animate-slide-up">
                <div className="flex gap-2 mt-3">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-xs flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewProfile(s);
                    }}
                  >
                    View Profile & Offers
                  </Button>
                  {user?.role === "fleet_company" && (
                    <Button 
                      size="sm" 
                      className="text-xs flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate("/app/procurement", { state: { prefillSupplierId: s.id } });
                      }}
                    >
                      Procure Fuel
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
        {suppliers.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground border-2 border-dashed rounded-xl">
            No fuel suppliers registered yet.
          </div>
        )}
      </div>

      {/* Add Supplier Dialog */}
      <Dialog open={addSupplierOpen} onOpenChange={setAddSupplierOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Supplier</DialogTitle>
            <DialogDescription>
              Register a new fuel supplier on the marketplace.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Supplier Name *</label>
              <input
                value={newSupplier.supplierName}
                onChange={(e) => setNewSupplier({...newSupplier, supplierName: e.target.value})}
                placeholder="e.g., Shell Tanzania"
                className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Contact Person</label>
              <input
                value={newSupplier.contactPerson}
                onChange={(e) => setNewSupplier({...newSupplier, contactPerson: e.target.value})}
                placeholder="e.g., Jane Doe"
                className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Contact Number</label>
              <input
                value={newSupplier.phoneNumber}
                onChange={(e) => setNewSupplier({...newSupplier, phoneNumber: e.target.value})}
                placeholder="+255 22 123 4567"
                className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Email *</label>
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

      {/* View Profile & Manage Offers Dialog */}
      <Dialog open={viewProfileOpen} onOpenChange={setViewProfileOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <div className="flex items-start justify-between pr-6">
              <div>
                <DialogTitle>{selectedSupplier?.supplierName}</DialogTitle>
                <DialogDescription>
                  Supplier Profile & Fuel Offers
                </DialogDescription>
              </div>
              {user?.role === "fuel_supplier" && (
                <Button size="sm" variant="outline" onClick={() => {
                  setEditingSupplier({
                    supplierName: selectedSupplier.supplierName,
                    contactPerson: selectedSupplier.contactPerson || "",
                    email: selectedSupplier.email,
                    phoneNumber: selectedSupplier.phoneNumber || ""
                  });
                  setEditSupplierOpen(true);
                }}>
                  Edit
                </Button>
              )}
            </div>
          </DialogHeader>
          {selectedSupplier && (
            <div className="space-y-4 py-2">
              <div className="pt-2 space-y-3">
                <div className="flex items-center gap-3">
                  <Phone className="size-4 text-muted-foreground" />
                  <div>
                    <div className="text-xs text-muted-foreground">Phone</div>
                    <div className="text-sm">{selectedSupplier.phoneNumber || '—'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="size-4 text-muted-foreground" />
                  <div>
                    <div className="text-xs text-muted-foreground">Email</div>
                    <div className="text-sm">{selectedSupplier.email}</div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-sm">Fuel Offers</h4>
                  {user?.role === "fuel_supplier" && (
                    <Button size="sm" variant="outline" onClick={() => setAddOfferOpen(true)} className="h-7 text-xs">
                      <Plus className="size-3 mr-1" /> Add Offer
                    </Button>
                  )}
                </div>
                
                {selectedSupplier.fuelOffers?.length > 0 ? (
                  <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                    {selectedSupplier.fuelOffers.map(offer => (
                      <div key={offer.fuelType} className="flex items-center justify-between p-3 border border-border rounded-lg bg-muted/20">
                        <div>
                          <div className="font-medium text-sm flex items-center gap-2">
                            {offer.fuelType}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            Min Order: {offer.minimumOrderQuantityLitres} L | Available: {offer.availableQuantityLitres} L
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-lg font-semibold">TZS {offer.pricePerUnit}</div>
                            <div className="text-[10px] text-muted-foreground uppercase">per Litre</div>
                          </div>
                          {user?.role === "fuel_supplier" && (
                            <div className="flex flex-col gap-1">
                              <Button size="sm" variant="outline" onClick={() => {
                                setEditingOffer({...offer});
                                setEditOfferOpen(true);
                              }} className="h-6 px-2 text-[10px]">
                                Edit
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleRemoveOffer(offer.fuelType)} className="h-6 px-2 text-[10px]">
                                Remove
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-xs text-muted-foreground bg-muted/10 rounded-lg border border-dashed">
                    No fuel offers listed yet.
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setViewProfileOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Fuel Offer Dialog */}
      <Dialog open={addOfferOpen} onOpenChange={setAddOfferOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Add Fuel Offer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Fuel Type</label>
              <select
                value={newOffer.fuelType}
                onChange={(e) => setNewOffer({...newOffer, fuelType: e.target.value})}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none"
              >
                <option value="DIESEL">Diesel</option>
                <option value="PETROL">Petrol</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Price Per Unit (TZS) *</label>
              <input
                type="number"
                step="0.01"
                value={newOffer.pricePerUnit}
                onChange={(e) => setNewOffer({...newOffer, pricePerUnit: e.target.value})}
                placeholder="3200"
                className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Available Quantity (Litres)</label>
              <input
                type="number"
                value={newOffer.availableQuantityLitres}
                onChange={(e) => setNewOffer({...newOffer, availableQuantityLitres: e.target.value})}
                placeholder="50000"
                className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Minimum Order (Litres)</label>
              <input
                type="number"
                value={newOffer.minimumOrderQuantityLitres}
                onChange={(e) => setNewOffer({...newOffer, minimumOrderQuantityLitres: e.target.value})}
                placeholder="1000"
                className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOfferOpen(false)}>Cancel</Button>
            <Button onClick={handleAddOffer}>Save Offer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Fuel Offer Dialog */}
      <Dialog open={editOfferOpen} onOpenChange={setEditOfferOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Edit Fuel Offer ({editingOffer.fuelType})</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Price Per Unit (TZS) *</label>
              <input
                type="number"
                step="0.01"
                value={editingOffer.pricePerUnit}
                onChange={(e) => setEditingOffer({...editingOffer, pricePerUnit: e.target.value})}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Available Quantity (Litres)</label>
              <input
                type="number"
                value={editingOffer.availableQuantityLitres}
                onChange={(e) => setEditingOffer({...editingOffer, availableQuantityLitres: e.target.value})}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Minimum Order (Litres)</label>
              <input
                type="number"
                value={editingOffer.minimumOrderQuantityLitres}
                onChange={(e) => setEditingOffer({...editingOffer, minimumOrderQuantityLitres: e.target.value})}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOfferOpen(false)}>Cancel</Button>
            <Button onClick={handleEditOffer}>Update Offer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Supplier Dialog */}
      <Dialog open={editSupplierOpen} onOpenChange={setEditSupplierOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Update Supplier Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Supplier Name *</label>
              <input
                value={editingSupplier.supplierName}
                onChange={(e) => setEditingSupplier({...editingSupplier, supplierName: e.target.value})}
                placeholder="e.g., Shell Tanzania"
                className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Contact Person</label>
              <input
                value={editingSupplier.contactPerson}
                onChange={(e) => setEditingSupplier({...editingSupplier, contactPerson: e.target.value})}
                placeholder="e.g., Jane Doe"
                className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Contact Number</label>
              <input
                value={editingSupplier.phoneNumber}
                onChange={(e) => setEditingSupplier({...editingSupplier, phoneNumber: e.target.value})}
                placeholder="+255 22 123 4567"
                className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Email *</label>
              <input
                type="email"
                value={editingSupplier.email}
                onChange={(e) => setEditingSupplier({...editingSupplier, email: e.target.value})}
                placeholder="contact@supplier.com"
                className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditSupplierOpen(false)}>Cancel</Button>
            <Button onClick={handleEditSupplier}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Compare Prices Dialog */}
      <Dialog open={comparePricesOpen} onOpenChange={setComparePricesOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Compare Fuel Prices</DialogTitle>
            <DialogDescription>
              Select a fuel type to compare prices across all suppliers.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <div className="flex gap-2 mb-4">
              <Button 
                variant={compareFuelType === "DIESEL" ? "default" : "outline"} 
                onClick={() => setCompareFuelType("DIESEL")}
                className="flex-1"
              >
                Diesel
              </Button>
              <Button 
                variant={compareFuelType === "PETROL" ? "default" : "outline"} 
                onClick={() => setCompareFuelType("PETROL")}
                className="flex-1"
              >
                Petrol
              </Button>
            </div>
            
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="grid grid-cols-4 bg-muted/30 p-3 text-xs font-medium text-muted-foreground">
                <div className="col-span-2">Supplier</div>
                <div>Price (TZS)</div>
                <div className="text-right">Available (L)</div>
              </div>
              <div className="divide-y divide-border max-h-[300px] overflow-y-auto">
                {comparing ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">Loading comparison...</div>
                ) : compareResults.length > 0 ? (
                  compareResults.map((result, idx) => (
                    <div key={idx} className="grid grid-cols-4 p-3 items-center text-sm hover:bg-muted/10">
                      <div className="col-span-2 font-medium flex items-center gap-2">
                        {idx === 0 && <Star className="size-3 text-yellow-500 fill-yellow-500" />}
                        {result.supplierName}
                      </div>
                      <div className="font-semibold text-primary">{result.pricePerUnit}</div>
                      <div className="text-right tabular-nums">{result.availableQuantityLitres}</div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-sm text-muted-foreground">
                    No suppliers are currently offering {compareFuelType}.
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setComparePricesOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
