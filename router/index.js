const Router = require("koa-router");
const moment = require("moment");
const monk = require("monk");
const router = new Router();

function objectIdWithTimestamp(timestamp) {
  // Convert string date to Date object (otherwise assume timestamp is a date)
  if (typeof timestamp == "string") {
    timestamp = new Date(timestamp);
  }

  // Convert date object to hex seconds since Unix epoch
  var hexSeconds = Math.floor(timestamp / 1000).toString(16);

  // Create an ObjectId with that hex timestamp
  var constructedObjectId = monk.id(hexSeconds + "0000000000000000");

  return constructedObjectId;
}

router.get("/", async ctx => {
  const collectionList = await ctx.db.listCollections();

  const pannels = [];

  const filter = {
    _id: {
      $gt: objectIdWithTimestamp(
        moment()
          .add(-7, "day")
          .toDate()
          .getTime()
      )
    }
  };
  const todayFilter = {
    _id: {
      $gt: objectIdWithTimestamp(
        moment()
          .add(-1, "day")
          .toDate()
          .getTime()
      )
    }
  };
  for (const col of collectionList) {
    let group = await col.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            date: {
              $dateToString: { format: "%Y-%m-%d", date: "$_id" }
            }
          },
          cnt: {
            $sum: 1
          }
        }
      }
    ]);
    const series = group
      .sort((a, b) => {
        return a._id.date > b._id.date ? 1 : -1;
      })
      .map(i => {
        return {
          time: new Date(i._id.date),
          value: i.cnt
        };
      });
    const count = await col.count();
    const todayCount = await col.count(todayFilter);
    pannels.push({ name: col.name, series, count, todayCount });
  }
  await ctx.render("index", { pannels });
});

module.exports = router;
