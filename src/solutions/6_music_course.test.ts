import { beforeEach, describe, expect, it } from "vitest";

class MusicCourse {
  constructor(private quota: number, private students = Students.create()) {}

  getStudents() {
    return this.students.getStudents();
  }

  enrollStudent(studentId: string) {
    if (this.students.getCount() === this.quota) {
      throw new Error("Quota reached");
    }
    this.students.enroll(studentId);
  }
}

class Students {
  constructor(private students: { id: string }[] = []) {}

  static create() {
    return new Students();
  }

  enroll(id: string) {
    this.students.push({ id });
  }

  getCount() {
    return this.students.length;
  }

  getStudents() {
    return this.students.map((s) => s.id);
  }
}

describe("MusicCourse", () => {
  describe("Given a course", () => {
    let course: MusicCourse;

    beforeEach(() => {
      course = new MusicCourse(2);
    });

    it("should start with no students", () => {
      expect(course.getStudents()).toEqual([]);
    });

    describe("When enroll a student", () => {
      beforeEach(() => {
        course.enrollStudent("student-1");
      });

      it("should return in students list", () => {
        expect(course.getStudents()).toEqual(["student-1"]);
      });

      it("should thwow if quota is reached", () => {
        course.enrollStudent("student-2");

        expect(() => course.enrollStudent("student-3")).toThrow();
      });
    });
  });
});
