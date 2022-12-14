# Concepts

RPCs require two pieces: a server and a client. Procedures, functions with some requirements, are called in the client and run on the server.

Because all procedures run on a server, they are not limited by what non-server environments like browsers support. File system access, communication with private APIs, and computationally expensive tasks can be called directly from clients.

## Procedures

Procedures are functions that run on a server. They can be synchronous or asynchronous, accept arguments, and return values.

Because procedures are called in a client but run on a server, data must be serialized while in transit. This behavior introduces [some limitations](./05-limitations.md), such as not supporting functions or classes, but most JavaScript data is supported.

See [Procedures](./02-procedures.md) for more details.

## Server

The server runs your procedure calls. It communicates with the client over HTTP using a single endpoint.

`@slicemachine/rpc` produces an [Express middleware][express-middleware] which can be provided to any Express-compatible server.

The server does not perform any runtime type checking of arguments. Instead, it assumes you are type checking your project with TypeScript. Your procedures' argument and return types are provided to the client to ensure procedure calls are provided with the correct arguments and expect the correct return types.

See [Server](./02-server.md) for more details.

## Client

The client calls your procedure calls. It can be used anywhere with a network connection to your server.

The client does not perform any runtime type checking of arguments or return values. Instead, it assumes you are type checking your project with TypeScript. If you have type errors when using procedures, the build should fail since the data sent or returned will be invalid.

See [Client](./03-client.md) for more details.

[express-middleware]: https://expressjs.com/en/guide/using-middleware.html
