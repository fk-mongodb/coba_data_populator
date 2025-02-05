/**
 * @fileoverview Import 24-hr weather forecast item
 *
 * @description
 * Import 24 hour weather forecast item data from https://api-open.data.gov.sg/v2/real-time/api/twenty-four-hr-forecast
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
  const forecastColl = db.collection("twenty_hr_forecast_general");

  const opendata = await axios.get(
    "https://api-open.data.gov.sg/v2/real-time/api/twenty-four-hr-forecast"
  );

  const general = {};
  general.date = opendata.data.data.records[0].date;
  general.updatedTimestamp = opendata.data.data.records[0].updatedTimestamp;
  general.temperature = opendata.data.data.records[0].general.temperature;
  general.relativeHumidity = opendata.data.data.records[0].general.relativeHumidity;
  general.wind = opendata.data.data.records[0].general.wind;
  general.forecast = opendata.data.data.records[0].general.forecast;
  general.period = opendata.data.data.records[0].general.validPeriod;

  let promises = [];

  const filter = { period: general.period };

  const updateDoc = [{
    $set: general
  }];
  const options = { upsert: true };

  promises.push(forecastColl.updateOne(filter, updateDoc, options));

  await Promise.all(promises);
}

main().catch(console.error);
