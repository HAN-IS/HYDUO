const express = require('express');
var http = require('http');
var mysql = require('mysql');
var fs = require('fs');

const app = express();

var connection = mysql.createConnection({
  host: "music.c7kawyrjby0j.ap-northeast-2.rds.amazonaws.com",
  user: "admin",
  password: "hyd12345",
  database: "popidx"
});

var vids = [];

function getVideoIds() {
  return new Promise((resolve, reject) => {
    connection.query("SELECT video_id FROM popular_music", function(err, rows, fields) {
      if (err) {
        reject(err);
      } else {
        const videoIds = rows.map(function(row) {
          return row.video_id;
        });
        resolve(videoIds);
      }
    });
  });
}

async function initialize() {
  try {
    vids = await getVideoIds();
    console.log(vids);
    startServer();
  } catch (err) {
    console.error(err);
  }
}

function startServer() {
  var testserver = http.createServer(function(request, response) {
    var url = request.url;
    var videoIds = vids; // 모든 동영상 ID 사용
    var plistcode = "'" + videoIds.join(",") + "'";
    var template = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>YouMelody</title>
        <style>
            @font-face {
                font-family: 'GmarketSansMedium';
                src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.1/GmarketSansMedium.woff') format('woff');
                font-weight: normal;
                font-style: normal;
            }
    
            body {
                font-family: 'GmarketSansMedium';
                background-color: #4C4C4C;
            }
    
            .title {
                font-family: 'GmarketSansMedium';
                font-size: 2rem;
                font-weight: 700;
                color: #FFF; /* 원하는 색상으로 변경 가능 */
                cursor: pointer;
            }
    
            .subtitle {
                font-family: 'GmarketSansMedium';
                font-size: 1rem;
                color: #FFF; /* 원하는 색상으로 변경 가능 */
            }
    
            .video-background {
              position: fidxed;
              z-index: -99;
          }
  
          .video-foreground {
              width: 100%;
              height: 100%;
          }
  
          #player1 {
              width: 50%;
              height: 50%;
          }
        </style>
    </head>
    <body>
    <div>
      <div>
        <p onClick="window.location.reload()" class="title">
          YouMelody
        </p>
      </div>
      <div>
        <p class="subtitle">
          베스트 10 음악.
        </p>
      </div>
      <div class="video-background" id="media-1"> <!-- 동영상 요소 -->
        <div class="video-foreground">
          <div id="player1" allowfullscreen="" frameborder="0"></div>
        </div>
      </div>
    </div>
    
    <script>
      var tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      var firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    
      var player1;
      var plist = ${JSON.stringify(videoIds)};
      var plistcode = ${JSON.stringify(plistcode)};
    
      function onYouTubeIframeAPIReady() {
        player1 = new YT.Player('player1', {
          videoId: plist[0],
          playerVars: {
            'autoplay': 1,
            'loop': 1,
            'showinfo': 1,
            'controls': 1,
            'rel': 0,
            'playlist': plistcode
          },
          events: {
            'onReady': onPlayerReady1,
            'onStateChange': onPlayerStateChange,
            'onError': onPlayerError
          }
        });
      }
    
      function onPlayerReady1(event) {
        event.target.playVideo();
        player1.setVolume(30);
      }
    
      function onPlayerError(event) {
        if (event.data == 150) { }
      }
    
      function onPlayerStateChange(event) {
        if (event.data == YT.PlayerState.ENDED) {
          setTimeout(onPlayerStateChange_excute, 5000);
        }
      }
    </script>
    </body>
    </html>
    
    `;

    response.writeHead(200);
    response.end(template);
  });

  testserver.listen(3000);
  console.log("Server started.");
}

connection.connect(function(err) {
  if (err) {
    throw err;
  } else {
    initialize();
  }
});
