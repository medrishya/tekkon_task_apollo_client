# tekkon_task_apollo_client

Build a simple app using apollo server/client using real time data. It should ask the user to login and pick up where they left off. It should also show them how many other users are currently online. I would suggest a chat app, but entirely up to them.

# June 30 2022

- Frontend application on antdesign has been setup
- Backend application on apollo client has been setup
- Created register and login segment on backend application
- Integrated register and login segment on frontend application

# Features

- Can register user
- Can login and logout user
- Shows online user list
- Can send message and see the message realtime by the users logged in.

# Setup instructions

# backend setup

- Go to backend folder run `npm install`
- Create a mysql user with following credentials
  username: tekkon_task
  password: tekkon_task
  db: tekkon_task
- Grand all privileges on db to tekkon_task
- Run `npm i sequelize-cli -g`
- Run `npx sequelize-cli db:migrate`
- Run `npm run dev`

# frontend setup

- Go to backend folder run `npm install`
- Run `npm start`
