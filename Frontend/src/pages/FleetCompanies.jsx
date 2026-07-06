import { useEffect, useState } from "react";
import { Building2, Fuel, Droplet } from "lucide-react";
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
import CompanyOperations from "./CompanyOperations";

export default function FleetCompanies({ user }) {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Edit Dialog
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
  const [transactions, setTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  const [operationsOpen, setOperationsOpen] = useState(false);

  useEffect(() => {
    if (user?.affiliatedServiceId) {
      loadCompany(user.affiliatedServiceId);
    }
  }, [user]);

  const loadCompany = async (companyId) => {
    setLoading(true);
    try {
      const c = await FleetFuelApi.fleetCompanies.get(companyId);
      let fuelAccount = null;
      try {
        fuelAccount = await FleetFuelApi.fuelAccounts.get(companyId);
      } catch (e) {
        // No account or error
      }
      setCompany({ ...c, fuelAccount });
    } catch (err) {
      toast.error("Failed to load company profile");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
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
      toast.success("Company profile updated");
      setEditCompanyOpen(false);
      loadCompany(user.affiliatedServiceId);
    } catch (err) {
      toast.error(err.message || "Failed to update company");
    }
  };

  const openManageFuel = async () => {
    setManageFuelOpen(true);
    setTransactions([]);
    
    if (company?.fuelAccount) {
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

  const openOperations = () => {
    setOperationsOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Company Profile"
        subtitle="Manage your fleet company details, fuel accounts, and operational units"
      />

      <div className="space-y-4">
        {loading ? (
          <div className="text-center p-8 text-muted-foreground">Loading...</div>
        ) : company ? (
          <div className="p-6 rounded-xl border border-border bg-card flex flex-col h-full max-w-2xl">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="font-display text-2xl font-semibold">{company.companyName}</div>
                <div className="text-sm text-muted-foreground mt-1">Contact: {company.contactPerson || "N/A"}</div>
              </div>
              <Button variant="outline" size="sm" onClick={handleEditClick}>
                Edit Profile
              </Button>
            </div>
            
            <div className="text-sm border-t border-border pt-4 grid grid-cols-2 gap-4">
              <div>
                <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">Email</span>
                <span className="font-medium">{company.email}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">Phone</span>
                <span className="font-medium">{company.phoneNumber}</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-border border-dashed">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Droplet className="size-5 text-primary" />
                  Fuel Account
                </div>
                {company.fuelAccount && Object.keys(company.fuelAccount.balances || {}).length > 0 ? (
                  <div className="text-right flex gap-4">
                    {Object.entries(company.fuelAccount.balances).map(([type, amount]) => (
                      <div key={type}>
                        <div className="text-lg font-bold text-primary">{amount.toLocaleString()}L</div>
                        <div className="text-[10px] uppercase text-muted-foreground tracking-wider">{type}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground italic">No active balances</div>
                )}
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1" onClick={openManageFuel}>
                  <Fuel className="size-4 mr-2" /> Manage Fuel
                </Button>
                <Button variant="secondary" className="flex-1" onClick={openOperations}>
                  <Building2 className="size-4 mr-2" /> Manage Operations
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground border-2 border-dashed rounded-xl">
            No company profile found for your account.
          </div>
        )}
      </div>

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
            {company && (
              <>
                <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-primary">{company.companyName}</h3>
                    <p className="text-xs text-primary/80">
                      {company.fuelAccount ? "Active Fuel Account" : "No active fuel account"}
                    </p>
                  </div>
                  {company.fuelAccount && Object.keys(company.fuelAccount.balances || {}).length > 0 && (
                    <div className="text-right flex gap-4">
                      {Object.entries(company.fuelAccount.balances).map(([type, amount]) => (
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

      {company && (
        <CompanyOperations 
          open={operationsOpen} 
          onOpenChange={setOperationsOpen} 
          company={company} 
        />
      )}
    </div>
  );
}
