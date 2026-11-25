import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export const login = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      // Backend: POST /api/forms/login
      const { data } = await api.post("/login", credentials);
      if (!data.token) {
        return rejectWithValue(data.message || "Login response did not include a token.");
      }
      localStorage.setItem("token", data.token);
      // Backend returns token at top level and admin details in data.data
      return { token: data.token, user: data.data || null };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Unable to login. Check the backend connection."
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: localStorage.getItem("token"),
    user: null,
    isAuthenticated: Boolean(localStorage.getItem("token")),
    loading: false,
    error: null,
  },
  reducers: {
    logout(state) {
      localStorage.removeItem("token");
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearAuthError(state) { state.error = null; },
  },
  extraReducers(builder) {
    builder
      .addCase(login.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
        state.isAuthenticated = false;
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
