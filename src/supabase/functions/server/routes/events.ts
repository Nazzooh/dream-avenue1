// routes/events.ts — Events CRUD endpoints
import { Hono } from "hono";
import { createSupabaseClient } from "../lib/supabase.ts";
import { successResponse, errorResponse, validationErrorResponse, notFoundResponse } from "../lib/response.ts";
import { eventSchema, eventUpdateSchema } from "../schemas/validation.ts";

const events = new Hono();

// GET all events
events.get("/", async (c) => {
  try {
    const supabase = createSupabaseClient();
    const active = c.req.query("active");
    const upcoming = c.req.query("upcoming");
    
    let query = supabase
      .from("events")
      .select("*")
      .order("event_date", { ascending: false });

    if (active === "true") {
      query = query.eq("is_active", true);
    }

    if (upcoming === "true") {
      const today = new Date().toISOString().split("T")[0];
      query = query.gte("event_date", today);
    }

    const { data, error } = await query;

    if (error) throw error;
    return successResponse(c, data || []);
  } catch (err) {
    console.error("Events fetch error:", err);
    return errorResponse(c, "Failed to fetch events");
  }
});

// GET single event by ID
events.get("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return notFoundResponse(c, "Event");
      }
      throw error;
    }

    return successResponse(c, data);
  } catch (err) {
    console.error("Event fetch error:", err);
    return errorResponse(c, "Failed to fetch event");
  }
});

// CREATE new event
events.post("/", async (c) => {
  try {
    const body = await c.req.json();
    const validation = eventSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(c, validation.error.format());
    }

    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from("events")
      .insert([validation.data])
      .select()
      .single();

    if (error) throw error;

    return successResponse(c, data, "Event created successfully", 201);
  } catch (err) {
    console.error("Event create error:", err);
    return errorResponse(c, "Failed to create event");
  }
});

// UPDATE event
events.put("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const validation = eventUpdateSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(c, validation.error.format());
    }

    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from("events")
      .update(validation.data)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return notFoundResponse(c, "Event");
      }
      throw error;
    }

    return successResponse(c, data, "Event updated successfully");
  } catch (err) {
    console.error("Event update error:", err);
    return errorResponse(c, "Failed to update event");
  }
});

// DELETE event
events.delete("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const supabase = createSupabaseClient();
    
    const { error } = await supabase
      .from("events")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return successResponse(c, null, "Event deleted successfully");
  } catch (err) {
    console.error("Event delete error:", err);
    return errorResponse(c, "Failed to delete event");
  }
});

export default events;
