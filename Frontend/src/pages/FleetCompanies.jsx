import { useEffect, useState } from "react";
import { Plus, Building2, Fuel, Droplet } from "lucide-react";
import { PageHeader } from "@/componets/ui-kit/Section";
import { Button } from "@/componets/ui/button";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/componets/ui/dialog";
import { FleetFuelApi } from "@/lib/client";

export default function FleetCompanies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Registration and Edit Dialogs
  const [newCompanyOpen, setNewCompanyOpen] = useState(false);
  const [newCompany, setNewCompany] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    phoneNumber: ""
  });

  const [editCompanyOpen, setEditCompanyOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState({
    id: "",
    companyName: "",
    contactPerson: "",
    email: "",
    phoneNumber: ""
  });

  // Fuel Management Dialogs
  const [manageFuelOpen, setManageFuelOpen] = useState(false);
  const [activeCompanyForFuel, setActiveCompanyForFuel] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [allocateForm, setAllocateForm] = useState({
    fuelType: "DIESEL",
    quantityLitres: ""
  });

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    setLoading(true);
    try {
      const data = await FleetFuelApi.fleetCompanies.list();
      
      // Fetch fuel accounts for each company to display balance
      const companiesWithFuel = await Promise.all((data || []).map(async (c) => {
        try {
          const account = await FleetFuelApi.fuelAccounts.get(c.id);
          return { ...c, fuelAccount: account };
        } catch(e) {
          return { ...c, fuelAccount: null };
        }
      }));
      
      setCompanies(companiesWithFuel);
    } catch (err) {
      toast.error("Failed to load fleet companies");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCompany = async () => {
    try {
      await FleetFuelApi.fleetCompanies.register(newCompany);
      toast.success("Fleet Company registered");
      setNewCompanyOpen(false);
      setNewCompany({ companyName: "", contactPerson: "", email: "", phoneNumber: "" });
      loadCompanies();
    } catch (err) {
      toast.error(err.message || "Failed to register company");
    }
  };

  const handleEditClick = (company) => {
    setEditingCompany({ ...company });
    setEditCompanyOpen(true);
  };

  const handleUpdateCompany = async () => {
    try {
      await FleetFuelApi.fleetCompanies.updateDetails(editingCompany.id, {
        companyName: editingCompany.companyName,
        contactPerson: editingCompany.contactPerson,
        email: editingCompany.email,
        phoneNumber: editingCompany.phoneNumber
      });
      toast.success("Fleet Company updated");
      setEditCompanyOpen(false);
      loadCompanies();
    } catch (err) {
      toast.error(err.message || "Failed to update company");
    }
  };

  const openManageFuel = async (company) => {
    setActiveCompanyForFuel(company);
    setManageFuelOpen(true);
    setTransactions([]);
    
    if (company.fuelAccount) {
      setLoadingTransactions(true);
      try {
        const txs = await FleetFuelApi.fuelAccounts.getTransactions(company.id);
        setTransactions(txs || []);
      } catch (err) {
        toast.error("Failed to load transactions");
      } finally {
        setLoadingTransactions(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fleet Companies"
        subtitle="Manage fleet companies registered for fuel procurement"
      />

      <div className="space-y-4">
        <div className="flex justify-between items-center bg-muted/20 p-4 rounded-xl border border-border">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Building2 className="size-4 text-muted-foreground" />
            Registered Companies
          </div>
          <Button size="sm" onClick={() => setNewCompanyOpen(true)} className="gap-2">
            <Plus className="size-4" /> Register Fleet Company
          </Button>
        </div>

        {loading ? (
          <div className="text-center p-8 text-muted-foreground">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {companies.map(c => (
              <div key={c.id} className="p-4 rounded-xl border border-border bg-card flex flex-col h-full">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-semibold text-base">{c.companyName}</div>
                    <div className="text-xs text-muted-foreground">Contact: {c.contactPerson || "N/A"}</div>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={() => handleEditClick(c)}>
                    Edit
                  </Button>
                </div>
                
                <div className="flex-1 text-sm mt-2 border-t border-border pt-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span>{c.email}</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-muted-foreground">Phone:</span>
                    <span>{c.phoneNumber}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border border-dashed">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-1.5 text-sm font-medium">
                      <Droplet className="size-4 text-primary" />
                      Fuel Account
                    </div>
                    {c.fuelAccount && Object.keys(c.fuelAccount.balances || {}).length > 0 ? (
                      <div className="text-right flex flex-col gap-1">
                        {Object.entries(c.fuelAccount.balances).map(([type, amount]) => (
                          <div key={type}>
                            <div className="text-sm font-bold text-primary">{amount.toLocaleString()}L</div>
                            <div className="text-[10px] uppercase text-muted-foreground tracking-wider">{type}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground italic">No balances</div>
                    )}
                  </div>
                  <Button variant="outline" className="w-full text-xs" size="sm" onClick={() => openManageFuel(c)}>
                    <Fuel className="size-3 mr-2" /> View Account & History
                  </Button>
                </div>
              </div>
            ))}
            {companies.length === 0 && (
              <div className="col-span-full py-8 text-center text-muted-foreground border-2 border-dashed rounded-xl">
                No fleet companies registered.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Company Dialog */}
      <Dialog open={newCompanyOpen} onOpenChange={setNewCompanyOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Register Fleet Company</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Company Name</label>
              <input
                value={newCompany.companyName}
                onChange={(e) => setNewCompany({...newCompany, companyName: e.target.value})}
                placeholder="TransLogistics Inc"
                className="w-full px-3 py-2 text-sm border border-border rounded-lg"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Contact Person</label>
              <input
                value={newCompany.contactPerson}
                onChange={(e) => setNewCompany({...newCompany, contactPerson: e.target.value})}
                placeholder="Jane Doe"
                className="w-full px-3 py-2 text-sm border border-border rounded-lg"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Email</label>
              <input
                type="email"
                value={newCompany.email}
                onChange={(e) => setNewCompany({...newCompany, email: e.target.value})}
                placeholder="procurement@company.com"
                className="w-full px-3 py-2 text-sm border border-border rounded-lg"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Phone Number</label>
              <input
                value={newCompany.phoneNumber}
                onChange={(e) => setNewCompany({...newCompany, phoneNumber: e.target.value})}
                placeholder="+255 123 456 789"
                className="w-full px-3 py-2 text-sm border border-border rounded-lg"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewCompanyOpen(false)}>Cancel</Button>
            <Button onClick={handleAddCompany}>Register</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Company Dialog */}
      <Dialog open={editCompanyOpen} onOpenChange={setEditCompanyOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Update Company Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Company Name</label>
              <input
                value={editingCompany.companyName}
                onChange={(e) => setEditingCompany({...editingCompany, companyName: e.target.value})}
                placeholder="TransLogistics Inc"
                className="w-full px-3 py-2 text-sm border border-border rounded-lg"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Contact Person</label>
              <input
                value={editingCompany.contactPerson}
                onChange={(e) => setEditingCompany({...editingCompany, contactPerson: e.target.value})}
                placeholder="Jane Doe"
                className="w-full px-3 py-2 text-sm border border-border rounded-lg"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Email</label>
              <input
                type="email"
                value={editingCompany.email}
                onChange={(e) => setEditingCompany({...editingCompany, email: e.target.value})}
                placeholder="procurement@company.com"
                className="w-full px-3 py-2 text-sm border border-border rounded-lg"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Phone Number</label>
              <input
                value={editingCompany.phoneNumber}
                onChange={(e) => setEditingCompany({...editingCompany, phoneNumber: e.target.value})}
                placeholder="+255 123 456 789"
                className="w-full px-3 py-2 text-sm border border-border rounded-lg"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditCompanyOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateCompany}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Fuel Dialog */}
      <Dialog open={manageFuelOpen} onOpenChange={setManageFuelOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Fuel Account Details</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-6 py-4">
            {activeCompanyForFuel && (
              <>
                <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-primary">{activeCompanyForFuel.companyName}</h3>
                    <p className="text-xs text-primary/80">
                      {activeCompanyForFuel.fuelAccount ? "Active Fuel Account" : "No active fuel account"}
                    </p>
                  </div>
                  {activeCompanyForFuel.fuelAccount && Object.keys(activeCompanyForFuel.fuelAccount.balances || {}).length > 0 && (
                    <div className="text-right flex gap-4">
                      {Object.entries(activeCompanyForFuel.fuelAccount.balances).map(([type, amount]) => (
                        <div key={type}>
                          <div className="text-2xl font-bold font-numeric text-primary">
                            {amount.toLocaleString()} <span className="text-sm font-normal">L</span>
                          </div>
                          <div className="text-xs uppercase font-medium tracking-wide text-primary/70">
                            {type}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-3">Transaction History</h4>
                  <div className="border border-border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50">
                        <tr className="border-b border-border text-xs text-muted-foreground uppercase tracking-wider text-left">
                          <th className="px-4 py-2 font-medium">Date</th>
                          <th className="px-4 py-2 font-medium">Vehicle ID</th>
                          <th className="px-4 py-2 font-medium">Fuel Type</th>
                          <th className="px-4 py-2 font-medium text-right">Deducted (L)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {loadingTransactions ? (
                          <tr>
                            <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground italic">
                              Loading transactions...
                            </td>
                          </tr>
                        ) : transactions.length > 0 ? (
                          transactions.map((tx, idx) => (
                            <tr key={idx} className="hover:bg-muted/20">
                              <td className="px-4 py-2 text-muted-foreground whitespace-nowrap">
                                {new Date(tx.timestamp).toLocaleString()}
                              </td>
                              <td className="px-4 py-2 font-mono text-xs">{tx.vehicleId || "DEPOSIT"}</td>
                              <td className="px-4 py-2 text-xs font-medium">{tx.fuelType}</td>
                              <td className="px-4 py-2 text-right font-medium text-destructive">
                                -{tx.quantityLitres}L
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground italic">
                              No transactions recorded yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter className="mt-4 pt-4 border-t border-border">
            <Button variant="outline" onClick={() => setManageFuelOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
