import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  loading: boolean;
  authDisabled: boolean;
}

const initialState: AuthState = {
  user: null,
  loading: true,
  authDisabled: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User | null>) {
      state.user = action.payload;
      state.loading = false;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setAuthDisabled(state) {
      state.authDisabled = true;
      state.loading = false;
    },
    clearUser(state) {
      state.user = null;
      state.loading = false;
    },
  },
});

export const { setUser, setLoading, setAuthDisabled, clearUser } = authSlice.actions;
export default authSlice.reducer;
