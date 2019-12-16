# Node TypeScript Media Service


# Directory Structure

```
.
├── .vscode
│   ├── launch.json
│   ├── settings.json
│   └── tasks.json
├── src                        <- source code of the application
│   ├── server
│   │   ├── config
|   │   |   ├── settings.linux.ts
│   │   │   └── settings.ts
│   │   ├── enums
│   │   │   ├── client-state-type.enum.ts
│   │   │   ├── command-state.enum.ts
│   │   │   ├── command-type.enum.ts
│   │   │   └── media-content-type.enum.ts
│   │   ├── http-handllers
│   │   │   ├── client.hander.ts
│   │   │   ├── command.handler.ts
│   │   │   ├── http.handler.ts
│   │   │   ├── media.handler.ts
│   │   │   ├── report.handler.ts
│   │   │   └── routes.ts
│   │   ├── models
│   │   │   ├── client-state-log.model.ts
│   │   │   ├── client-state.model.ts
│   │   │   ├── command-queue.model.ts
│   │   │   ├── command.model.ts
│   │   │   ├── media-content.model.ts
│   │   │   ├── media-matrix.model.ts
│   │   │   ├── pattern-item.model.ts
│   │   │   ├── playlist-schedule.model.ts
│   │   │   ├── playlist-template.model.ts
│   │   │   ├── playlist.model.ts
│   │   │   ├── pouch-document.model.ts
│   │   │   ├── simple-socket-message.model.ts
│   │   │   └── stream.model.ts
│   │   ├── repositories
│   │   │   ├── client-media.ts
│   │   │   ├── command.ts
│   │   │   ├── media.ts
│   │   │   └── repository.ts
│   │   ├── services
│   │   │   ├── client.ts
│   │   │   ├── command.queue.ts
│   │   │   ├── command.ts
│   │   │   ├── debug.logging.ts
│   │   │   ├── file.ts
│   │   │   ├── media.ts
│   │   │   ├── playlist.queue.ts
│   │   │   └── report.ts
│   │   ├── socket-handlers
│   │   │   └── router.ts
│   │   ├── ecosystem.config.js
│   │   ├── index.ts
│   │   └── util.ts
|   └── index.ts
├── .gitignore
├── Node Media Service.postman_collection.json
├── package-lock.json          <- project dependencies version lock file
├── package.json               <- project dependencies
├── README.md                  <- this document
├── tsconfig.json              <- configuration of the typescript project (ts-node, which runs the prestart task)
└── tslint.json                <- tslint configuration
```

# Runtime Directory Structure

```
.
├── dist
│   ├── server
│   |   ├── config
│   |   │   ├── settings.js                 <- settings for windows environment
│   |   │   └── settings.linux.js           <- settings for linux environment
│   |   ├── enums
│   |   │   ├── client-state-type.enum.js
│   |   │   ├── command-state.enum.js
│   |   │   ├── command-type.enum.js
│   |   │   └── media-content-type.enum.js
│   |   ├── http-handlers                   <- http routes
│   |   |   ├── client.handler.js
│   |   |   ├── http.handler.js
│   |   |   ├── media.handler.js
│   |   |   ├── report.handler.js
│   |   |   └── routes.js                   <- web api route registration
│   |   ├── models
│   |   │   ├── client-state-log.model.js
│   |   │   ├── client-state.model.js
│   |   │   ├── command-queue.model.js
│   |   │   ├── command.model.js
│   |   │   ├── media-content.model.js
|   |   │   ├── media-matrix.model.js
|   |   │   ├── pattern-item.model.js
|   |   │   ├── playlist-schedule.model.js
|   |   │   ├── playlist-template.model.js
|   |   │   ├── playlist.model.js
|   |   │   ├── pouch-document.model.js
|   |   │   ├── simple-socket-message.model.js
|   |   │   └── stream.interface.js
│   |   ├── repositories                    <- repository layer
│   |   |   ├── client-media.js
│   |   |   ├── commands.js
│   |   |   ├── media.js
│   |   |   └── repository.js
│   |   ├── services                        <- service layer
│   |   |   ├── client.js
│   |   |   ├── command.js
│   |   |   ├── command.queue.js
│   |   |   ├── debug.logging.js
│   |   |   ├── file.js
│   |   |   ├── media.js
│   |   |   ├── playlist.queue.js
│   |   |   └── report.js
│   |   ├── socket-handlers                 <- socket handlers layer
│   |   |   └── router.js
|   |   ├── ecosystem.config.js             <- PM2 config file, tells PM2 how to run this application
│   |   ├── index.js                        <- app bootstrap definitions
    |   └── util.js                         <- shared data manipulation functions
│   ├── store
│   |   └── ...                             <- pouchDB files
│   └── index.js                            <- node this file to start service (bootstrap)

```

# Available API Endpoints

```
.
├── dist
│   ├── route-handlers                  <- routes
│   |   ├── client.handler
|   │   |   ├── api/client                <- GET: all clients
|   │   |   ├── api/client/ip             <- GET: get client by ip
|   │   |   ├── api/client/:id            <- GET: get client by id
|   │   |   ├── api/client/hb/in          <- POST: save initial client checkin
|   │   |   ├── api/client/hb/up          <- POST: save client heartbeat check in
|   │   |   ├── api/client/hb/off         <- POST: delete client heatbeat
|   │   |   ├── api/client/current/media  <- POST: save client's currently playing contnent
|   │   |   └── api/client/hb             <- DEL: delete client heartbeat
│   |   ├── command.handler.js
|   │   |   ├── api/db                    <- GET: get available collections
|   │   |   ├── api/db/cmds               <- GET: get processed command files
|   │   |   ├── api/db/cmds/processed     <- GET: get processed command file content
|   │   |   └── api/db/cmds/processed/:id <- GET: get processed command file content by id
│   |   ├── http.handler.js
|   │   |   └── api/*                     <- OPTIONS: HTTP.200
│   |   └── media.handler
|   │   |   ├── api/playlist/generate     <- POST: save playlist from body
|   │   |   ├── api/playlist/generate/test<- POST: fake save playlist from body
|   │   |   ├── api/playlist              <- GET: get all saved playlists
|   │   |   ├── api/playlist/latest       <- GET: get last saved playlist
            └── api/playlist/:id          <- GET: get saved playlist by id

```

# Runtime variables

```
.
├── node express-svr.js
│   ├── Settings.ts with be applied
│   ├── Express API
|   │   ├── watched folders: ~/Dropbox on linux | %HOMEPATH%\Dropbox on Windows
│   |   ├── local work directory: ~/media-player  on linux | %HOMEPATH%\media-player on 
│   |   ├── Port: 5001
│   |   ├── allowedOrigins: localhost:80, localhost:8081
│   |   ├── watched folders: ~/Dropbox on linux | %HOMEPATH%\Dropbox on Windows
│   |   └── local work directory: ~/media-player  on linux | %HOMEPATH%\media-player on Windows             
│   ├── Socket.io running on 5001
│   |   └── client.handler

```
