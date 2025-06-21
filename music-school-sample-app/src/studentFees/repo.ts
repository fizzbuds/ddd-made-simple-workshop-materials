import { ISerializer, MongoAggregateRepo } from "@fizzbuds/ddd-toolkit";
import { MongoClient } from "mongodb";
import { Amount, Fees, StudentFees } from "./domain";

export function Repo() {
  const mongoClient = new MongoClient("mongodb://127.0.0.1:27017");

  const repo = new MongoAggregateRepo<StudentFees, StudentFeesModel>(
    new StudentSerializer(),
    mongoClient,
    "students_fees",
  );

  return repo;
}

export type Repo = ReturnType<typeof Repo>;

class StudentSerializer implements ISerializer<StudentFees, StudentFeesModel> {
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

interface StudentFeesModel {
  id: string;
  credit_amount: number;
  paid_amount: number;
  fees: { id: string; amount: number; expiration: Date; paid: boolean }[];
}
