import { useEffect, useState } from "react";
import { Plus, Check, X, Send, Truck, Building2, Fuel, ClipboardList } from "lucide-react";
import { PageHeader } from "@/componets/ui-kit/Section";
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

export default function Procurement() {
  
  // Data State
  const [companies, setCompanies] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [requests, setRequests] = useState([]);
  
  const [viewRole, setViewRole] = useState("FLEET_COMPANY"); // "FLEET_COMPANY" | "FUEL_SUPPLIER"
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [loading, setLoading] = useState(false);

  const [newRequestOpen, setNewRequestOpen] = useState(false);
  const [editRequestOpen, setEditRequestOpen] = useState(false);
  const [editingRequestId, setEditingRequestId] = useState(null);

  const [newRequest, setNewRequest] = useState({
    fuelSupplierId: "",
    fuelType: "DIESEL",
    fuelQuantityLitres: "",
    unitPrice: ""
  });

  const selectedSupplier = suppliers.find(s => s.id === newRequest.fuelSupplierId);
  const currentOffer = selectedSupplier?.fuelOffers?.find(o => o.fuelType === newRequest.fuelType);

  // Load Initial Data
  useEffect(() => {
    loadBaseData();
  }, []);

  useEffect(() => {
    if (viewRole === "FLEET_COMPANY") {
      if (selectedCompanyId) {
        loadRequests(selectedCompanyId, "FLEET_COMPANY");
      } else {
        setRequests([]);
      }
    } else {
      if (selectedSupplierId) {
        loadRequests(selectedSupplierId, "FUEL_SUPPLIER");
      } else {
        setRequests([]);
      }
    }
  }, [viewRole, selectedCompanyId, selectedSupplierId]);

  const loadBaseData = async () => {
    try {
      const [comps, supps] = await Promise.all([
        FleetFuelApi.fleetCompanies.list(),
        FleetFuelApi.fuelSuppliers.list()
      ]);
      setCompanies(comps || []);
      setSuppliers(supps || []);
      if (comps?.length > 0 && !selectedCompanyId) {
        setSelectedCompanyId(comps[0].id);
      }
      if (supps?.length > 0 && !selectedSupplierId) {
        setSelectedSupplierId(supps[0].id);
      }
    } catch (err) {
      toast.error("Failed to load initial data");
    }
  };

  const loadRequests = async (id, role) => {
    setLoading(true);
    try {
      const data = role === "FLEET_COMPANY" 
        ? await FleetFuelApi.procurement.listByCompany(id)
        : await FleetFuelApi.procurement.listBySupplier(id);
      setRequests(data || []);
    } catch (err) {
      toast.error("Failed to load requests");
    } finally {
      setLoading(false);
    }
  };



  // --- Procurement Requests Methods ---
  const handleCreateRequest = async () => {
    const qty = Number(newRequest.fuelQuantityLitres);
    if (currentOffer) {
      if (qty < currentOffer.minimumOrderQuantityLitres) {
        return toast.error(`Quantity must be at least ${currentOffer.minimumOrderQuantityLitres}L`);
      }
      if (qty > currentOffer.availableQuantityLitres) {
        return toast.error(`Quantity cannot exceed ${currentOffer.availableQuantityLitres}L`);
      }
    }
    try {
      await FleetFuelApi.procurement.create({
        fleetCompanyId: selectedCompanyId,
        fuelSupplierId: newRequest.fuelSupplierId,
        fuelType: newRequest.fuelType,
        fuelQuantityLitres: Number(newRequest.fuelQuantityLitres),
        unitPrice: Number(newRequest.unitPrice),
      });
      toast.success("Procurement Request created");
      setNewRequestOpen(false);
      setNewRequest({
        fuelSupplierId: "",
        fuelType: "DIESEL",
        fuelQuantityLitres: "",
        unitPrice: ""
      });
      loadRequests(selectedCompanyId, "FLEET_COMPANY");
    } catch (err) {
      toast.error(err.message || "Failed to create request");
    }
  };

  const handleEditRequest = async () => {
    const qty = Number(newRequest.fuelQuantityLitres);
    if (currentOffer) {
      if (qty < currentOffer.minimumOrderQuantityLitres) {
        return toast.error(`Quantity must be at least ${currentOffer.minimumOrderQuantityLitres}L`);
      }
      if (qty > currentOffer.availableQuantityLitres) {
        return toast.error(`Quantity cannot exceed ${currentOffer.availableQuantityLitres}L`);
      }
    }
    try {
      await FleetFuelApi.procurement.update(editingRequestId, {
        fuelQuantityLitres: Number(newRequest.fuelQuantityLitres),
        unitPrice: Number(newRequest.unitPrice),
      });
      toast.success("Procurement Request updated");
      setEditRequestOpen(false);
      loadRequests(selectedCompanyId, "FLEET_COMPANY");
    } catch (err) {
      toast.error(err.message || "Failed to update request");
    }
  };

  const openEditModal = (req) => {
    setEditingRequestId(req.id);
    setNewRequest({
      fuelSupplierId: req.fuelSupplierId,
      fuelType: req.fuelType,
      fuelQuantityLitres: req.fuelQuantityLitres,
      unitPrice: req.unitPrice,
    });
    setEditRequestOpen(true);
  };

  const handleAction = async (id, actionStr) => {
    try {
      await FleetFuelApi.procurement[actionStr](id);
      toast.success(`Request ${actionStr}ed successfully`);
      if (viewRole === "FLEET_COMPANY") {
        loadRequests(selectedCompanyId, "FLEET_COMPANY");
      } else {
        loadRequests(selectedSupplierId, "FUEL_SUPPLIER");
      }
    } catch (err) {
      toast.error(err.message || `Failed to ${actionStr}`);
    }
  };

  // --- Render Helpers ---
  const getStatusColor = (status) => {
    switch (status) {
      case "DRAFT": return "bg-gray-100 text-gray-700 border-gray-200";
      case "SUBMITTED": return "bg-blue-100 text-blue-700 border-blue-200";
      case "ACCEPTED": return "bg-green-100 text-green-700 border-green-200";
      case "REJECTED": return "bg-red-100 text-red-700 border-red-200";
      case "FULFILLED": return "bg-purple-100 text-purple-700 border-purple-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fuel Procurement"
        subtitle="Manage procurement requests"
      />

      <div className="flex gap-2 border-b border-border pb-4">
        <Button 
          variant={viewRole === "FLEET_COMPANY" ? "default" : "ghost"} 
          onClick={() => setViewRole("FLEET_COMPANY")}
          className="gap-2"
        >
          <Building2 className="size-4" /> View as Fleet Company
        </Button>
        <Button 
          variant={viewRole === "FUEL_SUPPLIER" ? "default" : "ghost"} 
          onClick={() => setViewRole("FUEL_SUPPLIER")}
          className="gap-2"
        >
          <Fuel className="size-4" /> View as Fuel Supplier
        </Button>
      </div>


        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 rounded-xl border border-border bg-muted/20">
            {viewRole === "FLEET_COMPANY" ? (
              <>
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium">Viewing as Company:</label>
                  <select 
                    className="px-3 py-1.5 rounded-lg border border-border text-sm"
                    value={selectedCompanyId}
                    onChange={e => setSelectedCompanyId(e.target.value)}
                  >
                    {companies.map(c => (
                      <option key={c.id} value={c.id}>{c.companyName}</option>
                    ))}
                  </select>
                </div>
                <Button size="sm" onClick={() => {
                  setNewRequest({
                    fuelSupplierId: "",
                    fuelType: "DIESEL",
                    fuelQuantityLitres: "",
                    unitPrice: ""
                  });
                  setNewRequestOpen(true);
                }} disabled={!selectedCompanyId} className="gap-2">
                  <Plus className="size-4" /> New Request
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium">Viewing as Supplier:</label>
                <select 
                  className="px-3 py-1.5 rounded-lg border border-border text-sm"
                  value={selectedSupplierId}
                  onChange={e => setSelectedSupplierId(e.target.value)}
                >
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.supplierName}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {loading ? (
            <div className="text-center p-8 text-muted-foreground">Loading requests...</div>
          ) : (
            <div className="space-y-3">
              {requests.map(req => (
                <div key={req.id} className="p-4 rounded-xl border border-border bg-card flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-semibold border", getStatusColor(req.procurementStatus))}>
                        {req.procurementStatus}
                      </span>
                      <span className="text-xs text-muted-foreground">ID: {req.id.split('-')[0]}</span>
                    </div>
                    <div className="font-medium text-sm">
                      {req.fuelQuantityLitres}L of {req.fuelType} @ TZS {req.unitPrice}/L
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {viewRole === "FLEET_COMPANY" 
                        ? `Supplier: ${suppliers.find(s => s.id === req.fuelSupplierId)?.supplierName || req.fuelSupplierId}`
                        : `Company: ${companies.find(c => c.id === req.fleetCompanyId)?.companyName || req.fleetCompanyId}`
                      }
                    </div>
                    <div className="text-xs font-semibold mt-1 text-primary">
                      Total: TZS {req.totalCost || (req.fuelQuantityLitres * req.unitPrice)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Fleet Company Actions */}
                    {viewRole === "FLEET_COMPANY" && req.procurementStatus === "DRAFT" && (
                      <>
                        <Button size="sm" variant="outline" className="gap-2" onClick={() => openEditModal(req)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="default" className="gap-2" onClick={() => handleAction(req.id, 'submit')}>
                          <Send className="size-3" /> Submit
                        </Button>
                      </>
                    )}

                    {/* Fuel Supplier Actions */}
                    {viewRole === "FUEL_SUPPLIER" && req.procurementStatus === "SUBMITTED" && (
                      <>
                        <Button size="sm" variant="default" className="gap-2 bg-green-600 hover:bg-green-700 text-white" onClick={() => handleAction(req.id, 'accept')}>
                          <Check className="size-3" /> Accept
                        </Button>
                        <Button size="sm" variant="destructive" className="gap-2" onClick={() => handleAction(req.id, 'reject')}>
                          <X className="size-3" /> Reject
                        </Button>
                      </>
                    )}
                    {viewRole === "FUEL_SUPPLIER" && req.procurementStatus === "ACCEPTED" && (
                      <Button size="sm" variant="default" className="gap-2 bg-purple-600 hover:bg-purple-700 text-white" onClick={() => handleAction(req.id, 'fulfill')}>
                        <Truck className="size-3" /> Fulfill
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {requests.length === 0 && (
                <div className="py-12 text-center text-muted-foreground border-2 border-dashed rounded-xl">
                  No procurement requests found for this {viewRole === "FLEET_COMPANY" ? "company" : "supplier"}.
                </div>
              )}
            </div>
          )}
        </div>



      {/* Create Request Dialog */}
      <Dialog open={newRequestOpen} onOpenChange={setNewRequestOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Procurement Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Fuel Supplier</label>
              <select
                data-testid="supplier-select"
                value={newRequest.fuelSupplierId}
                onChange={(e) => {
                  const supplierId = e.target.value;
                  // Auto-fill price if possible
                  const supplier = suppliers.find(s => s.id === supplierId);
                  let price = "";
                  if (supplier && supplier.fuelOffers) {
                    const offer = supplier.fuelOffers.find(o => o.fuelType === newRequest.fuelType);
                    if (offer) price = offer.pricePerUnit;
                  }
                  setNewRequest({...newRequest, fuelSupplierId: supplierId, unitPrice: price});
                }}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg"
              >
                <option value="">Select a supplier...</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.supplierName}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Fuel Type</label>
                <select
                  value={newRequest.fuelType}
                  onChange={(e) => {
                    const fuelType = e.target.value;
                    let price = "";
                    if (newRequest.fuelSupplierId) {
                      const supplier = suppliers.find(s => s.id === newRequest.fuelSupplierId);
                      if (supplier && supplier.fuelOffers) {
                        const offer = supplier.fuelOffers.find(o => o.fuelType === fuelType);
                        if (offer) price = offer.pricePerUnit;
                      }
                    }
                    setNewRequest({...newRequest, fuelType, unitPrice: price});
                  }}
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg"
                >
                  <option value="DIESEL">Diesel</option>
                  <option value="PETROL">Petrol</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Quantity (L)</label>
                <input
                  type="number"
                  value={newRequest.fuelQuantityLitres}
                  onChange={(e) => setNewRequest({...newRequest, fuelQuantityLitres: e.target.value})}
                  placeholder="1000"
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg"
                />
                <div className="text-xs text-muted-foreground mt-1">
                  {currentOffer ? `Min: ${currentOffer.minimumOrderQuantityLitres}L | Max: ${currentOffer.availableQuantityLitres}L` : 'Select supplier & fuel type'}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Unit Price (TZS)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newRequest.unitPrice}
                  disabled
                  placeholder="Select supplier & fuel type"
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-muted"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewRequestOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateRequest} disabled={!newRequest.fuelSupplierId}>Create Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Edit Request Dialog */}
      <Dialog open={editRequestOpen} onOpenChange={setEditRequestOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Procurement Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Fuel Supplier</label>
              <select
                value={newRequest.fuelSupplierId}
                disabled
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-muted"
              >
                <option value="">Select a supplier...</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.supplierName}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Fuel Type</label>
                <select
                  value={newRequest.fuelType}
                  disabled
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-muted"
                >
                  <option value="DIESEL">Diesel</option>
                  <option value="PETROL">Petrol</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Quantity (L)</label>
                <input
                  type="number"
                  value={newRequest.fuelQuantityLitres}
                  onChange={(e) => setNewRequest({...newRequest, fuelQuantityLitres: e.target.value})}
                  placeholder="1000"
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg"
                />
                <div className="text-xs text-muted-foreground mt-1">
                  {currentOffer ? `Min: ${currentOffer.minimumOrderQuantityLitres}L | Max: ${currentOffer.availableQuantityLitres}L` : ''}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Unit Price (TZS)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newRequest.unitPrice}
                  disabled
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-muted"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditRequestOpen(false)}>Cancel</Button>
            <Button onClick={handleEditRequest} disabled={!newRequest.fuelSupplierId}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
