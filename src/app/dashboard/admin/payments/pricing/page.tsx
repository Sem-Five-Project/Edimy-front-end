"use client";

import { useState, useEffect } from "react";
import {
  getPricingPolicies,
  updatePricingPolicy,
  type PricingPolicy,
} from "@/lib/paymentsData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Settings,
  Edit3,
  Save,
  X,
  Plus,
  RefreshCw,
  DollarSign,
  Percent,
  Calendar,
  Clock,
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Info,
} from "lucide-react";

export default function PricingPoliciesPage() {
  const [policies, setPolicies] = useState<PricingPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPolicy, setSelectedPolicy] = useState<PricingPolicy | null>(
    null,
  );
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState<Partial<PricingPolicy>>({});

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    setLoading(true);
    try {
      const response = await getPricingPolicies();
      setPolicies(response);
    } catch (error) {
      console.error("Error fetching pricing policies:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditPolicy = (policy: PricingPolicy) => {
    setSelectedPolicy(policy);
    setEditForm({ ...policy });
    setShowEditDialog(true);
  };

  const handleSavePolicy = async () => {
    if (!selectedPolicy || !editForm) return;

    setIsActionLoading(true);
    try {
      await updatePricingPolicy(selectedPolicy.id, editForm);
      setShowEditDialog(false);
      fetchPolicies();
    } catch (error) {
      console.error("Error updating policy:", error);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleTogglePolicy = (policy: PricingPolicy) => {
    setSelectedPolicy(policy);
    setEditForm({ ...policy, isActive: !policy.isActive });
    setShowConfirmDialog(true);
  };

  const confirmTogglePolicy = async () => {
    if (!selectedPolicy || editForm.isActive === undefined) return;

    setIsActionLoading(true);
    try {
      await updatePricingPolicy(selectedPolicy.id, {
        isActive: editForm.isActive,
      });
      setShowConfirmDialog(false);
      fetchPolicies();
    } catch (error) {
      console.error("Error updating policy status:", error);
    } finally {
      setIsActionLoading(false);
    }
  };

  const getStatusBadgeColor = (isActive: boolean) => {
    return isActive
      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  };

  const getRateTypeIcon = (rateType: PricingPolicy["rateType"]) => {
    switch (rateType) {
      case "percentage":
        return <Percent className="w-4 h-4" />;
      case "fixed":
        return <DollarSign className="w-4 h-4" />;
      case "tiered":
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
  };

  const formatRate = (policy: PricingPolicy) => {
    switch (policy.rateType) {
      case "percentage":
        return `${policy.rate}%`;
      case "fixed":
        return `$${policy.rate}`;
      case "tiered":
        return "Tiered";
      default:
        return `${policy.rate}`;
    }
  };

  const getTotalRevenue = () => {
    return policies
      .filter((p) => p.category === "commission" && p.isActive)
      .reduce((sum, p) => sum + (p.monthlyRevenue || 0), 0);
  };

  const getActiveCommissionRate = () => {
    const commissionPolicy = policies.find(
      (p) => p.category === "commission" && p.isActive,
    );
    return commissionPolicy ? commissionPolicy.rate : 0;
  };

  const getActivePlatformFee = () => {
    const feePolicy = policies.find(
      (p) => p.category === "platform_fee" && p.isActive,
    );
    return feePolicy ? feePolicy.rate : 0;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Pricing Policies</h1>
          <p className="text-muted-foreground">
            Configure platform pricing policies and fee structures
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchPolicies} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add New Policy
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Monthly Revenue
                </p>
                <p className="text-2xl font-bold">
                  ${getTotalRevenue().toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Percent className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Commission Rate
                </p>
                <p className="text-2xl font-bold">
                  {getActiveCommissionRate()}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Settings className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Platform Fee
                </p>
                <p className="text-2xl font-bold">${getActivePlatformFee()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Active Policies
                </p>
                <p className="text-2xl font-bold">
                  {policies.filter((p) => p.isActive).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Policy Categories */}
      <div className="space-y-6">
        {/* Commission Policies */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Percent className="w-5 h-5" />
              Commission Policies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {policies
                .filter((policy) => policy.category === "commission")
                .map((policy) => (
                  <div
                    key={policy.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {getRateTypeIcon(policy.rateType)}
                        <div>
                          <h3 className="font-medium">{policy.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {policy.description}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusBadgeColor(policy.isActive)}>
                        {policy.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-lg">
                          {formatRate(policy)}
                        </p>
                        {policy.monthlyRevenue && (
                          <p className="text-sm text-muted-foreground">
                            ${policy.monthlyRevenue.toLocaleString()}/month
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditPolicy(policy)}
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Switch
                          checked={policy.isActive}
                          onCheckedChange={() => handleTogglePolicy(policy)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Platform Fee Policies */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Platform Fee Policies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {policies
                .filter((policy) => policy.category === "platform_fee")
                .map((policy) => (
                  <div
                    key={policy.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {getRateTypeIcon(policy.rateType)}
                        <div>
                          <h3 className="font-medium">{policy.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {policy.description}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusBadgeColor(policy.isActive)}>
                        {policy.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-lg">
                          {formatRate(policy)}
                        </p>
                        {policy.monthlyRevenue && (
                          <p className="text-sm text-muted-foreground">
                            ${policy.monthlyRevenue.toLocaleString()}/month
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditPolicy(policy)}
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Switch
                          checked={policy.isActive}
                          onCheckedChange={() => handleTogglePolicy(policy)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Discount Policies */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Discount Policies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {policies
                .filter((policy) => policy.category === "discount")
                .map((policy) => (
                  <div
                    key={policy.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {getRateTypeIcon(policy.rateType)}
                        <div>
                          <h3 className="font-medium">{policy.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {policy.description}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusBadgeColor(policy.isActive)}>
                        {policy.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-lg">
                          {formatRate(policy)}
                        </p>
                        {policy.validUntil && (
                          <p className="text-sm text-muted-foreground">
                            Until{" "}
                            {new Date(policy.validUntil).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditPolicy(policy)}
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Switch
                          checked={policy.isActive}
                          onCheckedChange={() => handleTogglePolicy(policy)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Transaction Fee Policies */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Transaction Fee Policies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {policies
                .filter((policy) => policy.category === "transaction_fee")
                .map((policy) => (
                  <div
                    key={policy.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {getRateTypeIcon(policy.rateType)}
                        <div>
                          <h3 className="font-medium">{policy.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {policy.description}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusBadgeColor(policy.isActive)}>
                        {policy.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-lg">
                          {formatRate(policy)}
                        </p>
                        {policy.monthlyRevenue && (
                          <p className="text-sm text-muted-foreground">
                            ${policy.monthlyRevenue.toLocaleString()}/month
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditPolicy(policy)}
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Switch
                          checked={policy.isActive}
                          onCheckedChange={() => handleTogglePolicy(policy)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Policy Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Pricing Policy</DialogTitle>
            <DialogDescription>
              Update the pricing policy configuration
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Policy Name</Label>
              <Input
                value={editForm.name || ""}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={editForm.description || ""}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Rate</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editForm.rate || ""}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      rate: parseFloat(e.target.value) || 0,
                    }))
                  }
                />
              </div>
              <div>
                <Label>Rate Type</Label>
                <Input
                  value={editForm.rateType || ""}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>

            {editForm.category === "discount" && (
              <div>
                <Label>Valid Until</Label>
                <Input
                  type="date"
                  value={
                    editForm.validUntil
                      ? new Date(editForm.validUntil)
                          .toISOString()
                          .split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      validUntil: e.target.value,
                    }))
                  }
                />
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={editForm.isActive || false}
                onCheckedChange={(checked) =>
                  setEditForm((prev) => ({ ...prev, isActive: checked }))
                }
              />
              <Label htmlFor="active">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePolicy} disabled={isActionLoading}>
              {isActionLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Toggle Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {editForm.isActive ? "Activate" : "Deactivate"} Policy
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to{" "}
              {editForm.isActive ? "activate" : "deactivate"} the policy "
              {selectedPolicy?.name}"?
              {editForm.isActive === false && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                  <div className="flex items-center gap-2 text-yellow-800">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">
                      This will stop charging this fee/commission immediately.
                    </span>
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmTogglePolicy}
              disabled={isActionLoading}
              className={
                editForm.isActive
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }
            >
              {isActionLoading
                ? "Updating..."
                : editForm.isActive
                  ? "Activate"
                  : "Deactivate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
