import { Doc } from "../../convex/_generated/dataModel";

export type MetaIssue = Doc<"issues">;

export type ConvexIssue = Omit<MetaIssue, "_id" | "_creationTime"> & {
  _id?: MetaIssue["_id"];
  _creationTime?: MetaIssue["_creationTime"];
};

export type Issue = Omit<ConvexIssue, "_id" | "_creationTime">;
