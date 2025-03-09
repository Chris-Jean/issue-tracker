import { Doc } from "../convex/_generated/dataModel";

export type Issue = Omit<Doc<"issues">, "_id" | "_creationTime"> & {
  _id: any;
  _creationTime: any;
};
