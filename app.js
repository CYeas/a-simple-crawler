let async = require ('async');
let superagent = require('superagent')
let charset = require ('superagent-charset');
let cheerio = require ('cheerio');
let url = require ('url');
let fs = require ('fs');

charset(superagent);
//获得相册地址
function getInfomation (resolve, reject) {
  let picWebBaseUrl = 'http://tu.hanhande.com/scy/scy_';
  let albumHref = [];
  let numBox = [];
  for (let i = 1; i <= 2; i ++) {
    numBox.push(i);
  }
  async.mapLimit(numBox, 1, function(item, callback) {
    superagent.get(picWebBaseUrl + item + '.shtml')
      .charset('gb2312')
      .end(function(err, res) {
          if (err) {
              console.error(err);
              reject(err);
          }
          let $ = cheerio.load(res.text);
          $('.picList li a').each(function(index, element) {
              albumHref.push($(element).attr('href'));
          })
          callback(null);
      })
  }, function(err, result) {
    resolve(albumHref);
  })
  // for (let i = 1; i <= 72; i ++) {
  //   superagent.get(picWebBaseUrl + i + '.shtml')
  //     .charset('gb2312')
  //     .end(function(err, res) {
  //         if (err) {
  //             console.log(err);
  //             reject(err);
  //         }
  //         let $ = cheerio.load(res.text);
  //         $('.picList li a').each(function(index, element) {
  //             albumHref.push($(element).attr('href'));
  //         })
  //         resolve(albumHref);
  //     })
  // }
}
//从相册中遍历获得照片
function getPicture(album) {
  async.mapLimit(album, 2, function(item, callback) {
    superagent.get(item)
      .charset('gb2312')
      .end(function(err, res) {
        let index = 0;
        if (err) {
          console.log(err);
        }
        let $ = cheerio.load(res.text);
        let title = $('.content .tit4 h3').text();
        let img = $('#picLists li a img')
        async.mapLimit(img, 2, function(item, subCallback) {
          index ++;
          superagent.get($(item).attr('src'))
            .end(function(err, res) {
              if (err) {
                console.log(err);
              }
              savePicture(title, index, res.body);
              setTimeout(function(){subCallback(null);}, 100);
            })
        })
        // $('#picLists li a img').each(function(index, item) {
        //   superagent.get($(item).attr('src'))
        //     .end(function(err, res) {
        //       if (err) {
        //         console.log(err);
        //       }
        //       savePicture(title, index, res.body);
        //     })
        // })
      })
      setTimeout(function(){callback(null)}, 100);
    })
}

function savePicture(title, index, data) {
  let picPath = __dirname + '/pic/' + title;
  if (!fs.existsSync(picPath)) {
    fs.mkdirSync(picPath, 0777);
  }
  fs.writeFile(picPath + '/' + index + '.jpg', data, function(err) {
    err ? console.log(err) : console.log("downloaded " + title + ' ' + index);
  })
}

new Promise(getInfomation)
  .then(getPicture)
  .catch(function(err) {
    console.error(err);
  })
