import { beforeEach, describe, expect, it } from "vitest";
import { randomUUID } from "crypto";

class Student {
  private creditAmount = Amount.new(0);
  private paidAmount = Amount.new(0);
  private fees = Fees.new();
  private courses = Courses.new();

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
    return this.creditAmount.value;
  }

  getCreditAmount() {
    return this.creditAmount.value - this.paidAmount.value;
  }

  getExpiredFees() {
    return this.fees.getExpired();
  }

  canAccess() {
    const expiredFees = this.fees.getExpired();
    return expiredFees.length === 0;
  }

  addCourse(id: string) {
    this.courses.add(id);
  }

  getCourses() {
    return this.courses.getList();
  }
}

class Courses {
  constructor(private courses: { id: string }[] = []) {}

  static new() {
    return new Courses();
  }

  add(id: string) {
    this.courses.push({ id });
  }

  getList() {
    return this.courses.map((c) => c.id);
  }
}

describe("Student", () => {
  describe("Given a student", () => {
    let student: Student;

    beforeEach(() => {
      student = new Student();
    });

    it("should start with no courses", () => {
      expect(student.getCourses()).toEqual([]);
    });

    describe("When add a course", () => {
      beforeEach(() => {
        student.addCourse("course-1");
      });

      it("should return in courses list", () => {
        expect(student.getCourses()).toEqual(["course-1"]);
      });
    });
  });
});

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
