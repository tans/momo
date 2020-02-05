const Router = require("koa-router");
const moment = require("moment");
const CSON = require("cson");
const monk = require("monk");
const _ = require("lodash");
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
  const days = _.range(1, 8)
    .map(i =>
      moment()
        .add(-i, "day")

        .format("YYYY-MM-DD")
    )
    .reverse();
  const todayFilter = {
    _id: {
      $gt: objectIdWithTimestamp(
        moment()
          .add(-1, "day")
          .startOf("D")
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
    let series = group.map(i => {
      return {
        date: i._id.date,
        value: i.cnt
      };
    });

    let fullfilSeries = days.map(day => {
      var finded = _.find(series, function(s) {
        return s.date == day;
      });
      return {
        time: day,
        value: finded ? finded.value : 0
      };
    });
    const count = await col.count();
    const todayCount = await col.count(todayFilter);
    pannels.push({ name: col.name, series: fullfilSeries, count, todayCount });
  }
  await ctx.render("index", { pannels });
});

router.get("/col/:col", async ctx => {
  const col = ctx.db.get(ctx.params.col);

  const filter = {
    _id: {
      $gt: objectIdWithTimestamp(
        moment()
          .add(-30, "day")
          .startOf("D")
          .toDate()
          .getTime()
      )
    }
  };
  const days = _.range(1, 31)
    .map(i =>
      moment()
        .add(-i, "day")
        .format("YYYY-MM-DD")
    )
    .reverse();
  const todayFilter = {
    _id: {
      $gt: objectIdWithTimestamp(
        moment()
          .add(-1, "day")
          .startOf("D")
          .toDate()
          .getTime()
      )
    }
  };

  const docs = await col.find({}, { limit: ctx.conf.limit, sort: { _id: -1 } });

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

  let series = group.map(i => {
    return {
      date: i._id.date,
      value: i.cnt
    };
  });

  let fullfilSeries = days.map(day => {
    var finded = _.find(series, function(s) {
      return s.date == day;
    });
    return {
      time: day,
      value: finded ? finded.value : 0
    };
  });
  const count = await col.count();
  const todayCount = await col.count(todayFilter);

  ctx.state.pretty = CSON.stringify.bind(CSON);

  await ctx.render("col", {
    docs,
    name: col.name,
    series: fullfilSeries,
    count,
    todayCount
  });
});
module.exports = router;
