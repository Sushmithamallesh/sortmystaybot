require("dotenv").config();
const Twit = require("twit");

const fs = require("fs");
const path = require("path");
const { config } = require("dotenv");
const paramsPath = path.join(__dirname, "params.json");

config = {
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_KEY_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
};

var T = new Twit(config);

function writeParams(data) {
  console.log("We are writing the params file", data);
  return fs.writeFileSync(paramsPath, JSON.stringify(data));
}

function readParams() {
  console.log("Reading the JSON file");
  const data = fs.readFileSync(paramsPath);
  return JSON.parse(data.toString());
}

function getTweet(since_id) {
  return new Promise((resolve, reject) => {
    let params = {
      q: "@sortmystay",
      count: 100,
    };
    if (since_id) {
      params.since_id = since_id;
    }
    console.log("We are getting the tweets");
    T.get("search/tweets", params, (err, data) => {
      if (err) {
        return reject(err);
      }
      return resolve(data);
    });
  });
}

function postRetweet(id) {
  return new Promise((resolve, reject) => {
    let params = {
      id,
    };
    T.post("statuses/retweet/:id", params, (err, data) => {
      if (err) {
        return reject(err);
      }
      return resolve(err);
    });
  });
}

async function main() {
  try {
    const params = readParams();
    const data = await getTweet(params.since_id);
    const tweets = data.statuses;
    console.log("We got the tweets", tweets.length);
    for await (let tweet of tweets) {
      try {
        await postRetweet(tweet.id_str);
        console.log("Successful retweet" + tweet.id_str);
      } catch (err) {
        console.log("Unsuccessfull retweet" + tweet.id_str);
      }
      params.since_id = tweet.id_str;
    }
    writeParams(params);
  } catch (e) {
    console.error(e);
  }
}

console.log("Starting the twitter bot");
setInterval(main, 10000);
