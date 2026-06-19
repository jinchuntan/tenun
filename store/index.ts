import { configureStore, type EnhancedStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import dashboardReducer from "./slices/dashboardSlice";
import cvReducer from "./slices/cvSlice";
import simulatorReducer from "./slices/simulatorSlice";
import { autosaveMiddleware } from "./middleware/autosave";

export const store: EnhancedStore = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    cv: cvReducer,
    simulator: simulatorReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["auth/setUser"],
        ignoredPaths: ["auth.user"],
      },
    }).concat(autosaveMiddleware),
});

export type RootState = {
  auth: ReturnType<typeof authReducer>;
  dashboard: ReturnType<typeof dashboardReducer>;
  cv: ReturnType<typeof cvReducer>;
  simulator: ReturnType<typeof simulatorReducer>;
};
export type AppDispatch = typeof store.dispatch;
