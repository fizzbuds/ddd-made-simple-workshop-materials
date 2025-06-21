import { ISerializer } from "@fizzbuds/ddd-toolkit";
import { randomUUID } from "crypto";
import { describe, expect, it } from "vitest";

interface StudentFeesModel {}

export class StudentSerializer
  implements ISerializer<StudentFees, StudentFeesModel>
{
  public modelToAggregate(model: StudentFeesModel): StudentFees {}

  public aggregateToModel(aggregate: StudentFees): StudentFeesModel {}
}

describe("StudentFees serializer", () => {
  const serializer = new StudentSerializer();

  describe("aggregateToModel", () => {
    it("should convert StudentFees to StudentFeesModel", () => {
      const studentFees = new StudentFees("foo-id");
      studentFees.addFee(100, new Date("2030-12-31"));

      const model = serializer.aggregateToModel(studentFees);
      expect(model).toEqual({
        credit_amount: 100,
        fees: [
          {
            amount: 100,
            expiration: new Date("2030-12-31"),
            id: expect.any(String),
            paid: false,
          },
        ],
        id: "foo-id",
        paid_amount: 0,
      });
    });
  });

  describe("modelToAggregate", () => {
    it("should convert StudentFeesModel to StudentFees", () => {
      const model: StudentFeesModel = {
        id: "foo-id",
        credit_amount: 100,
        paid_amount: 0,
        fees: [
          {
            id: "fee-id",
            amount: 100,
            expiration: new Date("2030-12-31"),
            paid: false,
          },
        ],
      };

      const studentFees = serializer.modelToAggregate(model);
      expect(studentFees instanceof StudentFees).toBeTruthy();
      expect(studentFees.getTotalCreditAmount()).toBe(100);
      expect(studentFees.getExpiredFees().length).toBe(0);
    });
  });
});

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
