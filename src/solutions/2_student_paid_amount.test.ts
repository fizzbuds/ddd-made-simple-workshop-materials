import { beforeEach, describe, expect, it } from "vitest";

class Student {
  private creditAmount = Amount.create(0);
  private paidAmount = Amount.create(0);

  addFee(amount: number) {
    this.creditAmount = this.creditAmount.sum(Amount.create(amount));
  }

  payFee(amount: number) {
    this.paidAmount = this.paidAmount.sum(Amount.create(amount));
  }

  getTotalCreditAmount() {
    return this.creditAmount.substract(this.paidAmount).value;
  }
}

class Amount {
  constructor(public readonly value: number) {}

  static create(value: number) {
    if (value < 0) throw new Error("Amount must be positive");
    return new Amount(value);
  }

  sum(amount: Amount) {
    return Amount.create(amount.value + this.value);
  }

  substract(amount: Amount) {
    return Amount.create(this.value - amount.value);
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
        student.addFee(100);
      });

      it("should increase the total credit amount", () => {
        expect(student.getTotalCreditAmount()).toBe(100);
      });

      it("should throw if amount is negative", () => {
        expect(() => student.addFee(-100)).toThrow();
      });
    });

    describe("When adding multiple fees", () => {
      beforeEach(() => {
        student.addFee(100);
        student.addFee(200);
      });

      it("should calculate the correct total credit amount", () => {
        expect(student.getTotalCreditAmount()).toBe(300);
      });
    });

    describe("Given some fees", () => {
      beforeEach(() => {
        student.addFee(300);
        student.addFee(400);
      });

      describe("When pay a fee", () => {
        beforeEach(() => {
          student.payFee(300);
        });

        it("should decrease the credit amount", () => {
          expect(student.getTotalCreditAmount()).toBe(400);
        });
      });
    });
  });
});
