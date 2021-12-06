const AWS = require("aws-sdk");
const express = require("express");
const serverless = require("serverless-http");

const app = express();

const VACCINES_TABLE = process.env.VACCINES_TABLE;
const INFECTIONS_TABLE = process.env.INFECTIONS_TABLE;
const CONTRAINDICATIONS_TABLE = process.env.CONTRAINDICATIONS_TABLE;

const dynamoDbClient = new AWS.DynamoDB.DocumentClient();

app.use(express.json());

/* VACCINES */

app.get("/GetVaccinesList", async function (req, res) {
  const params = {
    TableName: VACCINES_TABLE,
    AttributesToGet: ["id", "routingGuid", "internationalName"],
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

app.post("/UpsertVaccine", async function (req, res) {
  const { id, routingGuid } = req.body;
  if (typeof id !== "string") {
    res.status(400).json({ error: '"id" must be a string' });
  } else if (typeof routingGuid !== "string") {
    res.status(400).json({ error: '"routingGuid" must be a string' });
  }

  const params = {
    TableName: VACCINES_TABLE,
    Item: {
      ...req.body,
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

app.get("/GetVaccineById/:id", async function (req, res) {
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

/* INFECTIONS */

app.get("/GetInfectionsList", async function (req, res) {
  const params = {
    TableName: INFECTIONS_TABLE,
    Select: "ALL_ATTRIBUTES",
  };

  try {
    const { Items } = await dynamoDbClient.scan(params).promise();
    if (Items) {
      res.json(Items);
    } else {
      res.status(404).json({ error: "Could retrive all Items" });
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: `Error while retriving all Items: \n${error}` });
  }
});

app.post("/UpsertInfection", async function (req, res) {
  const { id } = req.body;
  if (typeof id !== "string") {
    res.status(400).json({ error: '"id" must be a string' });
  }

  const params = {
    TableName: INFECTIONS_TABLE,
    Item: {
      ...req.body,
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

/* CONTRAINDICATIONS */

app.get("/GetContraindicationsList", async function (req, res) {
  const params = {
    TableName: CONTRAINDICATIONS_TABLE,
    Select: "ALL_ATTRIBUTES",
  };

  try {
    const { Items } = await dynamoDbClient.scan(params).promise();
    if (Items) {
      res.json(Items);
    } else {
      res.status(404).json({ error: "Could retrive all Items" });
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: `Error while retriving all Items: \n${error}` });
  }
});

app.post("/UpsertContraindication", async function (req, res) {
  const { id, routingGuid } = req.body;
  if (typeof id !== "string") {
    res.status(400).json({ error: '"id" must be a string' });
  }

  const params = {
    TableName: CONTRAINDICATIONS_TABLE,
    Item: {
      ...req.body,
      updateDate: Date.now(),
    },
  };

  try {
    await dynamoDbClient.put(params).promise();
    res.json(params.Item);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: `Could not create vaccine\n${error}` });
  }
});

app.use((_req, res) => {
  return res.status(404).json({
    error: "Not Found",
  });
});

module.exports.handler = serverless(app);
