import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import http from "http";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
        // Node's HTTP server closes an idle keep-alive socket after 5s by
        // default; without this, the proxy's own connection pool can try to
        // reuse a socket the backend already closed, failing with
        // "read ECONNRESET" on the first request after any idle gap (e.g.
        // right after starting the servers, or after a few seconds away
        // from the tab). A fresh connection per request costs nothing
        // noticeable on localhost and removes the race entirely.
        agent: new http.Agent({ keepAlive: false }),
      },
    },
  },
});
