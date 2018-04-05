var request = require('request');
var cheerio = require('cheerio');
var URL = require('url-parse');
var mongoS = require("./saveToMongoDb")// including the code to save json to mongo
var promisez=[];
var dbPromises=[];
//var START_URL = "https://www.familyassets.com/assisted-living/california";
var START_URL = "https://depositphotos.com";
var SEARCH_WORD = "art";
var MAX_PAGES_TO_VISIT = 10;

var pagesVisited = {};
var numPagesVisited = 0;
var pagesToVisit = [];
var links=[];
var url = new URL(START_URL);
var baseUrl = url.protocol + "//" + url.hostname;
var  allDetails=[];
links.push(START_URL);

crawlAndSearh();

function crawlAndSearh() {
  if(links.length<=0) {
    console.log("visited all pages.");
    Promise.all(promisez).then(function(values) {
     onCompleteAllRequests();
    });
    if(dbPromises.length>0){
       Promise.all(dbPromises).then(function(values) {
          mongoS.closeConnection(); // closing connection after all data is saved
      });
    }
    
    return;
  }
  var currPage = links.pop();
    visitPage(currPage, crawlAndSearh);
  
   console.log("<<<exited>>>");
  return;
}
function scrapImages($) {
    var imgs=[];
    $('img').each(function(){
     var img= $(this).attr('src');
     if(img.startsWith("/")){
         //img =baseUrl+img;
       }
      imgs.push(img);
    });
    //console.log(imgs);
    return imgs;
  }

function searchForWordAndSave($, word,url) {
  var bodyText = $('html > body').text().toLowerCase();
  var n = bodyText.search(word);
  //console.log(bodyText); 
  if(n!==-1){
    console.log("found       "+word); 
    var imgs= scrapImages($);
    var itm = {
       url:url,
       txtbody:bodyText,
      imgz:imgs
    }
   var proms= mongoS.saveData(itm);// saving json to mongodb 
   dbPromises.push(proms);
    allDetails.push(itm);
  }
}
function visitPage(url, callback) {
  // Add page to our set
  pagesVisited[url] = true;
  // Make the request
  console.log("Visiting page " + url);
  var requestPag = requestPage(url,callback);
  promisez.push(requestPag);
  requestPag.then(function(body) {
    var $ = cheerio.load(body);
    searchForWordAndSave($, SEARCH_WORD,url);
    callback();
  }, function(err) {
        console.log(err);
        callback ();
           
    })
  }

function requestPage(url, callback) {
  return new Promise(function(resolve, reject) {
      // Do async job
        request.get(url, function(err, resp, body) {
            if (err) {
                reject(err);
                callback();
            } else {
                resolve(body);
            }
        })
    })
}
function onCompleteAllRequests(){
    //We should have all the details now before calling this function
    console.log(allDetails);
    
}