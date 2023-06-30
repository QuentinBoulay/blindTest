function getData(url) {
  return new Promise((resolve, reject) => {
    fetch("https://limitless-basin-67065.herokuapp.com/" + url)
      .then((response) => {
        if (response.status !== 200) {
          console.log(
            "Looks like there was a problem. Status Code: " + response.status
          );
          return; //returns undefined!
        }

        // Examine the text in the response
        response.json().then((data) => {
          resolve(data);
        });
      })
      .catch(function (err) {
        console.log("Fetch Error :-S", err);
        reject(err);
      });
  });
}

//A utiliser avec "await" pour le chargement asynchrone
async function getAlbum(id) {
  console.log("Chargement en cours de l'album...");
  const data = await getData("http://api.deezer.com/album/" + id);
  console.log("Chargement terminé !");
  return data;
}

//A utiliser avec "await" pour le chargement asynchrone
async function getArtist(id) {
  console.log("Chargement en cours de l'artiste...");
  const data = await getData("http://api.deezer.com/artist/" + id);
  console.log("Chargement terminé !");
  return data;
}

//A utiliser avec "await" pour le chargement asynchrone
async function getTrack(id) {
  console.log("Chargement en cours du titre...");
  const data = await getData("http://api.deezer.com/track/" + id);
  console.log("Chargement terminé !");
  return data;
}

//A utiliser avec "await" pour le chargement asynchrone
async function getTrackList(id) {
  console.log("Chargement en cours de la tracklist...");
  const data = await getData(
    "http://api.deezer.com/artist/" + id + "/top?limit=50"
  );
  console.log("Chargement terminé !");
  return data;
}

//Zone custom - pour vos propres fonctions

//Fin de zone custom


// ------------------------------------------------------ CODE POUR PLUSIEURS ARTISTES NON DEFINIS -------------------------------------------------------
// let artistsArray = [];

// $('#artist-form').append('<label for=artist-select">Choisissez un artiste:</label><select id="artist-select" name="artiste"></select><input type="submit" value="JOUER">');

// for (let i = 0; i < 10; i++) {
//     artistsArray[i] = await getArtist(i+1);
// }

// $.each(artistsArray, function(index, value) {
//   $('<option>').val(value.id).text(value.name).appendTo('#artist-select');
// });
