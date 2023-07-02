FROM node:18-alpine as base

FROM base AS production

ENV NODE_ENV=production

WORKDIR /nest-app

COPY package*.json ./

RUN yarn

COPY . .

COPY --from=production /nest-app/dist ./dist

EXPOSE 3030

CMD ["node", "dist/main"]