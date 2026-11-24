import { supabase } from "../config/supabaseClient.js";

const SELECT_FIELDS = `
  id, sku, name, description, brand, condition, image_url, price, stock, category_id,
  categories ( id, name )
`;

export const ProductModel = {
  /**
   * Mengambil semua produk aktif (bukan soft-deleted)
   * Mendukung filter category_id, pencarian q, dan opsi archived=true
   */
  async getAll({ category_id, q, archived = false } = {}) {
    const isArchived = String(archived) === "true";

    try {
      // 1. Coba filter dengan deleted_at (standar rekomendasi)
      let query = supabase.from("products").select(SELECT_FIELDS);

      if (isArchived) {
        query = query.not("deleted_at", "is", null);
      } else {
        query = query.is("deleted_at", null);
      }

      if (category_id) query = query.eq("category_id", category_id);
      if (q) query = query.ilike("name", `%${q}%`);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (err) {
      // 2. Fallback jika user menambahkan kolom is_deleted (boolean)
      const errMsg = err.message || "";
      if (
        errMsg.includes("deleted_at") ||
        err.code === "42703" ||
        err.code === "PGRST204"
      ) {
        let fallbackQuery = supabase.from("products").select(SELECT_FIELDS);

        if (isArchived) {
          fallbackQuery = fallbackQuery.eq("is_deleted", true);
        } else {
          fallbackQuery = fallbackQuery.or(
            "is_deleted.is.null,is_deleted.eq.false"
          );
        }

        if (category_id) fallbackQuery = fallbackQuery.eq("category_id", category_id);
        if (q) fallbackQuery = fallbackQuery.ilike("name", `%${q}%`);

        const { data, error } = await fallbackQuery;
        if (error) throw error;
        return data;
      }
      throw err;
    }
  },

  /**
   * Mengambil detail produk berdasarkan ID
   */
  async getById(id, { allowArchived = false } = {}) {
    const { data, error } = await supabase
      .from("products")
      .select(SELECT_FIELDS)
      .eq("id", id)
      .single();
    if (error) throw error;

    // Jika produk telah di-soft-delete dan tidak diminta explicitly
    if (!allowArchived && (data.deleted_at || data.is_deleted === true)) {
      const notFoundErr = new Error(
        "Produk ini telah diarsipkan / dihapus (soft delete)"
      );
      notFoundErr.status = 404;
      notFoundErr.isDeleted = true;
      throw notFoundErr;
    }

    return data;
  },

  async create(payload) {
    const { data, error } = await supabase
      .from("products")
      .insert([payload])
      .select();
    if (error) throw error;
    return data[0];
  },

  async update(id, payload) {
    // Sanitize payload jika ada properti bawaan seperti categories atau id
    const cleanPayload = { ...payload };
    delete cleanPayload.categories;
    delete cleanPayload.id;

    const { data, error } = await supabase
      .from("products")
      .update(cleanPayload)
      .eq("id", id)
      .select(SELECT_FIELDS);
    if (error) throw error;
    return data[0];
  },

  /**
   * Soft delete produk: mengisi deleted_at dengan tanggal saat ini
   * (atau is_deleted = true jika tabel menggunakan boolean)
   */
  async remove(id) {
    const now = new Date().toISOString();

    // 1. Coba update kolom deleted_at
    let { data, error } = await supabase
      .from("products")
      .update({ deleted_at: now })
      .eq("id", id)
      .select();

    // 2. Fallback jika user menggunakan is_deleted
    if (
      error &&
      (error.message?.includes("deleted_at") ||
        error.code === "42703" ||
        error.code === "PGRST204")
    ) {
      const fallback = await supabase
        .from("products")
        .update({ is_deleted: true })
        .eq("id", id)
        .select();
      if (fallback.error) throw fallback.error;
      data = fallback.data;
      error = null;
    }

    if (error) throw error;

    return {
      message: "Produk berhasil dihapus (soft delete)",
      deleted_at: now,
      data: data && data.length > 0 ? data[0] : null,
    };
  },

  /**
   * Restore produk yang telah di-soft-delete
   */
  async restore(id) {
    // 1. Coba update deleted_at menjadi null
    let { data, error } = await supabase
      .from("products")
      .update({ deleted_at: null })
      .eq("id", id)
      .select();

    // 2. Fallback jika user menggunakan is_deleted
    if (
      error &&
      (error.message?.includes("deleted_at") ||
        error.code === "42703" ||
        error.code === "PGRST204")
    ) {
      const fallback = await supabase
        .from("products")
        .update({ is_deleted: false })
        .eq("id", id)
        .select();
      if (fallback.error) throw fallback.error;
      data = fallback.data;
      error = null;
    }

    if (error) throw error;

    return {
      message: "Produk berhasil dipulihkan (restore)",
      data: data && data.length > 0 ? data[0] : null,
    };
  },
};
