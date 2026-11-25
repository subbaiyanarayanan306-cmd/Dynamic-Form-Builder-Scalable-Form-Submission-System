import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

// Backend only exposes GET /api/forms/submissions. It does not expose
// individual submission GET/DELETE or pagination endpoints.
export const fetchSubmissions = createAsyncThunk("submissions/fetchAll", async (_, { rejectWithValue }) => {
  try { const { data } = await api.get("/submissions"); return data.data || []; }
  catch (e) { return rejectWithValue(e.response?.data?.message || "Unable to load submissions"); }
});
const submissionSlice = createSlice({
  name: "submissions",
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchSubmissions.pending, s => { s.loading = true; s.error = null; })
      .addCase(fetchSubmissions.fulfilled, (s,a) => { s.loading = false; s.items = a.payload; })
      .addCase(fetchSubmissions.rejected, (s,a) => { s.loading = false; s.error = a.payload; });
  },
});
export default submissionSlice.reducer;
