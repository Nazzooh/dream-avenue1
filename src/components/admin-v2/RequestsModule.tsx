import React from "react";
import AdminLayout from "./AdminLayout";

export default function RequestsModule() {
  return (
    <AdminLayout>
      <div className="p-6 md:p-10 space-y-6">
        <h1 className="text-[#2B2B2B]">Client Requests</h1>
        <p className="text-[#2B2B2B]/60">
          Manage inquiries and booking requests submitted through the main site.
        </p>

        {/* Example Table */}
        <div className="bg-white shadow-[0_4px_14px_rgba(0,0,0,0.08)] rounded-2xl overflow-hidden border border-[#EAE7E2]">
          <table className="min-w-full divide-y divide-[#EAE7E2]">
            <thead className="bg-[#F9F7F2]">
              <tr>
                <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-[#2B2B2B]/70">
                  Client Name
                </th>
                <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-[#2B2B2B]/70">
                  Event Type
                </th>
                <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-[#2B2B2B]/70">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-[#2B2B2B]/70">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE7E2]">
              <tr className="hover:bg-[#F9F7F2] transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-[#2B2B2B]">
                  Rahul Sharma
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-[#2B2B2B]/70">
                  Wedding
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-[#2B2B2B]/70">
                  2025-11-12
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-3 py-1 rounded-full bg-[#77B255]/10 text-[#77B255] text-sm">
                    Confirmed
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-[#F9F7F2] transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-[#2B2B2B]">
                  Priya Menon
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-[#2B2B2B]/70">
                  Corporate Event
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-[#2B2B2B]/70">
                  2025-11-18
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-3 py-1 rounded-full bg-[#F39C12]/10 text-[#F39C12] text-sm">
                    Pending
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-[#F9F7F2] transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-[#2B2B2B]">
                  Amit Kumar
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-[#2B2B2B]/70">
                  Birthday Party
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-[#2B2B2B]/70">
                  2025-11-25
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-3 py-1 rounded-full bg-[#77B255]/10 text-[#77B255] text-sm">
                    Confirmed
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
