import { ISerializer, MongoAggregateRepo } from "@fizzbuds/ddd-toolkit";
import { randomUUID } from "crypto";
import { MongoClient } from "mongodb";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

interface StudentFeesModel {}

export class StudentSerializer
  implements ISerializer<StudentFees, StudentFeesModel> {}

class StudentFeesRepo extends MongoAggregateRepo<
  StudentFees,
  StudentFeesModel
> {
  constructor(mongoClient: MongoClient) {
    super(new StudentSerializer(), mongoClient, "students_fees");
  }
}

describe("StudentFees repo", () => {
  const mongoClient = new MongoClient("mongodb://127.0.0.1:27017");
  const repo = new StudentFeesRepo(mongoClient);

  beforeAll(async () => {
    await mongoClient.connect();
    await repo.init();
  });

  afterAll(async () => {
    await mongoClient.close();
  });

  it("should save and get StudentFees", async () => {
    const id = randomUUID();
    const studentFees = new StudentFees(id);

    studentFees.addFee(100, new Date("2025-12-31"));
    studentFees.addFee(100, new Date("2023-12-31"));
    const creditAmount = studentFees.getTotalCreditAmount();

    await repo.save(studentFees);
    const sameStudentFees = await repo.getByIdOrThrow(id);

    expect(creditAmount).toEqual(sameStudentFees.getTotalCreditAmount());
    expect(sameStudentFees.getExpiredFees().length).toBe(1);
    //expect(JSON.stringify(studentFees)).toBe(JSON.stringify(sameStudentFees));
  });
});

class StudentFees {
  constructor(
    readonly id: string,
    private creditAmount = Amount.create(0),
    private paidAmount = Amount.create(0),
    private readonly fees = Fees.create()
  ) {}

  addFee(amount: number, expiration: Date) {
    const id = this.fees.add(amount, expiration);
    this.creditAmount = this.creditAmount.sum(Amount.create(amount));
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

class Fees {
  constructor(
    private fees: {
      id: string;
      amount: Amount;
      expiration: Date;
      paid: boolean;
    }[] = []
  ) {}

  static create() {
    return new Fees();
  }

  add(amount: number, expiration: Date) {
    const id = randomUUID();
    this.fees.push({
      id,
      amount: Amount.create(amount),
      expiration,
      paid: false,
    });

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
