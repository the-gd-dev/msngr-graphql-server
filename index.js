const express = require("express");
const http = require("http");
const dotenv = require("dotenv");
const path = require("path");
const mongoose = require("mongoose");
const { graphqlHTTP } = require("express-graphql");
const cors = require('cors')

//configuration .env
dotenv.config();

//app instance
const app = express();
//cors
app.use(cors())
//server
const server = http.createServer(app);

app.use("/", express.static(path.join(__dirname, "public")));

//graphQL API
const graphQLSchema = require("./graphql/schema");
const graphQLResolver = require("./graphql/resolvers");

app.use(
  "/api/v1/graphql",
  graphqlHTTP({
    schema: graphQLSchema,
    rootValue: graphQLResolver,
    graphiql: true,
    customFormatErrorFn(err) {
      if (!err.originalError) return err;
      return {
        data: err.originalError.data,
        message: err.originalError.message || "Unknown Server Error!",
        status: err.originalError.code || 500,
      };
    },
  })
);
//connection
const mongodbURL = process.env.MONGO_URL;
mongoose
  .connect(mongodbURL)
  .then((res) => {
    server.listen(process.env.SERVER_PORT);
    console.log(
      "\x1b[36m%s\x1b[0m",
      "Messenger Clone Server - http://localhost:" + process.env.SERVER_PORT
    );
  })
  .catch((err) => console.log("MongoDB error!!"));
