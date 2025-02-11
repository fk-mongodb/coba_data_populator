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
  const coll = db.collection("air_temperature");

  const opendata = await axios.get(
    "https://api-open.data.gov.sg/v2/real-time/api/air-temperature"
  );

  const items = opendata.data.data.readings[0].data;
  const timestamp = opendata.data.data.readings[0].timestamp;

  let promises = [];
  items.forEach(async item => {

    item.timestamp = moment(timestamp).toDate();
    
    const filter = { timestamp: item.timestamp, stationId: item.stationId };

    const insertDoc = [{
      $set: item
    }];

    promises.push(coll.insertOne(filter, insertDoc));

  })

  await Promise.all(promises);
}

main().catch(console.error);
