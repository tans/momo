const auth = require("koa-basic-auth");
const monk = require("monk");
const Pug = require("koa-pug");
const Koa = require("koa");
const path = require("path");
const serve = require("koa-static");

const conf = require("./config");

const router = require("./router");
const app = new Koa();

const pug = new Pug({
  viewPath: path.resolve(__dirname, "./views"),
  locals: {
    /* variables and helpers */
  },
  //   basedir: "path/for/pug/extends",
  //   helperPath: [
  //     "path/to/pug/helpers",
  //     { random: "path/to/lib/random.js" },
  //     { _: require("lodash") }
  //   ],
  app: app // Binding `ctx.render()`, equals to pug.use(app)
});

const db = monk(conf.mongoUrl);

if (conf.basicAuth && conf.basicAuth.name) {
  app.use(auth({ name: conf.basicAuth.name, pass: conf.basicAuth.pass }));
}
app.use(serve(path.join(__dirname, "public")));

app.use(async (ctx, next) => {
  console.log(ctx.path);
  ctx.db = db;
  await next();
});
app.use(router.routes());
app.listen(conf.port, function() {
  console.log(`listening on port ${conf.port}`);
});
