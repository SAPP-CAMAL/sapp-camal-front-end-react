"use client";
import { Card, CardContent } from "@/components/ui/card";

export function LegendCard() {
  return (
    <Card>
      <CardContent>
        <div className="flex items-center justify-center gap-8 py-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-sm">≤ 70% Ocupación</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-sm">71-90% Ocupación</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-sm"> 90% Ocupación</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
