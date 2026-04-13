import { beforeEach, describe, expect, it } from "vitest";

/**
 * Come Insegnante di Musica,
 voglio aggiungere l'importo pagato dallo studente,
 così da sapere quanto gli rimane da pagare.
 */

class Student {
  private creditAmount = 0;
  private paidAmount = 0;

  issueFee(amount: number) {
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

    describe("When issuing a fee", () => {
      beforeEach(() => {
        student.issueFee(100);
      });

      it("should increase the total credit amount", () => {
        expect(student.getTotalCreditAmount()).toBe(100);
      });

      it("should throw if amount is negative", () => {
        expect(() => student.issueFee(-100)).toThrow();
      });
    });

    describe("When issuing multiple fees", () => {
      beforeEach(() => {
        student.issueFee(100);
        student.issueFee(200);
      });

      it("should calculate the correct total credit amount", () => {
        expect(student.getTotalCreditAmount()).toBe(300);
      });
    });

    describe("Given some fees", () => {
      beforeEach(() => {
        student.issueFee(300);
        student.issueFee(400);
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
