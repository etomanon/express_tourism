var express = require('express'); // require Express
var router = express.Router(); // setup usage of the Express router engine

/* PostgreSQL and PostGIS module and connection setup */
var pg = require("pg"); // require Postgres module

// Setup connection
var username = "postgres" // sandbox username
var password = "postgres" // read only privileges on our table
var host = "localhost:5432"
var database = "spatial" // database name
var conString1 = process.env.DATABASE_URL || "postgres://" + username + ":" + password + "@" + host + "/" + database; // Your Database Connection

// Set up your database query to display GeoJSON
var tourism_query = "SELECT row_to_json(fc) FROM ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features FROM (SELECT 'Feature' As type, ST_AsGeoJSON(lg.geom)::json As geometry, row_to_json(row(osm_id, (SELECT CAST(AVG(rate) AS INT) FROM ratings_tourism As Rat WHERE Rat.tourism_id = lg.osm_id), name, tourism)) As properties FROM tourism As lg WHERE lg.tourism NOT IN ('guest_house', 'information', 'hotel', 'hostel', 'motel', 'chalet', 'caravan_site', 'camp_site', 'apartment', 'alpine_hut') LIMIT 100) As f) As fc";

/* GET the map page */
router.get('/', function(req, res) {
    res.render('pages/map');
});


/* GET Postgres JSON data */
router.get('/data', function(req, res) {

    var client = new pg.Client(conString);
    client.connect();
    // Set up your database query to display GeoJSON
    var tourism_query = "SELECT row_to_json(fc) FROM ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features FROM (SELECT 'Feature' As type, ST_AsGeoJSON(lg.geom)::json As geometry, row_to_json(row(osm_id, (SELECT CAST(AVG(rate) AS INT) FROM ratings_tourism As Rat WHERE Rat.tourism_id = lg.osm_id), name, tourism, (SELECT CASE WHEN session_id = '" + req.sessionID + "' THEN TRUE ELSE FALSE END FROM ratings_tourism As Sess WHERE Sess.tourism_id = lg.osm_id))) As properties FROM tourism As lg WHERE lg.tourism IN ('artwork', 'attraction', 'picnic_site', 'theme_park', 'viewpoint', 'yes', 'hunting_lodge', 'gallery', 'zoo', 'wilderness_hut', 'museum') ORDER BY ST_Distance(lg.geom, ST_GeomFromText('POINT(" + req.query.long + " " + req.query.lat + ")',4326)) ASC LIMIT 1500) As f) As fc";
    var query = client.query(tourism_query);
    query.on("row", function(row, result) {
      result.addRow(row);
    });
    query.on("end", function(result) {
      res.json(result.rows[0].row_to_json);
      client.end();
      res.end();
    });

});


router.post('/rate', function(req, res, next) {
  req.checkBody("rate", "Rating must be integer").isInt();
  req.checkBody("tourism_id", "ID must be integer").isInt();
  var errors = req.validationErrors();
  if (errors) {
    res.end();
  } else {
    var client = new pg.Client(conString); // Setup our Postgres Client
    client.connect(); // connect to the client
    //client.query("DELETE FROM ratings WHERE tourism_id = " + req.body.tourism_id + " AND session_id = '" + req.sessionID + "';");
    var query = client.query("DELETE FROM ratings_tourism WHERE tourism_id = " + req.body.tourism_id + " AND session_id = '" + req.sessionID + "'; INSERT INTO ratings_tourism(rate, tourism_id, session_id) VALUES ( " + req.body.rate + "," + req.body.tourism_id + ",'" + req.sessionID + "'); ")
    query.on("end", function(result) {
      client.end();
      res.end();
    })
  }

});

router.get('/getRate', function(req, res) {
  // input value from search
  req.checkQuery('search', 'Is not integer').isInt();
  var errors = req.validationErrors();
  if (errors) {
    res.send("0");
  } else {
    var client = new pg.Client(conString); // Setup our Postgres Client
    client.connect(); // connect to the client
    var query = client.query("SELECT CAST(AVG(rate) AS INT) FROM ratings_tourism WHERE tourism_id = " + req.query.search + "; SELECT CAST(COUNT(rate) AS INT) FROM ratings_tourism WHERE tourism_id = " + req.query.search + ";");
    query.on("row", function(row, result) {
      result.addRow(row);
    });
    query.on("end", function(result) {
      client.end();
      if (!!result.rows[0].avg) {
        res.json({rating: result.rows[0].avg.toString(), count: result.rows[1].count.toString()})
        res.end()
      } else {
        res.send("0");
      }
    });
  }


});

module.exports = router;
