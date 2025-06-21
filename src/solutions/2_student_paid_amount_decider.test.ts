import { beforeEach, describe, expect, it } from "vitest";

/**
 * Come Insegnante di Musica,
 voglio aggiungere l'importo pagato dallo studente,
 così da sapere quanto gli rimane da pagare.
 */

const INITIAL_STATE: State = {
  creditAmount: createAmount(0),
  paidAmount: createAmount(0),
};

export function studentDecider(state: State = INITIAL_STATE) {
  return {
    addFee(amount: number) {
      decide({ name: "feeAdded", amount: createAmount(amount) });
    },
    payFee(amount: number) {
      decide({ name: "feePaid", amount: createAmount(amount) });
    },
    getState() {
      return state;
    },
    getCreditAmount() {
      return substractAmount(state.creditAmount, state.paidAmount).value;
    },
  };

  function decide(decision: Decisions) {
    state = evolve(state, decision);
  }
}

function evolve(prevState: State, decision: Decisions): State {
  switch (decision.name) {
    case "feeAdded": {
      return {
        ...prevState,
        creditAmount: sumAmount(prevState.creditAmount, decision.amount),
      };
    }
    case "feePaid": {
      return {
        ...prevState,
        paidAmount: sumAmount(prevState.paidAmount, decision.amount),
      };
    }
  }
}

function createAmount(value: number): Amount {
  if (value < 0) {
    throw new Error("Amount must be positive");
  }
  return { value, __brand: "Amount" } as Amount;
}

function sumAmount(amount1: Amount, amount2: Amount) {
  return createAmount(amount1.value + amount2.value);
}

function substractAmount(amount1: Amount, amount2: Amount) {
  return createAmount(amount1.value - amount2.value);
}

type Decisions =
  | { name: "feeAdded"; amount: Amount }
  | { name: "feePaid"; amount: Amount };
type State = { creditAmount: Amount; paidAmount: Amount };
type StudentDecider = ReturnType<typeof studentDecider>;

type Amount = Brand<{ value: number }, "Amount">;

type Brand<K, T> = K & { __brand: T };

describe("Student", () => {
  describe("Given a student", () => {
    let decider: StudentDecider;

    beforeEach(() => {
      decider = studentDecider();
    });

    it("should start with a total credit amount of 0", () => {
      expect(decider.getCreditAmount()).toBe(0);
    });

    describe("When adding a fee", () => {
      beforeEach(() => {
        decider.addFee(100);
      });

      it("should increase the total credit amount", () => {
        expect(decider.getCreditAmount()).toBe(100);
      });

      it("should throw if amount is negative", () => {
        expect(() => decider.addFee(-100)).toThrow();
      });
    });

    describe("When adding multiple fees", () => {
      beforeEach(() => {
        decider.addFee(100);
        decider.addFee(200);
      });

      it("should calculate the correct total credit amount", () => {
        expect(decider.getCreditAmount()).toBe(300);
      });
    });

    describe("Given some fees", () => {
      beforeEach(() => {
        decider.addFee(300);
        decider.addFee(400);
      });

      describe("When pay a fee", () => {
        beforeEach(() => {
          decider.payFee(300);
        });

        it("should decrease the credit amount", () => {
          expect(decider.getCreditAmount()).toBe(400);
        });
      });
    });
  });
});
