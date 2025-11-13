import { makeWorkerServer } from "./interface/http/workers.ts";

makeWorkerServer().then((server) => {
  server.listen({ port: 4001, host: "0.0.0.0" }, (err) => {
    if (err) {
      server.log.error(err);
      process.exit(1);
    }
    server.log.info("Bull worker server running on port 4001");
  });
});
