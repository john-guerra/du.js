/*jslint browser: true, devel: true, indent: 4 */
/* global d3, require */



var getFileSize = function () {
  "use strict";

  var self = this,
      fs = require("fs"),
      path = require("path"),
      async = require("async"),
      d3 = require("d3");

  var myTree = {"name": "",
        "children": []};

  function readSizeRecursive(parentNode, item, name, cb, progressCb) {
    fs.lstat(item, function (err, stats) {
      var total;

      if (!err) {
        total = stats.size;
      }

      var node = {"name": name,
        "value": total
      };
      parentNode.children.push(node);


      if (!err && stats.isDirectory()) {
        node.children =[];

        fs.readdir(item, function(err, list) {
          if (err) return cb(err);

          async.forEach(
            list,
            function (diritem, callback) {
              readSizeRecursive(node, path.join(item, diritem), diritem, function(err, size) {
                total += size;
                callback(err);
              }, progressCb);
            },
            function (err) {
              node.value = total;
              progressCb(err, item, total);
              cb(err, total);
            }
          );
        });
      }
      else {
        cb(err, total);
      }
    });
  }

  self.get = function (path) {
    console.log("get!!!!");
    console.log(path);

    myTree.name = path;
    readSizeRecursive(myTree, path, path, function (err, total) {
      //total here
      // console.log(myTree);
    }, function (err, item, total) {
      //progresss here
    });

  };

  self.getTree = function () {
    return myTree.children[0];
  }

  return self;
};


var express = require('express');
var app = express();

var obj;

app.use(express.static('static'));
obj = new getFileSize();

app.get('/noUpdate', function (req, res) {
  // res.setHeader('Content-Type', 'application/json');
  console.log("noUpdate");
  res.sendFile(__dirname + '/static/treemap.html');
});


app.get('/', function (req, res) {
  // res.setHeader('Content-Type', 'application/json');
  console.log( 'path =' +  req.query.path);
  console.log("get");
  obj = new getFileSize();
  obj.get(req.query.path);

  res.sendFile(__dirname + '/static/treemap.html');
});

app.get("/getProgress", function (req, res) {
  console.log("getProgress");
  // console.log(obj.getTree());
  if (obj !== undefined) {
    res.end(JSON.stringify(obj.getTree()));
  }

});

var server = app.listen(8080, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);

});

