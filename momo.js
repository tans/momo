const monk = require("monk");
const Pug = require("koa-pug");
const Koa = require("koa");
const path = require("path");
const serve = require("koa-static");
const koaBody = require("koa-body");
var open = require("open");

const router = require("./router");
const app = new Koa();

const pug = new Pug({
  viewPath: path.join(__dirname, "views"),
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

app.use(serve(path.join(__dirname, "public")));

let db = null;
app.use(async (ctx, next) => {
  if (!db && ctx.path != "/connection") {
    return ctx.redirect("/connection");
  }
  ctx.db = db;
  await next();
});

router.get("/connection", async ctx => {
  await ctx.render("connection");
});

router.post("/connection", async ctx => {
  db = monk(ctx.request.body.url);
  ctx.body = "ok";
});

router.get("/logout", async ctx => {
  ctx.db.close();
  ctx.redirect("/connection");
});
app.use(koaBody({}));
app.use(router.routes());
app.listen(28018, function() {
  console.log(`listening on port 28018`);
  open("http://localhost:28018");
});
