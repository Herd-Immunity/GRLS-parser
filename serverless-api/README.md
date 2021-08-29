# Serverless Framework Node Express API on AWS

This template demonstrates how to develop and deploy a simple Node Express API service, backed by DynamoDB database, running on AWS Lambda using the traditional Serverless Framework.

## Anatomy of the template

This template configures a single function, `api`, in `serverless.yml` which is responsible for handling all incoming requests thanks to configured `http` events. To learn more about `http` event configuration options, please refer to [http event docs](https://www.serverless.com/framework/docs/providers/aws/events/apigateway/). As the events are configured in a way to accept all incoming requests, `express` framework is responsible for routing and handling requests internally. Implementation takes advantage of `serverless-http` package, which allows you to wrap existing `express` applications. To learn more about `serverless-http`, please refer to corresponding [GitHub repository](https://github.com/dougmoscrop/serverless-http). Additionally, it also handles provisioning of a DynamoDB database that is used for storing data about vaccines. The `express` application exposes two endpoints, `POST /vaccines` and `GET /vaccine/{id}`, which allow to create and retrieve vaccines.

## Usage

### Deployment

This example is made to work with the Serverless Framework dashboard, which includes advanced features such as CI/CD, monitoring, metrics, etc.

In order to deploy with dashboard, you need to first login with:

```
serverless login
```

install dependencies with:

```
npm install
```

and then perform deployment with:

```
serverless deploy
```

After running deploy, you should see output similar to:

```bash
Serverless: Packaging service...
Serverless: Excluding development dependencies...
Serverless: Creating Stack...
Serverless: Checking Stack create progress...
........
Serverless: Stack create finished...
Serverless: Uploading CloudFormation file to S3...
Serverless: Uploading artifacts...
Serverless: Uploading service aws-node-express-dynamodb-api.zip file to S3 (718.53 KB)...
Serverless: Validating template...
Serverless: Updating Stack...
Serverless: Checking Stack update progress...
....................................
Serverless: Stack update finished...
Service Information
service: aws-node-express-dynamodb-api
stage: dev
region: us-east-1
stack: aws-node-express-dynamodb-api-dev
resources: 13
api keys:
  None
endpoints:
  ANY - https://xxxxxxx.execute-api.us-east-1.amazonaws.com/dev/
  ANY - https://xxxxxxx.execute-api.us-east-1.amazonaws.com/dev/{proxy+}
functions:
  api: aws-node-express-dynamodb-api-dev-api
layers:
  None
```

_Note_: In current form, after deployment, your API is public and can be invoked by anyone. For production deployments, you might want to configure an authorizer. For details on how to do that, refer to [http event docs](https://www.serverless.com/framework/docs/providers/aws/events/apigateway/). Additionally, in current configuration, DynamoDB Table will be removed when running `serverless remove`. To retain DynamoDB Table even after removal of the stack, add `DeletionPolicy: Retain` to its resource definition.

### Invocation

After successful deployment, you can create a new vaccine by calling the corresponding endpoint:

```bash
curl --request POST 'https://4vw5xzykw9.execute-api.us-east-1.amazonaws.com/dev/vaccines' --header 'Content-Type: application/json' --data-raw '{
    "id": "BCG_M_Microgen",
    "routingGuid": "c4592056-f001-476c-9fcf-8f64bc5ec53b",
    "registrationId": "1449366",
    "registrationNumber": "ЛС-001143",
    "registrationDate": "05.08.2011",
    "renewalDate": "15.10.2019",
    "circulationPeriod": "Бессрочный",
    "manufacturerCountry": "Россия",
    "tradeName": "Вакцина туберкулезная для щадящей первичной иммунизации (БЦЖ-М)",
    "internationalName": "Вакцина для профилактики туберкулеза",
    "data": "{\"Sources\":[{\"SourceName\":\"GRLS\",\"SourceUrl\":\"InstrImgHack\",\"Instructions\":[{\"Images\":[{\"Url\":\"\\\\InstrImg\\\\0001449366\\\\ЛС-001143[2017]_0.pdf\",\"Label\":\"Изм. № 0, ЛС-001143, 2017\"}],\"FolderPath\":null,\"Label\":\"ЛС-001143, 2017\"},{\"Images\":[{\"Url\":\"\\\\InstrImg\\\\0001449366\\\\ЛС-001143[2018]_1.pdf\",\"Label\":\"Изм. № 1, ЛС-001143, 2018\"}],\"FolderPath\":null,\"Label\":\"ЛС-001143, 2018\"},{\"Images\":[{\"Url\":\"\\\\InstrImg\\\\0001449366\\\\ЛС-001143[2019]_2.pdf\",\"Label\":\"Изм. № 2, ЛС-001143, 2019\"},{\"Url\":\"\\\\InstrImg\\\\0001449366\\\\ЛС-001143[2019]_3.pdf\",\"Label\":\"Изм. № 3, ЛС-001143, 2019\"}],\"FolderPath\":null,\"Label\":\"ЛС-001143, 2019\"}]}]}"
  }'
```

Which should result in the following response:

```bash
{"id":"BCG_M_Microgen","routingGuid":"c4592056-f001-476c-9fcf-8f64bc5ec53b","registrationId":"1449366","registrationNumber":"ЛС-001143","registrationDate":"05.08.2011","renewalDate":"15.10.2019","circulationPeriod":"Бессрочный","manufacturerCountry":"Россия","tradeName":"Вакцина туберкулезная для щадящей первичной иммунизации (БЦЖ-М)","internationalName":"Вакцина для профилактики туберкулеза","data":"{\"Sources\":[{\"SourceName\":\"GRLS\",\"SourceUrl\":\"InstrImgHack\",\"Instructions\":[{\"Images\":[{\"Url\":\"\\\\InstrImg\\\\0001449366\\\\ЛС-001143[2017]_0.pdf\",\"Label\":\"Изм. № 0, ЛС-001143, 2017\"}],\"FolderPath\":null,\"Label\":\"ЛС-001143, 2017\"},{\"Images\":[{\"Url\":\"\\\\InstrImg\\\\0001449366\\\\ЛС-001143[2018]_1.pdf\",\"Label\":\"Изм. № 1, ЛС-001143, 2018\"}],\"FolderPath\":null,\"Label\":\"ЛС-001143, 2018\"},{\"Images\":[{\"Url\":\"\\\\InstrImg\\\\0001449366\\\\ЛС-001143[2019]_2.pdf\",\"Label\":\"Изм. № 2, ЛС-001143, 2019\"},{\"Url\":\"\\\\InstrImg\\\\0001449366\\\\ЛС-001143[2019]_3.pdf\",\"Label\":\"Изм. № 3, ЛС-001143, 2019\"}],\"FolderPath\":null,\"Label\":\"ЛС-001143, 2019\"}]}]}","updateDate":1630271592930}
```

You can later retrieve the vaccine by `id` by calling the following endpoint:

```bash
curl https://4vw5xzykw9.execute-api.us-east-1.amazonaws.com/dev/vaccines/BCG_M_Microgen
```

Which should result in the following response:

```bash
{"id":"BCG_M_Microgen","routingGuid":"c4592056-f001-476c-9fcf-8f64bc5ec53b","registrationId":"1449366","registrationNumber":"ЛС-001143","registrationDate":"05.08.2011","renewalDate":"15.10.2019","circulationPeriod":"Бессрочный","manufacturerCountry":"Россия","tradeName":"Вакцина туберкулезная для щадящей первичной иммунизации (БЦЖ-М)","internationalName":"Вакцина для профилактики туберкулеза","data":"{\"Sources\":[{\"SourceName\":\"GRLS\",\"SourceUrl\":\"InstrImgHack\",\"Instructions\":[{\"Images\":[{\"Url\":\"\\\\InstrImg\\\\0001449366\\\\ЛС-001143[2017]_0.pdf\",\"Label\":\"Изм. № 0, ЛС-001143, 2017\"}],\"FolderPath\":null,\"Label\":\"ЛС-001143, 2017\"},{\"Images\":[{\"Url\":\"\\\\InstrImg\\\\0001449366\\\\ЛС-001143[2018]_1.pdf\",\"Label\":\"Изм. № 1, ЛС-001143, 2018\"}],\"FolderPath\":null,\"Label\":\"ЛС-001143, 2018\"},{\"Images\":[{\"Url\":\"\\\\InstrImg\\\\0001449366\\\\ЛС-001143[2019]_2.pdf\",\"Label\":\"Изм. № 2, ЛС-001143, 2019\"},{\"Url\":\"\\\\InstrImg\\\\0001449366\\\\ЛС-001143[2019]_3.pdf\",\"Label\":\"Изм. № 3, ЛС-001143, 2019\"}],\"FolderPath\":null,\"Label\":\"ЛС-001143, 2019\"}]}]}","updateDate":1630271592930}
```

If you try to retrieve vaccine that does not exist, you should receive the following response:

```bash
{"error":"Could not find vaccine with provided \"id\""}
```

### Local development

It is also possible to emulate DynamodB, API Gateway and Lambda locally by using `serverless-dynamodb-local` and `serverless-offline` plugins. In order to do that, execute the following commands:

```bash
serverless plugin install -n serverless-dynamodb-local
serverless plugin install -n serverless-offline
```

It will add both plugins to `devDependencies` in `package.json` file as well as will add it to `plugins` in `serverless.yml`. Make sure that `serverless-offline` is listed as last plugin in `plugins` section:

```
plugins:
  - serverless-dynamodb-local
  - serverless-offline
```

You should also add the following config to `custom` section in `serverless.yml`:

```
custom:
  (...)
  dynamodb:
    start:
      migrate: true
    stages:
      - dev
```

Additionally, we need to reconfigure `AWS.DynamoDB.DocumentClient` to connect to our local instance of DynamoDB. We can take advantage of `IS_OFFLINE` environment variable set by `serverless-offline` plugin and replace:

```javascript
const dynamoDbClient = new AWS.DynamoDB.DocumentClient();
```

with the following:

```javascript
const dynamoDbClientParams = {};
if (process.env.IS_OFFLINE) {
  dynamoDbClientParams.region = "localhost";
  dynamoDbClientParams.endpoint = "http://localhost:8000";
}
const dynamoDbClient = new AWS.DynamoDB.DocumentClient(dynamoDbClientParams);
```

After that, running the following command with start both local API Gateway emulator as well as local instance of emulated DynamoDB:

```bash
serverless offline start
```

To learn more about the capabilities of `serverless-offline` and `serverless-dynamodb-local`, please refer to their corresponding GitHub repositories:

- https://github.com/dherault/serverless-offline
- https://github.com/99x/serverless-dynamodb-local
