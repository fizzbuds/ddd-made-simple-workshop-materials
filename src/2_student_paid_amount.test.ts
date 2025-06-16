import { beforeEach, describe, expect, it } from "vitest";

class Student {
  private creditAmount = 0;
  private paidAmount = 0;

  addFee(amount: number) {
    this.creditAmount += amount;
  }

  payFee(amount: number) {
    this.paidAmount += amount;
  }

  getTotalCreditAmount() {
    return this.creditAmount;
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
          expect(student.getCreditAmount()).toBe(400);
        });
      });
    });
  });
});
