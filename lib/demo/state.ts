import { evaluateCalls } from "@/lib/demo/rules";
import { SAMPLE_PEOPLE, sampleBatch, sampleDay } from "@/lib/demo/sample";
import type { LoggedCall, Person, WorkBlock } from "@/lib/demo/types";

export type DemoState = {
  version: 1;
  people: Person[];
  calls: LoggedCall[];
  blocks: WorkBlock[];
  cleared: Record<string, string>; // personId -> ISO time it was cleared
  batches: number;
};

export type DemoAction =
  | { type: "runBatch" }
  | { type: "clearFlag"; personId: string; at: string }
  | { type: "addExtension"; person: Person }
  | { type: "reset" };

export function initialState(): DemoState {
  const { calls, blocks } = sampleDay();
  return { version: 1, people: SAMPLE_PEOPLE, calls, blocks, cleared: {}, batches: 0 };
}

export function reducer(state: DemoState, action: DemoAction): DemoState {
  switch (action.type) {
    case "runBatch": {
      const batch = sampleBatch(state.batches + 1, state.calls, state.people);
      const logged = evaluateCalls(batch, state.people, state.calls);
      return { ...state, calls: [...state.calls, ...logged], batches: state.batches + 1 };
    }
    case "clearFlag":
      if (state.cleared[action.personId]) return state;
      return { ...state, cleared: { ...state.cleared, [action.personId]: action.at } };
    case "addExtension": {
      // A taken extension is refused. Earlier "No match" calls stay exactly as they were logged.
      if (state.people.some((p) => p.extension === action.person.extension)) return state;
      return { ...state, people: [...state.people, action.person] };
    }
    case "reset":
      return initialState();
  }
}
