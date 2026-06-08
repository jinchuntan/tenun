import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type DashboardSection =
  | "summary"
  | "profile"
  | "paths"
  | "atlas"
  | "skills"
  | "opportunities"
  | "universities"
  | "mentors"
  | "outreach"
  | "cv"
  | "mock-interview";

interface DashboardState {
  activeSection: DashboardSection;
  activePathwayId: string | null;
}

const initialState: DashboardState = {
  activeSection: "summary",
  activePathwayId: null,
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    setActiveSection(state, action: PayloadAction<DashboardSection>) {
      state.activeSection = action.payload;
    },
    setActivePathwayId(state, action: PayloadAction<string>) {
      state.activePathwayId = action.payload;
    },
  },
});

export const { setActiveSection, setActivePathwayId } = dashboardSlice.actions;
export default dashboardSlice.reducer;
