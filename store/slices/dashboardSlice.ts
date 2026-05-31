import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type DashboardSection =
  | "profile"
  | "paths"
  | "atlas"
  | "skills"
  | "opportunities"
  | "mentors"
  | "outreach"
  | "cv";

interface DashboardState {
  activeSection: DashboardSection;
  activePathwayId: string | null;
}

const initialState: DashboardState = {
  activeSection: "profile",
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
