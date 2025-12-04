// Dream Avenue Convention Center - Cloud Dashboard Compatible Edge Function
// Single-file version for Supabase Cloud Dashboard deployment
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
// ============================================
// CONFIGURATION
// ============================================
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods":
    "GET, POST, PUT, PATCH, DELETE, OPTIONS",
};
// ============================================
// SUPABASE CLIENT
// ============================================
const getSupabaseClient = () => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  return createClient(supabaseUrl, supabaseKey);
};
// ============================================
// RESPONSE HELPERS
// ============================================
const jsonResponse = (data, status = 200) => {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
};
const successResponse = (data, message) => {
  return jsonResponse({
    success: true,
    data,
    message,
  });
};
const errorResponse = (error, status = 500) => {
  return jsonResponse(
    {
      success: false,
      error,
    },
    status,
  );
};
// ============================================
// VALIDATION HELPERS
// ============================================
const validateRequired = (obj, fields) => {
  const missing = fields.filter((f) => !obj[f]);
  if (missing.length > 0) {
    return `Missing required fields: ${missing.join(", ")}`;
  }
  return null;
};
// ============================================
// MAIN HANDLER
// ============================================
serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }
  try {
    const url = new URL(req.url);
    let path = url.pathname;
    const method = req.method;

    // Normalize path: remove function name if present
    // Supabase Cloud calls come as: /functions/v1/make-server-308644a4/api/packages
    // We want to match: /api/packages
    if (path.includes("/make-server-308644a4/")) {
      path = path.substring(
        path.indexOf("/make-server-308644a4/") + 21,
      );
    }

    console.log(
      `[${method}] ${path} (original: ${url.pathname})`,
    );

    // Health check
    if (path === "/health" || path === "/") {
      return jsonResponse({
        status: "ok",
        message: "Dream Avenue Server Running",
        version: "3.2.0-cloud",
        timestamp: new Date().toISOString(),
      });
    }
    const supabase = getSupabaseClient();
    // ============================================
    // PACKAGES ROUTES
    // ============================================
    if (path.startsWith("/api/packages")) {
      const id = path.split("/")[3];
      if (method === "GET" && !id) {
        const { data, error } = await supabase
          .from("packages")
          .select("*")
          .order("order_index", {
            ascending: true,
          });
        if (error) throw error;
        return successResponse(data || []);
      }
      if (method === "GET" && id) {
        const { data, error } = await supabase
          .from("packages")
          .select("*")
          .eq("id", id)
          .single();
        if (error) {
          if (error.code === "PGRST116") {
            return errorResponse("Package not found", 404);
          }
          throw error;
        }
        return successResponse(data);
      }
      if (method === "POST") {
        const body = await req.json();
        const validationError = validateRequired(body, [
          "name",
        ]);
        if (validationError) {
          return errorResponse(validationError, 400);
        }
        const { data, error } = await supabase
          .from("packages")
          .insert([body])
          .select()
          .single();
        if (error) throw error;
        return successResponse(
          data,
          "Package created successfully",
        );
      }
      if (method === "PUT" && id) {
        const body = await req.json();
        const { data, error } = await supabase
          .from("packages")
          .update(body)
          .eq("id", id)
          .select()
          .single();
        if (error) {
          if (error.code === "PGRST116") {
            return errorResponse("Package not found", 404);
          }
          throw error;
        }
        return successResponse(
          data,
          "Package updated successfully",
        );
      }
      if (method === "DELETE" && id) {
        const { error } = await supabase
          .from("packages")
          .delete()
          .eq("id", id);
        if (error) throw error;
        return successResponse(
          null,
          "Package deleted successfully",
        );
      }
    }
    // ============================================
    // FACILITIES ROUTES
    // ============================================
    if (path.startsWith("/api/facilities")) {
      const id = path.split("/")[3];
      if (method === "GET" && !id) {
        const { data, error } = await supabase
          .from("facilities")
          .select("*")
          .order("created_at", {
            ascending: false,
          });
        if (error) throw error;
        return successResponse(data || []);
      }
      if (method === "GET" && id) {
        const { data, error } = await supabase
          .from("facilities")
          .select("*")
          .eq("id", id)
          .single();
        if (error) {
          if (error.code === "PGRST116") {
            return errorResponse("Facility not found", 404);
          }
          throw error;
        }
        return successResponse(data);
      }
      if (method === "POST") {
        const body = await req.json();
        const validationError = validateRequired(body, [
          "title",
        ]);
        if (validationError) {
          return errorResponse(validationError, 400);
        }
        const { data, error } = await supabase
          .from("facilities")
          .insert([body])
          .select()
          .single();
        if (error) throw error;
        return successResponse(
          data,
          "Facility created successfully",
        );
      }
      if (method === "PUT" && id) {
        const body = await req.json();
        const { data, error } = await supabase
          .from("facilities")
          .update(body)
          .eq("id", id)
          .select()
          .single();
        if (error) {
          if (error.code === "PGRST116") {
            return errorResponse("Facility not found", 404);
          }
          throw error;
        }
        return successResponse(
          data,
          "Facility updated successfully",
        );
      }
      if (method === "DELETE" && id) {
        const { error } = await supabase
          .from("facilities")
          .delete()
          .eq("id", id);
        if (error) throw error;
        return successResponse(
          null,
          "Facility deleted successfully",
        );
      }
    }
    // ============================================
    // GALLERY ROUTES
    // ============================================
    if (path.startsWith("/api/gallery")) {
      const id = path.split("/")[3];
      if (method === "GET" && !id) {
        const { data, error } = await supabase
          .from("gallery")
          .select("*")
          .order("created_at", {
            ascending: false,
          });
        if (error) throw error;
        return successResponse(data || []);
      }
      if (method === "GET" && id) {
        const { data, error } = await supabase
          .from("gallery")
          .select("*")
          .eq("id", id)
          .single();
        if (error) {
          if (error.code === "PGRST116") {
            return errorResponse("Gallery item not found", 404);
          }
          throw error;
        }
        return successResponse(data);
      }
      if (method === "POST") {
        const body = await req.json();
        const validationError = validateRequired(body, [
          "title",
          "image_url",
        ]);
        if (validationError) {
          return errorResponse(validationError, 400);
        }
        const { data, error } = await supabase
          .from("gallery")
          .insert([body])
          .select()
          .single();
        if (error) throw error;
        return successResponse(
          data,
          "Gallery item created successfully",
        );
      }
      if (method === "PUT" && id) {
        const body = await req.json();
        const { data, error } = await supabase
          .from("gallery")
          .update(body)
          .eq("id", id)
          .select()
          .single();
        if (error) {
          if (error.code === "PGRST116") {
            return errorResponse("Gallery item not found", 404);
          }
          throw error;
        }
        return successResponse(
          data,
          "Gallery item updated successfully",
        );
      }
      if (method === "DELETE" && id) {
        const { error } = await supabase
          .from("gallery")
          .delete()
          .eq("id", id);
        if (error) throw error;
        return successResponse(
          null,
          "Gallery item deleted successfully",
        );
      }
    }

    // ============================================
    // EVENTS ROUTES
    // ============================================
    if (path.startsWith("/api/events")) {
      const id = path.split("/")[3];
      if (method === "GET" && !id) {
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .order("event_date", {
            ascending: false,
          });
        if (error) throw error;
        return successResponse(data || []);
      }
      if (method === "GET" && id) {
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .eq("id", id)
          .single();
        if (error) {
          if (error.code === "PGRST116") {
            return errorResponse("Event not found", 404);
          }
          throw error;
        }
        return successResponse(data);
      }
      if (method === "POST") {
        const body = await req.json();
        const validationError = validateRequired(body, [
          "title",
          "event_date",
        ]);
        if (validationError) {
          return errorResponse(validationError, 400);
        }
        const { data, error } = await supabase
          .from("events")
          .insert([body])
          .select()
          .single();
        if (error) throw error;
        return successResponse(
          data,
          "Event created successfully",
        );
      }
      if (method === "PUT" && id) {
        const body = await req.json();
        const { data, error } = await supabase
          .from("events")
          .update(body)
          .eq("id", id)
          .select()
          .single();
        if (error) {
          if (error.code === "PGRST116") {
            return errorResponse("Event not found", 404);
          }
          throw error;
        }
        return successResponse(
          data,
          "Event updated successfully",
        );
      }
      if (method === "DELETE" && id) {
        const { error } = await supabase
          .from("events")
          .delete()
          .eq("id", id);
        if (error) throw error;
        return successResponse(
          null,
          "Event deleted successfully",
        );
      }
    }
    // ============================================
    // REVIEWS ROUTES
    // ============================================
    if (path.startsWith("/api/reviews")) {
      const id = path.split("/")[3];
      if (method === "GET" && !id) {
        const { data, error } = await supabase
          .from("reviews")
          .select("*")
          .order("created_at", {
            ascending: false,
          });
        if (error) throw error;
        return successResponse(data || []);
      }
      if (method === "GET" && id) {
        const { data, error } = await supabase
          .from("reviews")
          .select("*")
          .eq("id", id)
          .single();
        if (error) {
          if (error.code === "PGRST116") {
            return errorResponse("Review not found", 404);
          }
          throw error;
        }
        return successResponse(data);
      }
      if (method === "POST") {
        const body = await req.json();
        const validationError = validateRequired(body, [
          "client_name",
          "rating",
          "review_text",
        ]);
        if (validationError) {
          return errorResponse(validationError, 400);
        }
        const { data, error } = await supabase
          .from("reviews")
          .insert([body])
          .select()
          .single();
        if (error) throw error;
        return successResponse(
          data,
          "Review created successfully",
        );
      }
      if (method === "PUT" && id) {
        const body = await req.json();
        const { data, error } = await supabase
          .from("reviews")
          .update(body)
          .eq("id", id)
          .select()
          .single();
        if (error) {
          if (error.code === "PGRST116") {
            return errorResponse("Review not found", 404);
          }
          throw error;
        }
        return successResponse(
          data,
          "Review updated successfully",
        );
      }
      if (method === "DELETE" && id) {
        const { error } = await supabase
          .from("reviews")
          .delete()
          .eq("id", id);
        if (error) throw error;
        return successResponse(
          null,
          "Review deleted successfully",
        );
      }
    }
    // ============================================
    // BOOKINGS ROUTES
    // ============================================
    if (path.startsWith("/api/bookings")) {
      const id = path.split("/")[3];
      if (method === "GET" && !id) {
        const { data, error } = await supabase
          .from("bookings")
          .select("*")
          .order("created_at", {
            ascending: false,
          });
        if (error) throw error;
        return successResponse(data || []);
      }
      if (method === "GET" && id) {
        const { data, error } = await supabase
          .from("bookings")
          .select("*")
          .eq("id", id)
          .single();
        if (error) {
          if (error.code === "PGRST116") {
            return errorResponse("Booking not found", 404);
          }
          throw error;
        }
        return successResponse(data);
      }
      if (method === "POST") {
        const body = await req.json();
        const validationError = validateRequired(body, [
          "full_name",
          "phone",
          "booking_date",
        ]);
        if (validationError) {
          return errorResponse(validationError, 400);
        }
        const { data, error } = await supabase
          .from("bookings")
          .insert([body])
          .select()
          .single();
        if (error) throw error;
        return successResponse(
          data,
          "Booking created successfully",
        );
      }
      if (method === "PUT" && id) {
        const body = await req.json();
        const { data, error } = await supabase
          .from("bookings")
          .update(body)
          .eq("id", id)
          .select()
          .single();
        if (error) {
          if (error.code === "PGRST116") {
            return errorResponse("Booking not found", 404);
          }
          throw error;
        }
        return successResponse(
          data,
          "Booking updated successfully",
        );
      }
      if (method === "DELETE" && id) {
        const { error } = await supabase
          .from("bookings")
          .delete()
          .eq("id", id);
        if (error) throw error;
        return successResponse(
          null,
          "Booking deleted successfully",
        );
      }
    }
    // ============================================
    // AVAILABILITY ROUTES (FIXES YOUR 404!)
    // ============================================
    if (path === "/api/availability") {
      if (method === "GET") {
        console.log("✅ Availability route matched");
        const urlParams = url.searchParams;
        const startDate = urlParams.get("start_date");
        const endDate = urlParams.get("end_date");
        let query = supabase
          .from("bookings")
          .select(
            "booking_date, start_time, end_time, guest_count, status",
          )
          .neq("status", "cancelled");
        if (startDate) {
          query = query.gte("booking_date", startDate);
        }
        if (endDate) {
          query = query.lte("booking_date", endDate);
        }
        const { data, error } = await query;
        if (error) throw error;
        console.log(
          `✅ Availability data fetched: ${data?.length || 0} records`,
        );
        return successResponse(data || []);
      }
    }
    if (path === "/api/availability/check") {
      if (method === "GET") {
        console.log("✅ Availability check route matched");
        const urlParams = url.searchParams;
        const date = urlParams.get("date");
        const startTime = urlParams.get("start_time");
        const endTime = urlParams.get("end_time");
        if (!date) {
          return errorResponse("Date is required", 400);
        }
        const { data, error } = await supabase
          .from("bookings")
          .select("*")
          .eq("booking_date", date)
          .neq("status", "cancelled");
        if (error) throw error;
        const conflicts = data || [];
        const isAvailable = conflicts.length === 0;
        console.log(
          `✅ Availability check for ${date}: ${isAvailable ? "Available" : "Conflicts found"}`,
        );
        return successResponse({
          available: isAvailable,
          conflicts: conflicts,
          date: date,
          requested_start: startTime,
          requested_end: endTime,
        });
      }
    }
    // ============================================
    // ANALYTICS ROUTES
    // ============================================
    // 📊 ANALYTICS SUMMARY (GET + UPDATE + UPSERT)
    if (path === "/api/analytics") {
      if (method === "GET") {
        const { data, error } = await supabase
          .from("analytics_summary")
          .select("*")
          .limit(1)
          .maybeSingle(); // ✅ Avoids "Cannot coerce..." when table is empty
        if (error) throw error;
        return jsonResponse({
          success: true,
          data: data || {
            events_hosted: 0,
            guests_served: 0,
            client_satisfaction: 100,
          },
        });
      }

      if (method === "POST" || method === "PUT") {
        const body = await req.json();

        // ✅ Ensure at least one record exists — if not, create it.
        const { data: existing, error: fetchErr } = await supabase
          .from("analytics_summary")
          .select("id")
          .limit(1)
          .maybeSingle();

        if (fetchErr) throw fetchErr;

        if (existing) {
          // ✅ Update existing analytics record
          const { data, error } = await supabase
            .from("analytics_summary")
            .update({
              events_hosted: body.events_hosted ?? 0,
              guests_served: body.guests_served ?? 0,
              client_satisfaction: body.client_satisfaction ?? 100,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existing.id)
            .select("*")
            .maybeSingle(); // prevents crash if 0 rows

          if (error) throw error;
          return successResponse(
            data,
            "Analytics updated successfully",
          );
        } else {
          // ✅ Create a new analytics summary if none exists
          const { data, error } = await supabase
            .from("analytics_summary")
            .insert([
              {
                events_hosted: body.events_hosted ?? 0,
                guests_served: body.guests_served ?? 0,
                client_satisfaction: body.client_satisfaction ?? 100,
                created_at: new Date().toISOString(),
              },
            ])
            .select("*")
            .maybeSingle();

          if (error) throw error;
          return successResponse(
            data,
            "Analytics created successfully",
          );
        }
      }
    }
    if (path === "/api/analytics/summary") {
      if (method === "GET") {
        try {
          const { data, error } = await supabase
            .from("analytics_summary")
            .select("*")
            .limit(1)
            .maybeSingle(); // ✅ Avoids "Cannot coerce..." when table is empty
          if (error) {
            console.error(
              "Analytics summary view error:",
              error,
            );
            return jsonResponse({
              success: true,
              data: {
                events_hosted: 100,
                guests_served: 2000,
                client_satisfaction: 100,
              },
            });
          }
          return jsonResponse({
            success: true,
            data: {
              events_hosted: data?.events_hosted ?? 100,
              guests_served: data?.guests_served ?? 2000,
              client_satisfaction: data?.client_satisfaction ?? 100,
            },
          });
        } catch (err) {
          console.error(
            "Analytics summary endpoint error:",
            err,
          );
          return jsonResponse({
            success: true,
            data: {
              events_hosted: 100,
              guests_served: 2000,
              client_satisfaction: 100,
            },
          });
        }
      }
    }
    // ============================================
    // DASHBOARD STATS
    // ============================================
    if (path === "/api/dashboard/stats") {
      if (method === "GET") {
        const [
          packagesResult,
          facilitiesResult,
          galleryResult,
          eventsResult,
          bookingsResult,
        ] = await Promise.all([
          supabase.from("packages").select("id", {
            count: "exact",
            head: true,
          }),
          supabase.from("facilities").select("id", {
            count: "exact",
            head: true,
          }),
          supabase.from("gallery").select("id", {
            count: "exact",
            head: true,
          }),
          supabase.from("events").select("id", {
            count: "exact",
            head: true,
          }),
          supabase.from("bookings").select("*"),
        ]);
        const stats = {
          packages: packagesResult.count || 0,
          facilities: facilitiesResult.count || 0,
          gallery: galleryResult.count || 0,
          events: eventsResult.count || 0,
          bookings: {
            total: bookingsResult.data?.length || 0,
            pending:
              bookingsResult.data?.filter(
                (b) => b.status === "pending",
              ).length || 0,
            confirmed:
              bookingsResult.data?.filter(
                (b) => b.status === "confirmed",
              ).length || 0,
            cancelled:
              bookingsResult.data?.filter(
                (b) => b.status === "cancelled",
              ).length || 0,
          },
        };
        return jsonResponse({
          success: true,
          data: stats,
        });
      }
    }
    // ============================================
    // 404 - ENDPOINT NOT FOUND
    // ============================================
    console.log(`❌ Route not found: ${method} ${path}`);
    return errorResponse(
      {
        message: `Endpoint not found: ${method} ${path}`,
        available_routes: [
          "GET /health",
          "GET /api/packages",
          "GET /api/facilities",
          "GET /api/gallery",
          "GET /api/testimonials",
          "GET /api/events",
          "GET /api/reviews",
          "GET /api/bookings",
          "GET /api/availability",
          "GET /api/availability/check",
          "GET /api/analytics",
          "GET /api/analytics/summary",
          "GET /api/dashboard/stats",
        ],
      },
      404,
    );
  } catch (error) {
    console.error("❌ Server error:", error);
    return errorResponse(
      error.message || "Internal server error",
      500,
    );
  }
});