const AWS = require("aws-sdk");
const express = require("express");
const serverless = require("serverless-http");

const app = express();

const VACCINES_TABLE = process.env.VACCINES_TABLE;
const dynamoDbClient = new AWS.DynamoDB.DocumentClient();

app.use(express.json());

app.get("/vaccines", async function (req, res) {
  const params = {
    TableName: VACCINES_TABLE,
    AttributesToGet: ["id", "routingGuid"],
    Select: "SPECIFIC_ATTRIBUTES",
    ReturnConsumedCapacity: "TOTAL",
  };

  try {
    const { Items: vaccines } = await dynamoDbClient.scan(params).promise();
    if (vaccines) {
      res.json(vaccines);
    } else {
      res.status(404).json({ error: "Could retrive all vaccines" });
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: `Error while retriving all vaccines: \n${error}` });
  }
});

app.get("/vaccines/:id", async function (req, res) {
  const params = {
    TableName: VACCINES_TABLE,
    Key: {
      id: req.params.id,
    },
  };

  try {
    const { Item: vaccineData } = await dynamoDbClient.get(params).promise();
    if (vaccineData) {
      res.json(vaccineData);
    } else {
      res
        .status(404)
        .json({ error: 'Could not find vaccine with provided "id"' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Could not retreive vaccine" });
  }
});

app.post("/vaccines", async function (req, res) {
  const {
    id,
    routingGuid,
    registrationId,
    registrationNumber,
    registrationDate,
    renewalDate,
    circulationPeriod,
    manufacturerCountry,
    tradeName,
    internationalName,
    data,
  } = req.body;
  if (typeof id !== "string") {
    res.status(400).json({ error: '"id" must be a string' });
  } else if (typeof routingGuid !== "string") {
    res.status(400).json({ error: '"routingGuid" must be a string' });
  }

  const params = {
    TableName: VACCINES_TABLE,
    Item: {
      id,
      routingGuid,
      registrationId,
      registrationNumber,
      registrationDate,
      renewalDate,
      circulationPeriod,
      manufacturerCountry,
      tradeName,
      internationalName,
      data,
      updateDate: Date.now(),
    },
  };

  try {
    await dynamoDbClient.put(params).promise();
    res.json(params.Item);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Could not create vaccine" });
  }
});

app.use((req, res, next) => {
  return res.status(404).json({
    error: "Not Found",
  });
});

module.exports.handler = serverless(app);
