// src/components/admin-v2/NotificationSystemTest.tsx
import React from "react";

export default function NotificationSystemTest(): JSX.Element {
  return (
    <div className="p-4 rounded-md border bg-white">
      <h3 className="text-lg font-semibold">Notification System Test</h3>
      <p className="text-sm text-muted-foreground">
        Small test component — replace with your real NotificationSystemTest
        implementation.
      </p>
      <div className="mt-3">
        <button
          type="button"
          onClick={() => console.log("NotificationSystemTest clicked")}
          className="inline-block rounded px-3 py-1 border"
        >
          Run test
        </button>
      </div>
    </div>
  );
}
