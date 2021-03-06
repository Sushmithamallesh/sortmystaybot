const config = require('./config')
const twit = require("twit");

const T = new twit(config)

function reTweet(searchText){
  let params = {
    q: searchText + '',
    result_type: 'mixed',
    count: 25,
  }
  T.get('search/tweets', params, function(err_search, data_search){
    let tweets = data_search.statuses
    if (!err_search){
      let tweetIDList = []
      for(let tweet of tweets) {
        if (tweet.text.startsWith("RT @")){
          if(tweet.retweeted_status){
            tweetIDList.push(tweet.retweeted_status.id_str)
          }
          else{
            tweetIDList.push(tweet.id_str)
          }
        }
        else if(tweet.in_reply_to_status_id_str != null){
            tweetIDList.push(tweet.in_reply_to_status_id_str)

        }
        else{
          tweetIDList.push(tweet.id_str)
        }
      }

      function onlyUnique(value, index, self) { 
        return self.indexOf(value) === index;
      }
    
      // Get only unique entries
      tweetIDList = tweetIDList.filter( onlyUnique )

      for (let tweetID of tweetIDList){
        T.post('statuses/retweet/:id', {id: tweetID}, function(err_rt, data_rt, response_rt){
          if(!err_rt){
            console.log("\n\nRetweeted! ID - " + tweetID)
          }
          else{
            console.log("\n Error... Duplication maybe... "+ tweetID)
            console.log("Error = " + err_rt)
          }
        })
      }
    }
    else{
      console.log("Error while searching" + err_search)
      process.exit(1)
    }
  })
}
setInterval(function() { reTweet("@sortmystay")}, 60000)