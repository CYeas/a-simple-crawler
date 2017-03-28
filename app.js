let async = require ('async');
let superagent = require ('superagent');
let cheerio = require ('cheerio');
let url = require ('url');
let fs = require ('fs');
//获得相册地址
function getInfomation () {
    let picWebBaseUrl = 'http://tu.hanhande.com/scy/scy_';
    let albumHref = [];
    for (let i = 1; i <= 72; i ++) {
        superagent.get(picWebBaseUrl + i + '.shtml')
            .end(function(err, res) {
                if (err) {
                    console.log(err);
                }
                let $ = cheerio.load(res.text);
                $('.picList li a').each(function(index, element) {
                    albumHref.push(element.attr('href'));
                })
            })
    }
    return albumHref;
}
//从相册中遍历获得照片
function getPicture(album) {
    async.mapLimit(album, 10, function(item, callback) {
        superagent.get(item)
            .end(function(err, res) {
                if (err) {
                    console.log(err);
                }
                let $ = cheerio.load(res.text);
                let title = $('.content.tit4 h3').text();
                $('#picLists li a img').each(function(index, item) {
                    superagent.get(item.attr('src'))
                        .end(function(err, res) {
                            if (err) {
                                console.log(err);
                            }
                            savePicture(title + index, res.body);
                        })
                })
            })
    })
}

function savePicture(name, data) {
    fs.writeFile(name + '.jpg', data, function(err) {
        err ? console.log(err) : console.log("downloaded " + name);
    })
}
