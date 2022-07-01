const { UserInputError, AuthenticationError } = require("apollo-server");
const bcyrpt = require("bcryptjs");
const { User, Message } = require("../models");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const { JWT_SECRET } = require("../config/env.json");
const { withFilter } = require("graphql-subscriptions");

module.exports = {
  Query: {
    getMessages: async (parent, { from }, { user }) => {
      try {
        if (!user) throw new AuthenticationError("Unauthenticated");

        const otherUser = await User.findOne({
          where: { username: from },
        });
        if (!otherUser) throw new UserInputError("User not found");

        const usernames = [user.username, otherUser.username];

        const messages = await Message.findAll({
          where: {
            from: { [Op.in]: usernames },
            to: { [Op.in]: usernames },
          },
          order: [["createdAt", "DESC"]],
        });

        return messages;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
    getUsers: async (_, __, { user }) => {
      try {
        if (!user) throw new AuthenticationError("Unauthenticated");

        let users = await User.findAll({
          attributes: ["username", "createdAt"],
          where: { username: { [Op.ne]: user.username } },
        });

        const allUserMessages = await Message.findAll({
          where: {
            [Op.or]: [{ from: user.username }, { to: user.username }],
          },
          order: [["createdAt", "DESC"]],
        });

        users = users.map((otherUser) => {
          const latestMessage = allUserMessages.find(
            (m) => m.from === otherUser.username || m.to === otherUser.username
          );
          otherUser.latestMessage = latestMessage;
          return otherUser;
        });

        return users;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
    getOnlineUsers: async (_, __, { user }) => {
      try {
        if (!user) throw new AuthenticationError("Unauthenticated");
        const date = new Date(Date.now() - 40000);
        let users = await User.findAll({
          attributes: ["username", "createdAt"],
          where: {
            username: { [Op.ne]: user.username },
            lastSeen: { [Op.gte]: date },
          },
        });

        const allUserMessages = await Message.findAll({
          where: {
            [Op.or]: [{ from: user.username }, { to: user.username }],
          },
          order: [["createdAt", "DESC"]],
        });

        users = users.map((otherUser) => {
          const latestMessage = allUserMessages.find(
            (m) => m.from === otherUser.username || m.to === otherUser.username
          );
          otherUser.latestMessage = latestMessage;
          return otherUser;
        });

        return users;
      } catch (err) {
        console.log(err);
        throw err;
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
      let { username, password } = args;
      let errors = {};

      if (password.trim() === "")
        errors.password = "Password must not be empty";
      if (username.trim() === "")
        errors.username = "Username must not be empty";
      // find if user exists
      const userByUsername = await User.findOne({ where: { username } });
      if (userByUsername) errors.username = "Username is already registered.";

      if (Object.keys(errors) > 0) {
        throw errors;
      }
      // hash password
      password = await bcyrpt.hash(password, 6);
      // User create
      try {
        const user = await User.create({
          username,
          password,
        });
        return user;
      } catch (error) {
        console.log(err);
        throw new UserInputError("Bad Input", err);
      }
    },
    sendMessage: async (parent, { to, content }, { user, pubsub }) => {
      try {
        if (!user) throw new AuthenticationError("Unauthenticated");

        const recipient = await User.findOne({ where: { username: to } });

        if (!recipient) {
          throw new UserInputError("User not found");
        } else if (recipient.username === user.username) {
          throw new UserInputError("You cant message yourself");
        }

        if (content.trim() === "") {
          throw new UserInputError("Message is empty");
        }

        const message = await Message.create({
          from: user.username,
          to,
          content,
        });
        pubsub.publish("NEW_MESSAGE", { newMessage: message });
        return message;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
    updateLastSeen: async (parent, {}, { user, pubsub }) => {
      try {
        if (!user) throw new AuthenticationError("Unauthenticated");
        console.log(user, " --user");
        const recipient = await User.findOne({
          where: { username: user.username },
        });
        const item = await User.update(
          { lastSeen: new Date() },
          {
            where: { username: user.username },
          }
        );
        pubsub.publish("ONLINE_USERS", { getOnlineUserList: recipient });
        return recipient;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
    userLogOut: async (parent, {}, { user, pubsub }) => {
      try {
        if (!user) throw new AuthenticationError("Unauthenticated");

        const recipient = await User.findOne({
          where: { username: user.username },
        });
        pubsub.publish("OFFLINE_USERS", { userLoggedOut: recipient });
        return recipient;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
  },
  Subscription: {
    newMessage: {
      subscribe: withFilter(
        (_, __, { pubsub, user }) => {
          if (!user) throw new AuthenticationError("Unauthenticated");
          return pubsub.asyncIterator(["NEW_MESSAGE"]);
        },
        ({ newMessage }, _, { user }) => {
          if (
            // newMessage.to === user.username ||
            newMessage.to === user.username
          ) {
            return true;
          }

          return false;
        }
      ),
    },
    getOnlineUserList: {
      subscribe: withFilter(
        (_, __, { pubsub, user }) => {
          if (!user) throw new AuthenticationError("Unauthenticated");
          return pubsub.asyncIterator(["ONLINE_USERS"]);
        },
        ({ getOnlineUserList }, _, { user }) => {
          if (getOnlineUserList.username === user.username) {
            return false;
          }

          return true;
        }
      ),
    },
    userLoggedOut: {
      subscribe: withFilter(
        (_, __, { pubsub, user }) => {
          if (!user) throw new AuthenticationError("Unauthenticated");
          return pubsub.asyncIterator(["OFFLINE_USERS"]);
        },
        ({ userLoggedOut }, _, { user }) => {
          if (userLoggedOut.username === user.username) {
            return false;
          }

          return true;
        }
      ),
    },
    // getOnlineUserList: {
    //   subscribe: (_, __, { pubsub, user }) => {
    //     if (!user) throw new AuthenticationError("Unauthenticated");
    //     return pubsub.asyncIterator(["ONLINE_USERS"]);
    //   },
    // },
  },
};
