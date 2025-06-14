import { beforeEach, describe, expect, it } from "vitest";

class Student {
  private creditAmount = 0;

  addFee(amount: number) {
    this.creditAmount += amount;
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
  });
});
