<img src="https://github.com/DwifteJB/aura-music-mixer/blob/main/public/mixer-full.png?raw=true" />

A music mixing program that allows you to clash two songs together!

![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54) ![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white) ![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB) ![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB) ![TensorFlow](https://img.shields.io/badge/TensorFlow-%23FF6F00.svg?style=for-the-badge&logo=TensorFlow&logoColor=white)

## Info

This repo comes as 3 projects, the frontend, spleeter-server and backend.

The frontend only interacts with the backend, which means you can use something like [tailscale](https://tailscale.com/) or use host.docker.internal to only allow access between the backend and spleeter instance, incase your SPLEETER_SERVER_KEY gets exposed.

This has been made to run on a nvidia gpu by using the [GPU](https://github.com/DwifteJB/aura-music-mixer/tree/main/spleeter-server/) docker container.
Optionally, it can all run on the CPU by using the CPU docker compose file within the [CPU](https://github.com/DwifteJB/aura-music-mixer/tree/main/spleeter-server/cpu) folder

## How to run?

Fill out the ENV file with all your specified data, only the VITE_MAIN_SERVER_URL will be exposed to the frontend instance. Then, copy the .env file and put it in backend to use it there.

"Compile" frontend, host it and then run the backend instance where it is accessible to the frontend. Host the spleeter server and ensure it can connect with WS and HTTPS to the backend server.

Boom, should be done.

You may need to run "yarn ready" inside of the backend server to generate the prisma instance needed for the database. This should automatically be done with the build/

```env
SPLEETER_API_URL=http://localhost:5000
SPLEETER_SERVER_KEY=SUPER_S3CRET_KEY_DO_NOT_EXPOSE # used to ensure no one else can access the spleeter api, so they cant create their own jobs w/o main api

VITE_MAIN_SERVER_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000/api/user/socket

FRONTEND_URL=http://localhost:5173 # vite instance

DATABASE_URL=postgresql://postgres:postgres@localhost:5432/auraaura


```

### Is there any AI, and where it is used?

Yes, this project uses spleeter to split the songs into two tracks, instrumentals and vocals! This is all self hosted, which explains the really big rate limit, since im running this on-device, paying for the electricity and the heat that is produced.... I am not paying 10$/day just to run a website sadly, unless I can somehow make something back. Outside of that, co-pilot was used to speed up development, with the tab auto assistance.

This can all also be self-hosted if you would like to remove rate limits, host an instance or make tweaks, thats the love of open source. 

#### Can I contribute?

Yes! Just make a fork and then a pull request and I can check if it all looks good!
