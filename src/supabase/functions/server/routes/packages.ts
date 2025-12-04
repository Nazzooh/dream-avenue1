// routes/packages.ts — Packages CRUD endpoints
import { Hono } from "hono";
import { createSupabaseClient } from "../lib/supabase.ts";
import { successResponse, errorResponse, validationErrorResponse, notFoundResponse } from "../lib/response.ts";
import { packageSchema, packageUpdateSchema } from "../schemas/validation.ts";

const packages = new Hono();

// GET all packages
packages.get("/", async (c) => {
  try {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from("packages")
      .select("*")
      .order("order_index", { ascending: true });

    if (error) throw error;
    return successResponse(c, data || []);
  } catch (err) {
    console.error("Packages fetch error:", err);
    return errorResponse(c, "Failed to fetch packages");
  }
});

// GET single package by ID
packages.get("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from("packages")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return notFoundResponse(c, "Package");
      }
      throw error;
    }

    return successResponse(c, data);
  } catch (err) {
    console.error("Package fetch error:", err);
    return errorResponse(c, "Failed to fetch package");
  }
});

// CREATE new package
packages.post("/", async (c) => {
  try {
    const body = await c.req.json();
    const validation = packageSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(c, validation.error.format());
    }

    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from("packages")
      .insert([validation.data])
      .select()
      .single();

    if (error) throw error;

    return successResponse(c, data, "Package created successfully", 201);
  } catch (err) {
    console.error("Package create error:", err);
    return errorResponse(c, "Failed to create package");
  }
});

// UPDATE package
packages.put("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const validation = packageUpdateSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(c, validation.error.format());
    }

    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from("packages")
      .update(validation.data)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return notFoundResponse(c, "Package");
      }
      throw error;
    }

    return successResponse(c, data, "Package updated successfully");
  } catch (err) {
    console.error("Package update error:", err);
    return errorResponse(c, "Failed to update package");
  }
});

// DELETE package
packages.delete("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const supabase = createSupabaseClient();
    
    const { error } = await supabase
      .from("packages")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return successResponse(c, null, "Package deleted successfully");
  } catch (err) {
    console.error("Package delete error:", err);
    return errorResponse(c, "Failed to delete package");
  }
});

export default packages;
