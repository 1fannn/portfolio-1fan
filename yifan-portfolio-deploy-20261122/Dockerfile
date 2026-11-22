FROM node:24-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production HOST=0.0.0.0 PORT=8788 GUESTBOOK_DB=/app/.data/guestbook.sqlite
COPY --chown=node:node . .
RUN mkdir -p /app/.data && chown node:node /app/.data
USER node
EXPOSE 8788
CMD ["node", "server/server.mjs"]
