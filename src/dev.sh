#!/bin/sh
export $(grep -v '^#' .env.local.dev | xargs) && pgtyped --watch --config pgtyped.config.json &
sleep 2 && NODE_ENV=development node esbuild.js &
sleep 2 && NODE_ENV=development nodemon -r dotenv/config out/index.cjs dotenv_config_path=.env.local.dev
