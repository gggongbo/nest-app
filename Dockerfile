FROM node:18-alpine as production

RUN mkdir -p /usr/src/nest-app
WORKDIR /usr/src/nest-app

COPY package*.json ./
RUN yarn

COPY . .
COPY --from=production /usr/src/nest-app/dist ./dist

ENV NODE_ENV=production

EXPOSE 3030

CMD ["node", "dist/main"]