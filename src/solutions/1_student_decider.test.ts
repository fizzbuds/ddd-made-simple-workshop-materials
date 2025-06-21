import { beforeEach, describe, expect, it } from "vitest";

const INITIAL_STATE: State = { creditAmount: 0 };

export function studentDecider(state: State = INITIAL_STATE) {
  return {
    addFee(amount: number) {
      decide({ type: "feeAdded", amount });
    },
    getState() {
      return state;
    },
  };

  function decide(decision: Decision) {
    state = evolve(state, decision);
  }
}

function evolve(prevState: State, decision: Decision): State {
  switch (decision.type) {
    case "feeAdded": {
      return { creditAmount: prevState.creditAmount + decision.amount };
    }
  }
}

type Decision = { type: "feeAdded"; amount: number };
type State = { creditAmount: number };
type StudentDecider = ReturnType<typeof studentDecider>;

describe("Student", () => {
  describe("Given a student", () => {
    let decider: StudentDecider;

    beforeEach(() => {
      decider = studentDecider();
    });

    it("should start with a total credit amount of 0", () => {
      expect(decider.getState().creditAmount).toBe(0);
    });

    describe("When adding a fee", () => {
      beforeEach(() => {
        decider.addFee(100);
      });

      it("should increase the total credit amount", () => {
        expect(decider.getState().creditAmount).toBe(100);
      });
    });

    describe("When adding multiple fees", () => {
      beforeEach(() => {
        decider.addFee(100);
        decider.addFee(200);
      });

      it("should calculate the correct total credit amount", () => {
        expect(decider.getState().creditAmount).toBe(300);
      });
    });
  });
});
