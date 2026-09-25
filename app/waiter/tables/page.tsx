"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPOSTables, getPOSOrders, POSTable, POSOrder } from "@/lib/pos-data";
import { Utensils, Users, PlusCircle, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function WaiterTablesPage() {
  const router = useRouter();
  const [tables, setTables] = useState<POSTable[]>([]);
  const [orders, setOrders] = useState<POSOrder[]>([]);

  useEffect(() => {
    Promise.all([getPOSTables(), getPOSOrders()]).then(([t, o]) => {
      setTables(t);
      setOrders(o);
    });
  }, []);

  const handleTableClick = (t: POSTable) => {
    router.push(`/waiter/new-order?table=${t.table_number}`);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Floor Tables Map</h1>
        <p className="text-xs text-zinc-400">Tap any table to initiate a new order or check current occupancy</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {tables.map((t) => {
          const activeOrder = orders.find(
            (o) => o.table_number === t.table_number && o.status !== "completed" && o.status !== "cancelled" && o.status !== "rejected"
          );
          return (
            <Card
              key={t.id}
              onClick={() => handleTableClick(t)}
              className={`cursor-pointer transition-all border p-5 flex flex-col justify-between h-44 group ${
                t.status === "occupied"
                  ? "bg-orange-950/20 border-orange-500/40 hover:border-orange-500"
                  : t.status === "reserved"
                  ? "bg-sky-950/20 border-sky-500/40 hover:border-sky-500"
                  : "bg-zinc-900 border-zinc-800 hover:border-orange-500/60"
              }`}
            >
              <div className="flex items-start justify-between">
                <span className="text-3xl font-black text-white group-hover:text-orange-400 transition-colors">
                  #{t.table_number.toString().padStart(2, "0")}
                </span>
                <Badge variant={t.status}>{t.status}</Badge>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center text-xs text-zinc-400 space-x-1">
                  <Users className="h-3.5 w-3.5" />
                  <span>{t.capacity} Seats</span>
                </div>

                {activeOrder ? (
                  <p className="text-xs font-bold text-orange-400 truncate">
                    Order #{activeOrder.id} &bull; Rs. {activeOrder.total}
                  </p>
                ) : (
                  <div className="flex items-center space-x-1 text-xs font-bold text-emerald-400">
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span>Tap to Start Order</span>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
