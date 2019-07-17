const rp = require("request-promise");
const cheerio = require("cheerio");
const cheerioTableparser = require("cheerio-tableparser");
const _ = require("lodash");

module.exports = app => {
  app.get("/scrapStandings", (req, res) => {
    let { link } = req.query;
    standingSeeker(link).then(result => res.json(result));
  });
};

const standingSeeker = async contest_url => {
  let contestUrl = contest_url + "/standings";
  let allStandings = [];
  const html = await rp(contestUrl).catch(err => {
    return err;
  });
  $ = cheerio.load(html);
  cheerioTableparser($);
  let allParsedStandings = $("table.standings").parsetable(false, false, true);
  let keyz = allParsedStandings.map((e, i) => (e[0] ? e[0] : i));
  allStandings = _.zip(..._.map(allParsedStandings, e => e.slice(1))).map(
    e => ({
      ..._.zipObject(
        keyz,
        e.map(v => {
          if (typeof v === typeof "String" && v.includes("\n")) {
            if (v.split("\n").length > 1) {
              return `${v.split("\n")[0].trim()}|${v.split("\n")[1].trim()}`;
            } else {
              return `${v.split("\n")[0].trim()}`;
            }
          } else {
            return v;
          }
        })
      )
    })
  );
  allParsedStandings.slice(4).map(e => {
    let fts = _.indexOf(
      e.slice(1),
      _.minBy(e.slice(1), v => (v ? `${v}` : "...."))
    );
    (
      allStandings[fts].firstToSolve || (allStandings[fts].firstToSolve = [])
    ).push(e[0]);
  });

  //the last row is a summuary for submissions
  allStandings.pop();
  return Promise.all(allStandings);
};
