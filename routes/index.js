const express = require('express'); // require Express
const router = express.Router(); // setup usage of the Express router engine


const pg = require("pg"); // Postgres

/* GET the map page */
router.get('/', function(req, res) {
    

    let client = new pg.Client(conString);
    client.connect();
    // Set up your database query to display GeoJSON
    let if_visited = "SELECT COUNT(sid) FROM session WHERE sid = '" + req.sessionID + "'";
    let query = client.query(if_visited);
    query.on("row", function(row, result) {
      result.addRow(row);
    });
    query.on("end", function(result) {
      // First visit
      if((result.rows[0].count) == 0) {
        res.render('pages/map', {visited : 'false'});
      }
      // Second visit
      else {
        res.render('pages/map', {visited : 'true'});
      }
      
      client.end();
      res.end();
    });
});


/* GET Postgres JSON data */
router.get('/data', function(req, res) {

    let client = new pg.Client(conString);
    client.connect();
    // Set up your database query to display GeoJSON
    let tourism_query = "SELECT row_to_json(fc) FROM ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features FROM (SELECT 'Feature' As type, ST_AsGeoJSON(lg.geom)::json As geometry, row_to_json(row(osm_id, (SELECT CAST(AVG(rate) AS INT) FROM ratings_tourism As Rat WHERE Rat.tourism_id = lg.osm_id LIMIT 1), name, tourism, (SELECT (CASE WHEN session_id = '" + req.sessionID + "' THEN TRUE ELSE FALSE END) FROM ratings_tourism As Sess WHERE Sess.tourism_id = lg.osm_id AND Sess.session_id = '" + req.sessionID + "'))) As properties FROM tourism As lg WHERE lg.tourism IN ('artwork', 'attraction', 'picnic_site', 'theme_park', 'viewpoint', 'yes', 'hunting_lodge', 'gallery', 'zoo', 'wilderness_hut', 'museum') ORDER BY ST_Distance(lg.geom, ST_GeomFromText('POINT(" + req.query.long + " " + req.query.lat + ")',4326)) ASC LIMIT 1500) As f) As fc";
    let query = client.query(tourism_query);
    query.on("row", function(row, result) {
      result.addRow(row);
    });
    query.on("end", function(result) {
      res.json(result.rows[0].row_to_json);
      client.end();
      res.end();
    });

});

/* POST Rate attraction */
router.post('/rate', function(req, res, next) {
  req.checkBody("rate", "Rating must be integer").isInt();
  req.checkBody("tourism_id", "ID must be integer").isInt();
  let errors = req.validationErrors();
  if (errors) {
    res.end();
  } else {
    let client = new pg.Client(conString);
    client.connect(); 
    let query = client.query("DELETE FROM ratings_tourism WHERE tourism_id = " + req.body.tourism_id + " AND session_id = '" + req.sessionID + "'; INSERT INTO ratings_tourism(rate, tourism_id, session_id) VALUES ( " + req.body.rate + "," + req.body.tourism_id + ",'" + req.sessionID + "'); ")
    query.on("end", function(result) {
      client.end();
      res.end();
    })
  }

});


/* GET attraction rating */
router.get('/getRate', function(req, res) {
  // input value from search
  req.checkQuery('search', 'Is not integer').isInt();
  let errors = req.validationErrors();
  if (errors) {
    res.send("0");
  } else {
    let client = new pg.Client(conString); 
    client.connect(); 
    let query = client.query("SELECT CAST(AVG(rate) AS INT) FROM ratings_tourism WHERE tourism_id = " + req.query.search + "; SELECT CAST(COUNT(rate) AS INT) FROM ratings_tourism WHERE tourism_id = " + req.query.search + ";");
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
