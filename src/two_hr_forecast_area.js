/**
 * @fileoverview Import 2-hr weather forecast area
 *
 * @description
 * Import 2 hour weather forecast area data from https://api-open.data.gov.sg/v2/real-time/api/two-hr-forecast
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
  const areaColl = db.collection("area");

  const opendata = await axios.get(
    "https://api-open.data.gov.sg/v2/real-time/api/two-hr-forecast"
  );

  const areas = opendata.data.data.area_metadata;

  let promises = [];
  areas.forEach(async area => {

    const filter = { name: area.name };

    area["location"] = area["label_location"];
    delete area.label_location;

    const updateDoc = [{
      $set: area
    }];
    const options = { upsert: true };

    promises.push(areaColl.updateOne(filter, updateDoc, options));

  })


  await Promise.all(promises);
}

main().catch(console.error);
