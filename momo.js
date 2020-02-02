const auth = require("koa-basic-auth");
const monk = require("monk");
const pug = require("pug");
const Koa = require("koa");
const fs = require("fs");
const Router = require("koa-router");

const router = new Router();
const render = pug.compileFile("index.pug");
const conf = require("./config");

const db = monk(conf.mongoUrl);
const app = new Koa();

// if (conf.basicAuth && conf.basicAuth.name) {
//   // custom 401 handling
//   app.use(async (ctx, next) => {
//     try {
//       await next();
//     } catch (err) {
//       if (401 == err.status) {
//         ctx.status = 401;
//         ctx.set("WWW-Authenticate", "Basic");
//         ctx.body = "basic auth had set";
//       } else {
//         throw err;
//       }
//     }
//   });

//   app.use(auth({ name: conf.basicAuth.name, pass: conf.basicAuth.pass }));
// }

router.get("/", async ctx => {
  const isSet = fs.existsSync("./momo.json");
  if (!isSet) {
    return (ctx.body = "create momo.json first");
  }
  const momo = require("./momo.json");
  const pannels = [];
  for (const pannel of momo.pannels) {
    if (pannel.type == "data") {
      const collection = db.get(pannel.collection);
      const data = await collection.find(pannel.selector || {}, {
        limit: conf.limit,
        sort: pannel.sort || { _id: -1 }
      });
      pannels.push({ data, self: pannel });
    }
  }
  ctx.body = await render({ pannels });
});

app.use(router.routes());
app.listen(conf.port, function() {
  console.log(`listening on port ${conf.port}`);
});
