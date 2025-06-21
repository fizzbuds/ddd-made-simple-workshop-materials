import { ISerializer, MongoAggregateRepo } from "@fizzbuds/ddd-toolkit";
import { randomUUID } from "crypto";
import { MongoClient } from "mongodb";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";

describe("StudentFees repo", () => {
  const mongoClient = new MongoClient("mongodb://127.0.0.1:27017");
  const repo = new MongoAggregateRepo<StudentFees, StudentFeesModel>(
    new StudentSerializer(),
    mongoClient,
    "students_fees",
  );

  beforeAll(async () => {
    await mongoClient.connect();
    await repo.init();
  });

  afterAll(async () => {
    await mongoClient.close();
  });

  afterEach(async () => {
    await mongoClient.db().collection("students_fees").deleteMany();
  });

  describe("Given an empty StudentFees", () => {
    let id: string;

    beforeEach(async () => {
      id = randomUUID();
      const studentFees = new StudentFees(id);
      await repo.save(studentFees);
    });

    describe("When add fee", () => {
      let feeId: string;
      beforeEach(async () => {
        const studentFees = await repo.getByIdOrThrow(id);
        feeId = studentFees.addFee(100, new Date("2025-12-31"));
        await repo.save(studentFees);
      });

      it("should persist added fee", async () => {
        const studentFees = await repo.getByIdOrThrow(id);
        expect(studentFees.getTotalCreditAmount()).toBe(100);
      });

      describe("When pay fee", () => {
        beforeEach(async () => {
          const studentFees = await repo.getByIdOrThrow(id);
          studentFees.payFee(feeId);
          await repo.save(studentFees);
        });

        it("should persist paid fee", async () => {
          const studentFees = await repo.getByIdOrThrow(id);
          expect(studentFees.getTotalCreditAmount()).toBe(0);
        });
      });
    });
  });
});

interface StudentFeesModel {
  id: string;
  credit_amount: number;
  paid_amount: number;
  fees: { id: string; amount: number; expiration: Date; paid: boolean }[];
}

export class StudentSerializer
  implements ISerializer<StudentFees, StudentFeesModel>
{
  public modelToAggregate(model: StudentFeesModel): StudentFees {
    return new StudentFees(
      model.id,
      new Amount(model.credit_amount),
      new Amount(model.paid_amount),
      new Fees(
        model.fees.map((f) => ({
          id: f.id,
          amount: new Amount(f.amount),
          expiration: f.expiration,
          paid: f.paid,
        })),
      ),
    );
  }

  public aggregateToModel(aggregate: StudentFees): StudentFeesModel {
    return {
      id: aggregate.id,
      credit_amount: aggregate["creditAmount"].value,
      paid_amount: aggregate["paidAmount"].value,
      fees: aggregate["fees"]["fees"].map((f) => ({
        id: f.id,
        amount: f.amount.value,
        expiration: f.expiration,
        paid: f.paid,
      })),
    };
  }
}

class StudentFees {
  constructor(
    readonly id: string,
    private creditAmount = Amount.create(0),
    private paidAmount = Amount.create(0),
    private readonly fees = Fees.create(),
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
    }[] = [],
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
