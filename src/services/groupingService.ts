import api from "./api";

// GET ALL GROUPINGS
export const getGroupings = async () => {
  const res = await api.get("/groupings");
  return res.data;
};

// CREATE GROUPING
export const createGrouping = async (payload: {
  name: string;
  child_ids: string[];
  imageFile?: File | null;
}) => {
  const formData = new FormData();

  formData.append("name", payload.name);

  payload.child_ids.forEach((id) => {
    formData.append("child_ids[]", id);
  });

  if (payload.imageFile) {
    formData.append("image", payload.imageFile);
  }

  // ❌ JANGAN SET HEADER MANUAL
  const res = await api.post("/groupings", formData);

  return res.data;
};

// DELETE GROUPING
export const deleteGrouping = async (id: string) => {
  return api.delete(`/groupings/${id}`);
};

// ASSIGN CATEGORY KE GROUPING
export const assignCategoriesToGrouping = async (
  groupingId: string,
  category_ids: string[]
) => {
  const res = await api.patch(`/groupings/${groupingId}/assign`, {
    category_ids,
  });
  return res.data;
};

// REMOVE CATEGORY DARI GROUPING
export const removeCategoryFromGrouping = async (categoryId: string) => {
  const res = await api.patch(`/groupings/remove-category/${categoryId}`);
  return res.data;
};

// GET CATEGORY YANG BELUM ADA GROUPING
export const getUngroupedCategories = async () => {
  const res = await api.get("/groupings/ungrouped");
  return res.data;
};

// UPDATE GROUPING
export const updateGrouping = async (
  id: string,
  payload: { name: string; child_ids: string[]; imageFile?: File | null }
) => {
  const formData = new FormData();

  formData.append("name", payload.name);

  payload.child_ids.forEach((childId) => {
    formData.append("child_ids[]", childId);
  });

  if (payload.imageFile) {
    formData.append("image", payload.imageFile);
  }

  // 🔥 DEBUG (boleh tetap dipakai)
  console.log("=== DEBUG UPDATE GROUPING ===");
  for (let pair of formData.entries()) {
    console.log(pair[0], pair[1]);
  }

  try {
    // ❌ JANGAN SET HEADER MANUAL
    const res = await api.patch(`/groupings/${id}`, formData);

    return res.data;
  } catch (err: any) {
    console.log("ERROR RESPONSE:", err.response?.data);
    throw err;
  }
};