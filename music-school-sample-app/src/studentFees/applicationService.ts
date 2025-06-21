import { StudentFees } from "./domain";
import { Repo } from "./repo";

export function ApplicationService(repo: Repo) {
  return {
    async addFee(studentId: string, amount: number, expiration: Date) {
      const studentFees = await getOrCreate(studentId);
      const feeId = studentFees.addFee(amount, expiration);
      await repo.save(studentFees);
      return feeId;
    },
    async payFee(studentId: string, feeId: string) {
      const studentFees = await repo.getByIdOrThrow(studentId);
      studentFees.payFee(feeId);
      await repo.save(studentFees);
      return feeId;
    },
    async getTotalCreditAmount(studentId: string) {
      const studentFees = await repo.getById(studentId);
      return studentFees ? studentFees.getTotalCreditAmount() : 0;
    },
    async getExpiredFees(studentId: string) {
      const studentFees = await repo.getById(studentId);
      return studentFees ? studentFees.getExpiredFees() : [];
    },
  };

  async function getOrCreate(id: string) {
    const studentsFee = await repo.getById(id);
    if (studentsFee) return studentsFee;

    return new StudentFees(id);
  }
}

export type ApplicationService = ReturnType<typeof ApplicationService>;
