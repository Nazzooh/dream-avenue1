// routes/gallery.ts — Gallery CRUD endpoints
import { Hono } from "hono";
import { createSupabaseClient } from "../lib/supabase.ts";
import { successResponse, errorResponse, validationErrorResponse, notFoundResponse } from "../lib/response.ts";
import { gallerySchema, galleryUpdateSchema } from "../schemas/validation.ts";

const gallery = new Hono();

// GET all gallery items
gallery.get("/", async (c) => {
  try {
    const supabase = createSupabaseClient();
    const category = c.req.query("category");
    
    let query = supabase
      .from("gallery")
      .select("*")
      .order("created_at", { ascending: false });

    if (category) {
      query = query.eq("category", category);
    }

    const { data, error } = await query;

    if (error) throw error;
    return successResponse(c, data || []);
  } catch (err) {
    console.error("Gallery fetch error:", err);
    return errorResponse(c, "Failed to fetch gallery items");
  }
});

// GET single gallery item by ID
gallery.get("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from("gallery")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return notFoundResponse(c, "Gallery item");
      }
      throw error;
    }

    return successResponse(c, data);
  } catch (err) {
    console.error("Gallery item fetch error:", err);
    return errorResponse(c, "Failed to fetch gallery item");
  }
});

// CREATE new gallery item
gallery.post("/", async (c) => {
  try {
    const body = await c.req.json();
    const validation = gallerySchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(c, validation.error.format());
    }

    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from("gallery")
      .insert([validation.data])
      .select()
      .single();

    if (error) throw error;

    return successResponse(c, data, "Gallery item created successfully", 201);
  } catch (err) {
    console.error("Gallery item create error:", err);
    return errorResponse(c, "Failed to create gallery item");
  }
});

// UPDATE gallery item
gallery.put("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const validation = galleryUpdateSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(c, validation.error.format());
    }

    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from("gallery")
      .update(validation.data)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return notFoundResponse(c, "Gallery item");
      }
      throw error;
    }

    return successResponse(c, data, "Gallery item updated successfully");
  } catch (err) {
    console.error("Gallery item update error:", err);
    return errorResponse(c, "Failed to update gallery item");
  }
});

// DELETE gallery item
gallery.delete("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const supabase = createSupabaseClient();
    
    const { error } = await supabase
      .from("gallery")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return successResponse(c, null, "Gallery item deleted successfully");
  } catch (err) {
    console.error("Gallery item delete error:", err);
    return errorResponse(c, "Failed to delete gallery item");
  }
});

export default gallery;
