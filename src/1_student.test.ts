import { beforeEach, describe, expect, it } from "vitest";

/**
 * Come Insegnante di Musica,
 voglio aggiungere delle quote da pagare allo studente,
 così da sapere quanto mi deve pagare in totale.
 */

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
  });
});
