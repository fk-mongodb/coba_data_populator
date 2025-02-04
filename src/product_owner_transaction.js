/**
 * @fileoverview Insert product and owner using transaction
 *
 * @description
 * Insert product and owner using transaction
 * 
 * @author Fernando Karnagi <fkarnagi@gmail.com>
 * @version 1.0.0
 * @date 4-Feb-2025
 *
 */

const { MongoClient } = require("mongodb");
const moment = require("moment");
const params = require("./const");
const axios = require("axios");
const { v4: uuidv4 } = require('uuid');

require("dotenv").config();

async function main() {
  /**
   * Connection URI. Update <username>, <password>, and <your-cluster-url> to reflect your cluster.
   * See https://docs.mongodb.com/ecosystem/drivers/node/ for more details
   */
  const uri = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${params.HOST}/?retryWrites=true&w=majority&appName=${params.CLUSTER}`;

  const client = new MongoClient(uri);

  try {
    console.log("Connecting to MongoDB Cluster ", params.HOST, " -> ", params.CLUSTER);
    await client.connect();

    console.log("Updating records");

    await ops(client);
    console.log("Records successfully updated");
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

async function ops(client) {

  const db = await client.db("coba");

  const transactionOptions = {
    readPreference: 'primary',
    readConcern: { level: 'local' },
    writeConcern: { w: 'majority' },
    maxCommitTimeMS: 1000
  };
  const session = client.startSession();
  const productCol = db.collection("product");
  const ownerCol = db.collection("owner");

  try {
    session.startTransaction(transactionOptions);

    const ownerId = uuidv4();
    const productId = uuidv4();

    const productResult = await productCol.insertOne(
      {
        ownerId,
        productId,
      },
      { session }
    );

    console.log(productResult)

    const ownerResult = await ownerCol.insertOne(
      {
        ownerId,
        name: `Fernando-${ownerId}`,
      },
      { session }
    );

    console.log(ownerResult)

    // if (true) {
    //   throw 1;
    // }

    await session.commitTransaction();
  } catch (error) {
    console.log(error);
    await session.abortTransaction();
  } finally {
    await session.endSession();
  }
}

main().catch(console.error);
