const rp = require("request-promise");
const cheerio = require("cheerio");
const cheerioTableparser = require("cheerio-tableparser");
const _ = require("lodash");

module.exports = app => {
  app.get("/scrapSubmissions", (req, res) => {
    let { link } = req.query;
    standingSeeker(link).then(result => res.json(result));
  });
};

const standingSeeker = async contestUrl => {
  const contestStatusUrlByPage = i =>
    contestUrl + `/status/page/${i}?order=BY_ARRIVED_DESC`;
  const genSubLink = e => contestUrl + "/submission/" + e;

  let i = 0;
  let prevHtml = -42;
  let allSubmissionsAsObjects = [];
  while (true) {
    i++;
    const html = await rp(contestStatusUrlByPage(i)).catch(err => {
      return err;
    });
    $ = cheerio.load(html);
    cheerioTableparser($);
    let allSubmissions = $("table.status-frame-datatable").parsetable(
      false,
      false,
      true
    );
    let currFirstId = allSubmissions[0][1];
    if (prevHtml === currFirstId) {
      break;
    } else {
      let keyz = allSubmissions.map(e => e[0]);
      allSubmissionsAsObjects = _.concat(
        allSubmissionsAsObjects,
        _.zip(..._.map(allSubmissions, e => e.slice(1))).map(e => ({
          ..._.zipObject(keyz, e),
          submissionLink: genSubLink(e[0])
        }))
      ).filter(e => e.Verdict === "Accepted");
      allSubmissionsAsObjects = _.uniqBy(
        allSubmissionsAsObjects,
        e => e["Who"] + e["Problem"]
      );
      prevHtml = currFirstId;
    }
  }
  return Promise.all(allSubmissionsAsObjects);
};
