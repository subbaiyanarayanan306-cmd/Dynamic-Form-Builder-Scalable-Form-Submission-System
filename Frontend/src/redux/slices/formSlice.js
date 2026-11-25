import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

const messageOf = (e) => e.response?.data?.errors?.join(", ") || e.response?.data?.message || "Request failed";

export const fetchForms = createAsyncThunk("forms/fetchAll", async (_, { rejectWithValue }) => {
  try { const { data } = await api.get("/"); return data.data || []; }
  catch (e) { return rejectWithValue(messageOf(e)); }
});
export const fetchForm = createAsyncThunk("forms/fetchOne", async (id, { rejectWithValue }) => {
  try { const { data } = await api.get(`/${id}`); return data.data; }
  catch (e) { return rejectWithValue(messageOf(e)); }
});
export const saveForm = createAsyncThunk("forms/save", async ({ id, form }, { rejectWithValue }) => {
  try {
    const { data } = id ? await api.put(`/${id}`, form) : await api.post("/", form);
    return data.data;
  } catch (e) { return rejectWithValue(messageOf(e)); }
});
export const removeForm = createAsyncThunk("forms/remove", async (id, { rejectWithValue }) => {
  try { await api.delete(`/${id}`); return id; }
  catch (e) { return rejectWithValue(messageOf(e)); }
});
export const changeFormStatus = createAsyncThunk("forms/changeStatus", async ({ id, status }, { rejectWithValue }) => {
  try { const { data } = await api.patch(`/${id}/status`, { status }); return data.data; }
  catch (e) { return rejectWithValue(messageOf(e)); }
});
export const fetchPublishedForms = createAsyncThunk("forms/fetchPublished", async (_, { rejectWithValue }) => {
  try { const { data } = await api.get("/published"); return data.data || []; }
  catch (e) { return rejectWithValue(messageOf(e)); }
});

const formSlice = createSlice({
  name: "forms",
  initialState: { items: [], current: null, published: [], loading: false, error: null },
  reducers: { clearCurrent(state) { state.current = null; }, clearFormError(state) { state.error = null; } },
  extraReducers(builder) {
    builder
      .addCase(fetchForms.pending, s => { s.loading = true; s.error = null; })
      .addCase(fetchForms.fulfilled, (s,a) => { s.loading = false; s.items = a.payload; })
      .addCase(fetchForms.rejected, (s,a) => { s.loading = false; s.error = a.payload; })
      .addCase(fetchForm.pending, s => { s.loading = true; s.error = null; })
      .addCase(fetchForm.fulfilled, (s,a) => { s.loading = false; s.current = a.payload; })
      .addCase(fetchForm.rejected, (s,a) => { s.loading = false; s.error = a.payload; })
      .addCase(saveForm.fulfilled, (s,a) => {
        s.current = a.payload;
        const i = s.items.findIndex(x => x._id === a.payload._id);
        if (i >= 0) s.items[i] = a.payload; else s.items.unshift(a.payload);
      })
      .addCase(removeForm.fulfilled, (s,a) => { s.items = s.items.filter(x => x._id !== a.payload); })
      .addCase(changeFormStatus.fulfilled, (s,a) => {
        s.current = a.payload;
        const i = s.items.findIndex(x => x._id === a.payload._id);
        if (i >= 0) s.items[i] = a.payload;
      })
      .addCase(fetchPublishedForms.pending, s => { s.loading = true; s.error = null; })
      .addCase(fetchPublishedForms.fulfilled, (s,a) => { s.loading = false; s.published = a.payload; })
      .addCase(fetchPublishedForms.rejected, (s,a) => { s.loading = false; s.error = a.payload; });
  },
});
export const { clearCurrent, clearFormError } = formSlice.actions;
export default formSlice.reducer;
