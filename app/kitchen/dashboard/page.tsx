"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPOSOrders, updateOrderStatus, POSOrder } from "@/lib/pos-data";
import { ChefHat, Clock, CheckCircle2, AlertCircle, Utensils, CheckSquare } from "lucide-react";

export default function KitchenDashboardPage() {
  const [orders, setOrders] = useState<POSOrder[]>([]);

  const refreshData = async () => {
    const fetched = await getPOSOrders();
    setOrders(fetched);
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 4000);
    return () => clearInterval(interval);
  }, []);

  // Filter orders that need kitchen preparation
  const kitchenTickets = orders.filter(
    (o) => o.status === "accepted" || o.status === "preparing"
  );

  const handleStartPreparing = async (id: string) => {
    await updateOrderStatus(id, "preparing");
    await refreshData();
  };

  const handleMarkReady = async (id: string) => {
    await updateOrderStatus(id, "ready");
    await refreshData();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Active Kitchen Tickets</h1>
          <p className="text-xs text-zinc-400">Orders accepted by Admin awaiting preparation</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20">
            {kitchenTickets.length} Orders in Queue
          </span>
        </div>
      </div>

      {kitchenTickets.length === 0 ? (
        <div className="p-16 text-center bg-zinc-900 border border-zinc-800 rounded-2xl space-y-3">
          <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
          <h3 className="text-lg font-bold text-white">Kitchen Queue is Clear!</h3>
          <p className="text-xs text-zinc-400">New orders will appear here automatically as soon as Admin accepts them.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {kitchenTickets.map((order) => {
            const minutesElapsed = Math.max(
              0,
              Math.floor((Date.now() - new Date(order.created_at).getTime()) / (1000 * 60))
            );

            return (
              <Card
                key={order.id}
                className={`bg-zinc-900 border-2 p-5 flex flex-col justify-between space-y-4 shadow-xl ${
                  order.status === "preparing"
                    ? "border-orange-500/80 bg-orange-950/10"
                    : "border-blue-500/50"
                }`}
              >
                <div className="space-y-3">
                  {/* Ticket Header */}
                  <div className="flex items-start justify-between pb-3 border-b border-zinc-800">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xl font-black text-white">#Order {order.id}</span>
                        <Badge variant={order.status}>{order.status}</Badge>
                      </div>
                      <p className="text-xs font-bold text-orange-400 mt-1">
                        TABLE #{order.table_number ? order.table_number.toString().padStart(2, "0") : "N/A"}
                      </p>
                      <p className="text-[11px] text-zinc-400">Waiter: {order.waiter_name}</p>
                    </div>

                    <div className="flex items-center space-x-1 text-xs font-mono font-bold text-zinc-400 bg-zinc-950 px-2.5 py-1 rounded-lg border border-zinc-800">
                      <Clock className="h-3.5 w-3.5 text-amber-400" />
                      <span>{minutesElapsed}m ago</span>
                    </div>
                  </div>

                  {/* Highlighted Preparation Notes */}
                  {order.notes && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium space-y-0.5">
                      <span className="font-extrabold uppercase tracking-wider text-[10px] text-amber-400 block">
                        ⚠️ Preparation Note
                      </span>
                      <p>"{order.notes}"</p>
                    </div>
                  )}

                  {/* Itemized Order Checklist */}
                  <div className="space-y-2 pt-1">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">
                      Dishes To Prepare ({order.items?.length || 0})
                    </span>
                    <div className="space-y-2 text-sm">
                      {order.items?.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-950 border border-zinc-800/80 font-semibold text-zinc-100"
                        >
                          <span>{item.menu_item_name}</span>
                          <span className="h-7 px-2.5 rounded-lg bg-orange-600/20 text-orange-400 border border-orange-500/30 font-extrabold flex items-center justify-center">
                            &times;{item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Kitchen Action Buttons */}
                <div className="pt-4 border-t border-zinc-800">
                  {order.status === "accepted" ? (
                    <Button
                      onClick={() => handleStartPreparing(order.id)}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs h-11 rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2"
                    >
                      <ChefHat className="h-4 w-4" />
                      <span>START PREPARING</span>
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleMarkReady(order.id)}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs h-11 rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2 animate-pulse"
                    >
                      <CheckSquare className="h-4 w-4" />
                      <span>MARK READY FOR PICKUP</span>
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
