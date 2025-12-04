import { supabase } from "@/lib/supabaseClient";

export async function fetchPublicCalendarMonth(year: number, month: number) {
  console.log("[Public Calendar] Fetching", year, month);

  // 1️⃣ Try RPC first
  try {
    const { data, error } = await supabase.rpc("get_calendar_month", {
      p_year: year,
      p_month: month,
    });

    if (!error && data) {
      console.log("[Public Calendar] RPC result", data);
      return data;
    }

    if (error) {
      console.warn("[Public Calendar] RPC failed", error);
    }
  } catch (err) {
    console.warn("[Public Calendar] RPC exception", err);
  }

  // 2️⃣ Fallback to public view
  const fromDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const toDate = `${year}-${String(month).padStart(2, "0")}-32`;

  const { data: viewData, error: viewError } = await supabase
    .from("public_availability")
    .select("*")
    .gte("date", fromDate)
    .lt("date", toDate);

  if (viewError) {
    console.error("[Public Calendar] View fetch error", viewError);
    throw viewError;
  }

  // normalize view rows → match admin calendar format
  const normalized: Record<string, any> = {};
  (viewData || []).forEach((r) => {
    const d = r.date?.toString().slice(0, 10);
    normalized[d] = {
      full_day: !!r.full_day,
      morning: !!r.morning,
      evening: !!r.evening,
      night: !!r.night,
      short_duration: !!r.short_duration,
    };
  });

  console.log("[Public Calendar] normalized view data", normalized);
  return normalized;
}
