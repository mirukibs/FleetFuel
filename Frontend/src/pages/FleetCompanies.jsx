import { useEffect, useState } from "react";
import { Plus, Building2 } from "lucide-react";
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

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    setLoading(true);
    try {
      const data = await FleetFuelApi.fleetCompanies.list();
      setCompanies(data || []);
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
              <div key={c.id} className="p-4 rounded-xl border border-border bg-card">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-base">{c.companyName}</div>
                    <div className="text-xs text-muted-foreground mb-2">Contact: {c.contactPerson || "N/A"}</div>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={() => handleEditClick(c)}>
                    Edit
                  </Button>
                </div>
                <div className="text-sm mt-3 border-t border-border pt-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span>{c.email}</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-muted-foreground">Phone:</span>
                    <span>{c.phoneNumber}</span>
                  </div>
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
    </div>
  );
}
