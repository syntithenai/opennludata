#!/bin/bash
git clone https://github.com/syntithenai/react-express-oauth-login-system.git
cp .env ./react-express-oauth-login-system/
cd ./react-express-oauth-login-system
npm i
npm run build
