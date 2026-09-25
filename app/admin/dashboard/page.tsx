"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { 
  getPOSOrders, 
  getPOSTables, 
  getPOSInventory, 
  updateOrderStatus, 
  POSOrder, 
  POSTable, 
  POSInventoryItem 
} from "@/lib/pos-data";
import { DollarSign, ShoppingBag, Utensils, AlertTriangle, CheckCircle, XCircle, ArrowUpRight, Clock } from "lucide-react";
import Link from "next/link";

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<POSOrder[]>([]);
  const [tables, setTables] = useState<POSTable[]>([]);
  const [inventory, setInventory] = useState<POSInventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Reject Modal State
  const [rejectingOrderId, setRejectingOrderId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const refreshData = async () => {
    const [fetchedOrders, fetchedTables, fetchedInv] = await Promise.all([
      getPOSOrders(),
      getPOSTables(),
      getPOSInventory(),
    ]);
    setOrders(fetchedOrders);
    setTables(fetchedTables);
    setInventory(fetchedInv);
    setIsLoading(false);
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAcceptOrder = async (id: string) => {
    await updateOrderStatus(id, "accepted");
    await refreshData();
  };

  const handleConfirmReject = async () => {
    if (!rejectingOrderId) return;
    await updateOrderStatus(rejectingOrderId, "rejected", rejectReason || "Item unavailable");
    setRejectingOrderId(null);
    setRejectReason("");
    await refreshData();
  };

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center text-zinc-500">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  // Calculate Metrics
  const todayRevenue = orders
    .filter(o => o.status === "completed" || o.status === "served" || o.status === "ready" || o.status === "preparing" || o.status === "accepted")
    .reduce((sum, o) => sum + o.total, 0);

  const activeOrdersCount = orders.filter(o => o.status !== "completed" && o.status !== "cancelled" && o.status !== "rejected").length;
  const pendingOrders = orders.filter(o => o.status === "pending");
  const occupiedTables = tables.filter(t => t.status === "occupied").length;
  const lowStockItems = inventory.filter(i => i.status === "low" || i.status === "critical");

  return (
    <div className="space-y-6">
      {/* Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Executive Dashboard</h1>
          <p className="text-xs text-zinc-400">Real-time Grillvi POS operational overview</p>
        </div>
        <div className="flex items-center space-x-2">
          <Link href="/admin/orders">
            <Button size="sm" className="bg-orange-600 hover:bg-orange-500 text-xs font-bold">
              <span>Manage All Orders ({activeOrdersCount})</span>
              <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Low Stock Alert Banners */}
      {lowStockItems.length > 0 && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <span className="font-bold">Inventory Alert: </span>
            {lowStockItems.map(i => `${i.name} (${i.quantity} ${i.unit})`).join(", ")} requires restocking.
          </div>
          <Link href="/admin/inventory">
            <Button size="sm" variant="outline" className="text-xs border-rose-500/30 hover:bg-rose-500/20 text-rose-200">
              Restock Now
            </Button>
          </Link>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Today's Revenue</span>
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-white">Rs. {todayRevenue.toLocaleString()}</span>
            <p className="text-[11px] text-emerald-400 font-medium mt-1">From active & completed orders</p>
          </div>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Total Orders</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-white">{orders.length}</span>
            <p className="text-[11px] text-zinc-400 font-medium mt-1">{activeOrdersCount} actively in progress</p>
          </div>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Active Tables</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Utensils className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-white">{occupiedTables} / {tables.length}</span>
            <p className="text-[11px] text-emerald-400 font-medium mt-1">{Math.round((occupiedTables / (tables.length || 1)) * 100)}% Occupancy Rate</p>
          </div>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Pending Approval</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-amber-400">{pendingOrders.length}</span>
            <p className="text-[11px] text-zinc-400 font-medium mt-1">Requires immediate Admin decision</p>
          </div>
        </Card>
      </div>

      {/* Pending Orders Action Section */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white flex items-center space-x-2">
            <span>Incoming Waiter Orders Awaiting Approval</span>
            {pendingOrders.length > 0 && <Badge variant="pending">{pendingOrders.length} Pending</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingOrders.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-zinc-800 rounded-xl space-y-2">
              <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto opacity-80" />
              <p className="text-sm font-semibold text-zinc-300">No Pending Orders</p>
              <p className="text-xs text-zinc-500">All submitted waiter orders have been accepted or processed.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingOrders.map((order) => (
                <div key={order.id} className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-white text-base">Order #{order.id}</span>
                        <Badge variant="pending">Pending</Badge>
                      </div>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Table {order.table_number ? order.table_number.toString().padStart(2, "0") : "N/A"} &bull; Waiter: {order.waiter_name}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-orange-400">Rs. {order.total}</span>
                  </div>

                  {/* Itemized List */}
                  <div className="py-2 border-y border-zinc-800/80 space-y-1 text-xs text-zinc-300">
                    {order.items?.map((item) => (
                      <div key={item.id} className="flex justify-between">
                        <span>{item.menu_item_name} &times; {item.quantity}</span>
                        <span className="text-zinc-400">Rs. {item.price * item.quantity}</span>
                      </div>
                    ))}
                    {order.notes && (
                      <p className="text-[11px] text-amber-400/90 pt-1 italic">Note: "{order.notes}"</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 pt-1">
                    <Button
                      size="sm"
                      onClick={() => handleAcceptOrder(order.id)}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-xs font-bold"
                    >
                      <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                      <span>Accept Order</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => setRejectingOrderId(order.id)}
                      className="flex-1 text-xs font-bold"
                    >
                      <XCircle className="mr-1.5 h-3.5 w-3.5" />
                      <span>Reject Order</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reject Reason Modal */}
      <Modal
        isOpen={!!rejectingOrderId}
        onClose={() => setRejectingOrderId(null)}
        title={`Reject Order #${rejectingOrderId}`}
      >
        <div className="space-y-4">
          <p className="text-xs text-zinc-400">
            Please provide a rejection reason for the waiter.
          </p>
          <Input
            label="Rejection Reason"
            placeholder="e.g. Chicken unavailable, Kitchen closed..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setRejectingOrderId(null)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleConfirmReject}>
              Confirm Rejection
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}