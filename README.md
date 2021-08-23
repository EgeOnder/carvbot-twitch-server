# Carvbot Server

Carvbot is a Twitch bot that moderates your channel's chat.

## Features

-   Add commands and manage them.
-   Edit your prefix.
-   See detailed follower data. **_TODO_**
-   See general live information of your channel.
-   Easy and free giveaways. **_TODO_**
-   With Spotify integration, announce currently listening song. **_TODO_**
-   See and edit your profile information on Twitch. **_TODO_**

## Dependencies

-   **axios** (For handling requests)
-   **cors** (For request headers)
-   **dotenv** (Environment variable storage)
-   **express** (Handling HTTP server and REST API client)
-   **express-session** (Storing cookies and managing them)
-   **helmet** (For security reasons)
-   **mongoose** (For interacting with MongoDB)
-   **morgan** (Console logging)
-   **passport** (For authorization)
-   **passport-twitch.js** (OAuth2 with Twitch)

## Scripts

`npm start` (Default start script)
`npm run serve` (Nodemon start script)

## Installation

-   Clone the repository with `git clone https://github.com/EgeOnder/carvbot-twitch-server.git`
-   Then download all node dependencies with `npm install`
-   Create a file named `.env` inside the repository folder.
-   Enter your environment variables. (**PORT=(port)**, **SESSION_KEY=(key)**, **SESSION_SECRET=(key)**, **TWITCH_CLIENT_ID=(id)**, **TWITCH_SECRET=(key)**, **TWITCH_CALLBACK=(callback)**, **MONGODB_STRING=(connection_string)**)
-   When ready, start the server with `npm run serve`
-   Lastly, to host the frontend follow the instructions (here)[https://github.com/EgeOnder/carvbot-twitch-client.git]
