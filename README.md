# Penn Server Challenge - 2018 PennLabs Takehome Challenge

__Technology used:__
* `Node` JavaScript on the backend
* `Express` backend API library
* `MongoDB` database
* `Handlebars` Templating engine
* `BCrypt` Secure password storing

To run the application, set up an `env.sh` connecting to Mongo. Run `npm install`,`source env.sh` and `nodemon index.js`.

# API
```javascript
/* Frontend */
GET '/'                        // Route to add users, add clubs, and change rankings

/* API */
GET '/api/'                    // Ensure API is working
GET '/api/clubs'               // Returns a list of all clubs
POST '/api/clubs'              // Create a new club
GET '/api/rankings'            // Get Jennifer's rankings
POST '/api/rankings'           // Change Jennifer's ranking
GET '/api/user/:id'            // Return a given user's information (except private information)
POST '/api/user/new'           // Create a new user
GET '/api/users'               // Return a list of all the registered users
```
# Notes
* Passwords are stored securely using BCrypt and MongoDB.
* Instead of storing the user and clubs in a JSON file, I stored them in MongoDB. Note: I did originally implement the required functionality using JSON files and you may go back in my commit history if interested in that code.
* Error checking is done to ensure fields are not empty, users are not registering with duplicate usernames, duplicate clubs aren't allowed, and users can't rank clubs with numbers outside of a given range.
* Next feature I was planning to implement was `Passport.js` secure local login and register. However I did not get to this. While you can create users in Mongo currently, there is nothing happening with the sessions indicating any sort of user login.
* The `env.sh` file contains a `MONGODB_URI` to connect to MongoDB, as well as a `jennId` to store the value of Jennifer's id as created by Mongo. For now, the routes use `jennId` instead of a user's id stored in sessions. I will send a copy of my `env.sh` file via email with my submission.
* Code is commented thoroughly throughout to explain functionality.
* Additional features implemented beyond required: functionality to add users, ability to display all users, database storage of users and clubs, and a rough beginning of a frontend using handlebars.
