const { UserInputError, AuthenticationError } = require("apollo-server");
const bcyrpt = require("bcryptjs");
const { User } = require("../models");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const { JWT_SECRET } = require("../config/env.json");
module.exports = {
  Query: {
    getUsers: async (_, args, context) => {
      try {
        let user;
        console.log(context.req.headers.authorization, " -- contes");
        if (context.req && context.req.headers.authorization) {
          const token = context.req.headers.authorization.split("Bearer ")[1];
          jwt.verify(token, JWT_SECRET, (err, decodedToken) => {
            if (err) {
              throw new AuthenticationError("Unauthenticated ");
            }
            user = decodedToken;
            console.log(user, " --- user decoded");
          });
        }

        const users = await User.findAll({
          where: {
            username: {
              [Op.ne]: user.username,
            },
          },
        });
        return users;
      } catch (err) {
        console.log(err);
      }
    },
    login: async (_, args) => {
      const { username, password } = args;
      let errors = {};
      try {
        const user = await User.findOne({ where: { username } });
        if (!user) {
          errors.username = "User not found";
          throw new UserInputError("User not found", { errors });
        }
        const correctPassword = await bcyrpt.compare(password, user.password);
        if (!correctPassword) {
          errors.password = "Sorry wrong password";
          throw new AuthenticationError("Incorrect password", { errors });
        }
        const token = jwt.sign({ username }, JWT_SECRET, {
          expiresIn: 60 * 60,
        });

        return {
          ...user.toJSON(),
          createdAt: user.createdAt.toISOString(),
          token,
        };
      } catch (err) {
        console.log(err);
      }
    },
  },
  Mutation: {
    register: async (_, args) => {
      let { username, email, password } = args;
      let errors = {};
      if (email.trim() === "") errors.email = "Email must not be empty";
      if (password.trim() === "")
        errors.password = "Password must not be empty";
      if (username.trim() === "")
        errors.username = "Username must not be empty";
      // find if user exists
      const userByUsername = await User.findOne({ where: { username } });
      const userByEmail = await User.findOne({ where: { email } });
      if (userByUsername) errors.username = "Username is already registered.";
      if (userByEmail) errors.email = "Email is already registered.";
      if (Object.keys(errors) > 0) {
        throw errors;
      }
      // hash password
      password = await bcyrpt.hash(password, 6);
      // User create
      try {
        console.log(email, username, password, " --- here");
        const user = await User.create({
          email,
          username,
          password,
        });
        return user;
      } catch (error) {
        console.log(err);
        throw new UserInputError("Bad Input", err);
      }
    },
  },
};
