# ---- SkyRun backend image ----
FROM node:20-alpine

WORKDIR /app

# node:alpine ships a built-in non-root "node" user. Owning /app upfront and
# switching to it before installing avoids a slow recursive chown over
# node_modules later (COPY --chown / npm install write files as "node" directly).
RUN chown node:node /app
USER node

# Install dependencies first so this layer is cached unless package*.json changes.
COPY --chown=node:node backend/package*.json ./
RUN npm install --omit=dev

COPY --chown=node:node backend/src ./src

# Directory for uploaded avatars; mounted as a volume in docker-compose for persistence.
RUN mkdir -p uploads/avatars

ENV NODE_ENV=production
EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:'+(process.env.PORT||5000)+'/api/v1/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "src/server.js"]
