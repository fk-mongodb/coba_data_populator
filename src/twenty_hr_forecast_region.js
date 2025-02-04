/**
 * @fileoverview Import 24-hr weather forecast by region
 *
 * @description
 * Import 24 hour weather forecast by region data from https://api-open.data.gov.sg/v2/real-time/api/twenty-four-hr-forecast
 *
 * @author Fernando Karnagi <fkarnagi@gmail.com>
 * @version 1.0.0
 * @date 27-Jan-2025
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
  const forecastColl = db.collection("twenty_hr_forecast_region");

  const opendata = await axios.get(
    "https://api-open.data.gov.sg/v2/real-time/api/twenty-four-hr-forecast"
  );

  const items = opendata.data.data.records[0].periods;

  let promises = [];
  items.forEach(async item => {

    item.period = item.timePeriod;
    delete item.timePeriod;

    const filter = { period: item.period };

    const updateDoc = [{
      $set: item
    }];
    const options = { upsert: true };

    promises.push(forecastColl.updateOne(filter, updateDoc, options));

  })

  await Promise.all(promises);
}

main().catch(console.error);
