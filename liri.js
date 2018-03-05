require("dotenv").config();
const fs = require('fs');
const request = require('request');
const Spotify = require('node-spotify-api');
const Twitter = require('twitter');
const keys = require('./keys');

const spotify = new Spotify(keys.spotify);
const client = new Twitter(keys.twitter);
const args = process.argv.splice(2);

const handleTwitter = () => {
  let tweetLimit = 20;
  const params = {screen_name: 'garveyjackson1'};
  client.get('statuses/user_timeline', params, function(error, tweets, response) {
    if (!error) {
      if (tweetLimit > tweets.length) {
        tweetLimit = tweets.length;
      }
      for (let i = 0; i < tweetLimit; i++) {
        console.log(tweets[i].text);
      }
    }
  });
};

const handleSpotify = (songName) => {
  spotify.search({ type: 'track', query: songName }, function(err, data) {
    if (err) {
      console.log('Failed to retrieve spotify data: ' + err);
      return;
    }
    let tracks = data.tracks.items;
    if (tracks.length > 0) {
      let track = tracks[0];

      let mainArtistSelected = false;
      let artistList = track.artists;
      let artists = "";
      artistList.forEach((artist) => {
        artists += `${artist.name}, `;
        if (!mainArtistSelected && artistList.length > 1) {
          mainArtistSelected = true;
          artists += "ft. ";
        }
      });
      artists = artists.substring(0, artists.lastIndexOf(',')); // remove the last comma

      let title = track.name;
      let album = track.album ? track.album.name : "Not Available";
      let externalUrl = track.external_urls.spotify;
      
      console.log(`
        Artist(s): ${artists}
        Title: ${title}
        Album: ${album}
        Link: ${externalUrl}
      `);
    } else {
      console.log('No tracks found mathing the title: ' + songName);
    }
  });
};

const handleMovies = (movieName) => {
  let params = `t=${movieName}`;

  request(`http://www.omdbapi.com/?apikey=${keys.omdbKey}&${params}`, function (error, response, body) {
    if (error) {
      console.log('error:', error); // Print the error if one occurred
    }  

    let movie = JSON.parse(response.body);
    let title = movie.Title;
    let year = movie.Year;
    let rating = movie.Rated;
    let productionCountry = movie.Country;
    let language = movie.Language;
    let plot = movie.Plot;
    let actors = movie.Actors;

    let ratings = movie.Ratings;
    let rottenTomatotesRating = "";
    for (let i = 0; i < ratings.length; i++) {
      let rating = ratings[i];
      if (rating.Source === "Rotten Tomatoes") {
        rottenTomatotesRating = rating.Value;
        break;
      }
    }

    console.log(`
      Title: ${title}
      Year: ${year}
      Rating: ${rating}
      Rotten Tomatoes Rating: ${rottenTomatotesRating}
      Country Produced: ${productionCountry}
      Language: ${language}
      Plot: ${plot}
      Actors: ${actors}
    `);
  });
};

const handlePassiveRequests = (args) => {
  let requestArgs = [];
  fs.readFile('./random.txt', "utf8", function read(err, data) {
    if (err) {
        throw err;
    }
    requestArgs = data.split(",");
    processRequest(requestArgs);
  });
};

const processRequest = (args) => {
  if (args.length > 0) {
    switch(args[0]) {
      case 'my-tweets':
        handleTwitter();
        break;
      case 'spotify-this-song':
        let songName = args.length > 1 ? args[1] : "The sign"
        handleSpotify(songName);
        break;
      case 'movie-this':
        let movieName = args.length > 1 ? args[1] : "Mr. Nobody"
        handleMovies(movieName);
        break;
      case 'do-what-it-says':
        handlePassiveRequests(args);
        break;
      default:
        console.log("You entered and invalid command. The list of valid commands are: 'my-tweets', 'spotify-this-song', 'movie-this', 'do-what-it-says'.");
        break;
    }
  } else {
    console.log("No arguments were supplied. The list of valid arguments are: 'my-tweets', 'spotify-this-song', 'movie-this', 'do-what-it-says'.");
  }
};

processRequest(args);