const { ApolloServer, gql } = require("apollo-server");
const { sequelize } = require("./models");
const resolvers = require("./graphql/resolvers");
const typeDefs = require("./graphql/typeDefs");
// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: (ctx) => ctx,
  csrfPrevention: true,
  cache: "bounded",
});

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
  sequelize
    .authenticate()
    .then(() => console.log(" Database connected "))
    .catch((err) => console.log("Error at db connection", err));
});
