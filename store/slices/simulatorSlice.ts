import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Game, StepResult, GameResult, InterestSignal } from "@/lib/simulator/types";
import { gradeStep, scoreResults } from "@/lib/simulator/engine";

// Transient gameplay state for one play-through. Lives in Redux so the player,
// progress bar, each step component and the results recap share one source of
// truth. The final GameResult is persisted on completion (see lib/simulator/persist).
export type PlayPhase = "intro" | "playing" | "reveal" | "complete";
export type SaveStatus = "idle" | "saving" | "saved" | "error";

export interface SimulatorState {
  game: Game | null;
  phase: PlayPhase;
  stepIndex: number;
  results: StepResult[];
  /** Last graded result, shown during the "reveal" phase before advancing. */
  lastResult: StepResult | null;
  interest: InterestSignal | null;
  finalResult: GameResult | null;
  saveStatus: SaveStatus;
}

const initialState: SimulatorState = {
  game: null,
  phase: "intro",
  stepIndex: 0,
  results: [],
  lastResult: null,
  interest: null,
  finalResult: null,
  saveStatus: "idle",
};

const simulatorSlice = createSlice({
  name: "simulator",
  initialState,
  reducers: {
    loadGame(state, action: PayloadAction<Game>) {
      state.game = action.payload;
      state.phase = "intro";
      state.stepIndex = 0;
      state.results = [];
      state.lastResult = null;
      state.interest = null;
      state.finalResult = null;
      state.saveStatus = "idle";
    },
    startGame(state) {
      if (state.game) state.phase = "playing";
    },
    // Grade the current step and hold on the reveal so the player sees feedback.
    submitStep(state, action: PayloadAction<unknown>) {
      if (!state.game || state.phase !== "playing") return;
      const step = state.game.steps[state.stepIndex];
      if (!step) return;
      const result = gradeStep(step, action.payload);
      state.results.push(result);
      state.lastResult = result;
      state.phase = "reveal";
    },
    // Move past the reveal to the next step, or into completion.
    advance(state) {
      if (!state.game || state.phase !== "reveal") return;
      state.lastResult = null;
      if (state.stepIndex >= state.game.steps.length - 1) {
        state.phase = "complete";
        state.finalResult = scoreResults(state.game, state.results, state.interest);
      } else {
        state.stepIndex += 1;
        state.phase = "playing";
      }
    },
    // Bespoke games (SWE/HR/Creative) run their own mechanics and report a
    // finished result through this one action — the shared frame (recap,
    // persistence, interest signal) stays identical across every game.
    completeGame(state, action: PayloadAction<GameResult>) {
      state.finalResult = action.payload;
      state.interest = action.payload.interest;
      state.phase = "complete";
    },
    setInterest(state, action: PayloadAction<InterestSignal>) {
      state.interest = action.payload;
      if (state.finalResult) state.finalResult.interest = action.payload;
    },
    setSaveStatus(state, action: PayloadAction<SaveStatus>) {
      state.saveStatus = action.payload;
    },
    resetSimulator() {
      return initialState;
    },
  },
});

export const {
  loadGame,
  startGame,
  submitStep,
  advance,
  completeGame,
  setInterest,
  setSaveStatus,
  resetSimulator,
} = simulatorSlice.actions;

export default simulatorSlice.reducer;
