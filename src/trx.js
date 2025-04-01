/**
 * @fileoverview Import air temperature readings
 *
 * @description
 * Import air temperature readings from https://api-open.data.gov.sg/v2/real-time/api/air-temperature
 *
 * @author Fernando Karnagi <fkarnagi@gmail.com>
 * @version 1.0.0
 * @date 11-Feb-2025
 *
 */

const { MongoClient } = require("mongodb");
const moment = require("moment");
const params = require("./const");
const axios = require("axios");

require("dotenv").config();

async function main() {
  /**
   * Connection URI. Update <username>, <password>, and <your-cluster-url> to reflect your cluster.
   * See https://docs.mongodb.com/ecosystem/drivers/node/ for more details
   */
  const uri = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${params.HOST}/?retryWrites=true&w=majority&appName=${params.CLUSTER}`;
  // const uri = `mongodb://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@13.212.62.149:27017`;
  const client = new MongoClient(uri);

  try {
    console.log("Connecting to MongoDB Cluster ", params.HOST, " -> ", params.CLUSTER);
    await client.connect();

    console.log("Inserting records");

    await ops(client);
    console.log("Records successfully inserted");
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

async function ops(client) {
  const db = await client.db("trx");
  const coll = db.collection("trx_history");

  const doc = {
    "transactionId": 14745039,
    "accountNo": "201521449790",
    "accountType": "YYY",
    "amount": 147,
    "availableBalance": {
      "$numberLong": "75104892697565"
    },
    "beneficiaryAccountName": "PT. Mahakarya Artha Sekuritas",
    "beneficiaryCif": "8a85c1aa7cc71da1017ce990ab770300",
    "categoryCode": "C035",
    "cif": "8a85c1aa7cc71da1017ce990ab770301",
    "createdAt": {
      "$date": "2022-04-19T13:50:04.685Z"
    },
    "currency": "IDR",
    "customerId": "1359591760",
    "debitCredit": "CREDIT",
    "entryDateTime": {
      "$date": "2022-04-19T20:50:04.000Z"
    },
    "exchangeRate": 1,
    "executorCif": "8a85c5927d920045017d98b1738a678b",
    "executorName": "Lean Hauks",
    "extAccountNo": "118061928434",
    "extAdditionalInformation1": null,
    "extAdditionalInformation2": null,
    "extCardId": null,
    "extCardName": null,
    "extCardNo": null,
    "institutionalCode": "BC002",
    "institutionalName": "KAKA",
    "internalExternal": "EXTERNAL",
    "merchantLocation": null,
    "merchantName": null,
    "merchantOrderId": null,
    "notes": "BUY-052",
    "originalTransactionAmount": 147,
    "originalTransactionCurrency": "IDR",
    "partnerName": "Lean Hauks",
    "partnerOrg": "KAKA",
    "paymentInstructionID": "625ebe0b0b24cfa1325d5011",
    "piId": "625ebe0a908014b9849d5c47",
    "runningBalance": {
      "$numberLong": "75104892697565"
    },
    "sourceAccountName": "Lean Hauks",
    "sourceCif": "8a85c5927d920045017d98b1738a678b",
    "thirdPartyIncomingId": "dfa3bfca-4c98-4f2d-9978-f1120ff61077",
    "thirdPartyOutgoingId": null,
    "transactionCode": "TRC20",
    "transactionDateTime": {
      "$date": "2022-04-19T13:50:04.000Z"
    },
    "transactionIdentifier": null,
    "updatedAt": {
      "$date": "2022-04-19T13:50:04.685Z"
    }
  }



  for (let i = 0; i < 1000; i++) {
    console.log("Inserting ", i);

    let cols = [];
    for (let j = 0; j < 10000; j++) {
      let cloned = Object.assign({}, doc);
      cols.push(cloned);
    }

    await coll.insertMany(cols);
  }
}

main().catch(console.error);
