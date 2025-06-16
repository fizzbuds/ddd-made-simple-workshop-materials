import { beforeEach, describe, expect, it } from "vitest";
import { randomUUID } from "crypto";

class Student {
  private creditAmount = Amount.new(0);
  private paidAmount = Amount.new(0);
  private fees = Fees.new();

  addFee(amount: number, expiration: Date) {
    const id = this.fees.add(amount, expiration);
    this.creditAmount = this.creditAmount.sum(Amount.new(amount));
    return id;
  }

  payFee(id: string) {
    const amount = this.fees.pay(id);
    this.paidAmount = this.paidAmount.sum(amount);
  }

  getTotalCreditAmount() {
    return this.creditAmount.substract(this.paidAmount).value;
  }

  getExpiredFees() {
    return this.fees.getExpired();
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

  substract(amount: Amount) {
    return Amount.new(this.value - amount.value);
  }
}

class Fees {
  constructor(
    private fees: {
      id: string;
      amount: Amount;
      expiration: Date;
      paid: boolean;
    }[] = []
  ) {}

  static new() {
    return new Fees();
  }

  add(amount: number, expiration: Date) {
    const id = randomUUID();
    this.fees.push({ id, amount: Amount.new(amount), expiration, paid: false });

    return id;
  }

  pay(id: string) {
    const index = this.fees.findIndex((f) => f.id === id);
    if (index === -1) throw new Error("Fee not found");
    if (this.fees[index].paid) throw new Error("Fee already paid");

    this.fees[index].paid = true;

    return this.fees[index].amount;
  }

  getExpired() {
    return this.fees
      .filter((f) => f.paid === false && f.expiration.getTime() < Date.now())
      .map((f) => ({ amount: f.amount.value, expiration: f.expiration }));
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
      let feeId2: string;
      let feeId3: string;

      beforeEach(() => {
        feeId1 = student.addFee(300, new Date("2025-02-01"));
        feeId2 = student.addFee(400, new Date("2025-03-01"));
        feeId3 = student.addFee(500, new Date("2030-03-01"));
      });

      describe("When pay a fee", () => {
        beforeEach(() => {
          student.payFee(feeId1);
        });

        it("should decrease the credit amount", () => {
          expect(student.getTotalCreditAmount()).toBe(900);
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

      describe("When ask for access", () => {
        it("should return false if there are some expired fees", () => {
          expect(student.canAccess()).toBeFalsy();
        });

        it("should return true if there are no expired fees", () => {
          student.payFee(feeId1);
          student.payFee(feeId2);
          student.payFee(feeId3);

          expect(student.canAccess()).toBeTruthy();
        });
      });
    });
  });
});
