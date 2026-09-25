"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/use-auth";
import { getPOSOrders, getPOSTables, POSOrder, POSTable } from "@/lib/pos-data";
import { PlusCircle, Clock, Utensils, CheckCircle2, ArrowRight, Bell, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function WaiterDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<POSOrder[]>([]);
  const [tables, setTables] = useState<POSTable[]>([]);

  const refreshData = async () => {
    const [fetchedOrders, fetchedTables] = await Promise.all([
      user?.id ? getPOSOrders(user.id) : getPOSOrders(),
      getPOSTables(),
    ]);
    setOrders(fetchedOrders);
    setTables(fetchedTables);
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 4000);
    return () => clearInterval(interval);
  }, [user]);

  const waiterOrders = orders.filter((o) => {
    if (!user) return false;
    return (
      (o.waiter_id && o.waiter_id === user.id) ||
      (o.waiter_name && o.waiter_name.toLowerCase() === user.name.toLowerCase())
    );
  });

  const pendingCount = waiterOrders.filter((o) => o.status === "pending").length;
  const readyCount = waiterOrders.filter((o) => o.status === "ready").length;
  const preparingCount = waiterOrders.filter((o) => o.status === "preparing").length;
  const occupiedCount = tables.filter((t) => t.status === "occupied").length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-orange-950/40 via-zinc-900 to-zinc-900 border border-orange-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-4 w-4 text-orange-400" />
            <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">Floor Dashboard</span>
          </div>
          <h1 className="text-2xl font-black text-white">Good evening, {user?.name || "Ahmed"}</h1>
          <p className="text-xs text-zinc-400">Ready to take customer orders & manage table service</p>
        </div>
        <Button
          onClick={() => router.push("/waiter/new-order")}
          className="bg-orange-600 hover:bg-orange-500 font-bold text-xs h-11 px-5 rounded-xl shadow-lg shadow-orange-600/30 flex items-center space-x-2"
        >
          <PlusCircle className="h-4 w-4" />
          <span>START NEW ORDER</span>
        </Button>
      </div>

      {/* Ready for Pickup Alert */}
      {readyCount > 0 && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center justify-between animate-pulse">
          <div className="flex items-center space-x-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            <div>
              <p className="text-xs font-bold">{readyCount} Order(s) Ready for Pickup!</p>
              <p className="text-[11px] text-emerald-400/90">Kitchen has finished preparing. Please serve to tables.</p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => router.push("/waiter/orders")}
            className="bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shrink-0"
          >
            View Orders
          </Button>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="bg-zinc-900 border-zinc-800 p-4">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Ready for Pickup</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">{readyCount}</p>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800 p-4">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Pending Approval</span>
          <p className="text-2xl font-black text-amber-400 mt-1">{pendingCount}</p>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800 p-4">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">In Kitchen</span>
          <p className="text-2xl font-black text-orange-400 mt-1">{preparingCount}</p>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800 p-4">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Active Tables</span>
          <p className="text-2xl font-black text-white mt-1">{occupiedCount} / {tables.length}</p>
        </Card>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => router.push("/waiter/new-order")}
          className="p-5 rounded-2xl bg-gradient-to-br from-orange-600/20 to-zinc-900 border border-orange-500/30 hover:border-orange-500 cursor-pointer transition-all space-y-3 group"
        >
          <div className="h-10 w-10 rounded-xl bg-orange-600 text-white flex items-center justify-center font-bold">
            <PlusCircle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-base group-hover:text-orange-400 transition-colors">Create New Order</h3>
            <p className="text-xs text-zinc-400 mt-0.5">Select table, browse categories & send items</p>
          </div>
        </div>

        <div
          onClick={() => router.push("/waiter/tables")}
          className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 cursor-pointer transition-all space-y-3 group"
        >
          <div className="h-10 w-10 rounded-xl bg-zinc-800 text-zinc-200 flex items-center justify-center font-bold">
            <Utensils className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-base group-hover:text-orange-400 transition-colors">Tables Map</h3>
            <p className="text-xs text-zinc-400 mt-0.5">Check table availability & active order status</p>
          </div>
        </div>

        <div
          onClick={() => router.push("/waiter/orders")}
          className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 cursor-pointer transition-all space-y-3 group"
        >
          <div className="h-10 w-10 rounded-xl bg-zinc-800 text-zinc-200 flex items-center justify-center font-bold">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-base group-hover:text-orange-400 transition-colors">Active Orders Tracker</h3>
            <p className="text-xs text-zinc-400 mt-0.5">Track live progress & mark served</p>
          </div>
        </div>
      </div>

      {/* Recent Orders List */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-white text-base">Your Active Table Orders</CardTitle>
          <Link href="/waiter/orders" className="text-xs text-orange-400 font-bold hover:underline flex items-center">
            <span>View All</span>
            <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </CardHeader>
        <CardContent>
          {waiterOrders.length === 0 ? (
            <p className="text-xs text-zinc-500 py-4 text-center">No active orders assigned right now.</p>
          ) : (
            <div className="space-y-3">
              {waiterOrders.slice(0, 4).map((order) => (
                <div key={order.id} className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-white">Order #{order.id}</span>
                      <Badge variant={order.status}>{order.status}</Badge>
                    </div>
                    <p className="text-zinc-400 text-[11px] mt-0.5">
                      Table {order.table_number ? order.table_number.toString().padStart(2, "0") : "N/A"} &bull; {order.items?.length || 0} items
                    </p>
                  </div>
                  <span className="font-extrabold text-orange-400">Rs. {order.total}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}