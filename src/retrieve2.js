
const startDt = new Date();
console.log("Start at ", startDt)
db = db.getSiblingDB("ecommerce-gcp");
let res = db.getCollection('transactions').aggregate(
  [
    { $match: { currency: "IDR" } },
    { $limit: 5 }
  ]
);

const length = res.toArray().length;

const endDt = new Date();

// Calculating the time difference
// of two dates
let timeDiff =
  endDt.getTime() - startDt.getTime();

let dateDiff = timeDiff / 1000;

console.log("Finish at ", endDt)

console.log("Retrieved:", length, " records within ", dateDiff, " seconds");
