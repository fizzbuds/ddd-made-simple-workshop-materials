import { beforeEach, describe, expect, it } from "vitest";

class Student {
  private creditAmount = Amount.new(0);
  private debitAmount = Amount.new(0);

  addFee(amount: number) {
    this.creditAmount = this.creditAmount.sum(Amount.new(amount));
  }

  payFee(amount: number) {
    this.debitAmount = this.debitAmount.sum(Amount.new(amount));
  }

  getTotalCreditAmount() {
    return this.creditAmount.value;
  }

  getCreditAmount() {
    return this.creditAmount.value - this.debitAmount.value;
  }
}

class Amount {
  constructor(public readonly value: number) {}

  static new(value: number) {
    if (value < 0) throw new Error("Amount must be positive");
    return new Amount(value);
  }

  sum(amount: Amount) {
    return Amount.new(amount.value + this.value);
  }
}

describe("Student", () => {
  describe("Given a student", () => {
    let student: Student;

    beforeEach(() => {
      student = new Student();
    });

    it("should start with a total credit amount of 0", () => {
      expect(student.getTotalCreditAmount()).toBe(0);
    });

    describe("When adding a fee", () => {
      beforeEach(() => {
        student.addFee(100, new Date("2025-02-01"));
      });

      it("should increase the total credit amount", () => {
        expect(student.getTotalCreditAmount()).toBe(100);
      });

      it("should throw if amount is negative", () => {
        expect(() => student.addFee(-100, new Date("2025-02-01"))).toThrow();
      });
    });

    describe("When adding multiple fees", () => {
      beforeEach(() => {
        student.addFee(100, new Date("2025-02-01"));
        student.addFee(200, new Date("2025-03-01"));
      });

      it("should calculate the correct total credit amount", () => {
        expect(student.getTotalCreditAmount()).toBe(300);
      });
    });

    describe("Given some fees", () => {
      let feeId1: string;

      beforeEach(() => {
        feeId1 = student.addFee(300, new Date("2025-02-01"));
        student.addFee(400, new Date("2025-03-01"));
        student.addFee(500, new Date("2030-03-01"));
      });

      describe("When pay a fee", () => {
        beforeEach(() => {
          student.payFee(feeId1);
        });

        it("should decrease the credit amount", () => {
          expect(student.getCreditAmount()).toBe(900);
        });

        it("should throw if is already paid", () => {
          expect(() => student.payFee(feeId1)).toThrow();
        });
      });

      describe("When ask for expired fees", () => {
        beforeEach(() => {
          student.payFee(feeId1);
        });

        it("should return unpaid fees with expiration in the past", () => {
          expect(student.getExpiredFees()).toEqual([
            {
              amount: 400,
              expiration: new Date("2025-03-01"),
            },
          ]);
        });
      });
    });
  });
});
