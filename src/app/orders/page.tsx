"use client";

import { OrderList } from "@/components/market";
import { Segmented, Skeleton } from "@/components/ui";
import { useApp } from "@/store/app";
import { useModeOrders, useRequireAuth } from "@/store/hooks";

export default function OrdersPage() {
  const { ready, user } = useRequireAuth();
  const orders = useModeOrders();
  const mode = useApp((s) => s.mode);
  const setMode = useApp((s) => s.setMode);
  if (!ready || !user) return <div className="shell py-12"><Skeleton className="h-96" /></div>;
  return (
    <div className="shell py-8 md:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label">{mode === "buyer" ? "ORDERS / PLACED" : "ORDERS / RECEIVED"}</p>
          <h1 className="display mt-3 text-[40px] md:text-[56px]">Orders</h1>
        </div>
        {user.roles.includes("seller") && (
          <Segmented
            options={[
              { value: "buyer", label: "Buying" },
              { value: "seller", label: "Selling" },
            ]}
            value={mode}
            onChange={setMode}
          />
        )}
      </div>
      <div className="mt-8">
        <OrderList orders={orders} />
      </div>
    </div>
  );
}
