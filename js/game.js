$.getUrlParam = function (name) {
  var results = new RegExp("[?&]" + name + "=([^&#]*)").exec(
    window.location.href
  );
  if (results == null) {
    return null;
  }
  return decodeURI(results[1]) || 0;
};

$(document).ready(async function () {
  // Déclaration des variables
  let trackList;
  let song;
  let currentTrack;
  let goodAnswers = 0;
  let badAnswers = false;
  let countBadAnswers = 0;
  let artistId;
  let nameArtist;
  let round;
  let scores = [];

  // Gestion de la soumission du formulaire de sélection de l'artiste
  $("#artist-form").submit(async function (event) {
    // empêcher la soumission du formulaire
    event.preventDefault();
    var option = $("#artist-select option:selected");
    var nameArtist = option.text();

    // récupérer les données du formulaire
    var formData = $(this).serialize();

    // Confirmation de l'activation du mode challenge par l'utilisateur
    var challengeMod = window.confirm(
      "Souhaitez-vous activer le mode challenge ?"
    );

    // rediriger vers la nouvelle page en passant les données du formulaire dans l'URL
    window.location.href =
      "game.html?" +
      formData +
      "&name=" +
      nameArtist +
      "&challengeMod=" +
      challengeMod;
  });

  $("#tab-score").click(function (event) {
    event.preventDefault();
    // Masquer la page d'accueil et afficher la page des scores
    $("#container-accueil").addClass("hidden");
    $("#container-scores").removeClass("hidden");

    // Si le tableau de scores existe dans Local Storage
    if (localStorage.getItem("scores")) {
      // Conversion de la chaîne de caractères en objet JavaScript
      scores = JSON.parse(localStorage.getItem("scores"));
    }

    // Trier le tableau des scores par ordre décroissant
    scores.sort(function (a, b) {
      return b.score - a.score;
    });

    // Affichage du tableau de scores
    var html = "<h2>Tableau des scores</h2> <table>";
    html += "<tr><th>Joueur</th><th>Score</th></tr>";
    for (var i = 0; i < scores.length; i++) {
      html +=
        "<tr><td>" +
        scores[i].username +
        "</td><td>" +
        scores[i].score +
        "</td></tr>";
    }
    html += "</table>";
    $("#container-scores").prepend(html);
  });

  $("#return").click(function (event) {
    event.preventDefault();
    $("#container-accueil").removeClass("hidden");
    $("#container-scores").addClass("hidden");
    $("#container-scores table, #container-scores h2").remove();
  });

  // récupérer les données du formulaire
  artistId = $.getUrlParam("artiste");
  nameArtist = $.getUrlParam("name");
  var promiseArtist = await getArtist(artistId);
  // Création de l'élément img
  const $imgArtist = $("<img>");

  // Définition des attributs de l'élément
  $imgArtist.attr("src", promiseArtist.picture);
  $imgArtist.attr("alt", "Artiste");

  // Sélection de l'élément après lequel l'élément img doit être inséré
  const $monH2Good = $("#good-answers");
  const $monH2Bad = $("#bad-answers");

  var challengeMod = $.getUrlParam("challengeMod");

  if (challengeMod == "true") {
    // Insertion de l'élément img après l'élément de référence
    $imgArtist.insertAfter($monH2Good);
  } else {
    $imgArtist.insertAfter($monH2Bad);
  }

  $("#artist").text("Blind test sur " + nameArtist);

  // Déclaration des fonctions
  function getPreview(track) {
    return track.preview;
  }

  function getRandom(track) {
    return Math.floor(Math.random() * track.length);
  }

  function getTitle(track) {
    return track.title;
  }

  function insertScore() {
    $(
      "#tour, #good-answers, #bad-answers, #send, #idk, #player, .group"
    ).remove();

    $("#final-result").text(
      "Voici votre score final : " + goodAnswers + " / 10"
    );

    $(".buttons-form").append(
      '      <form id="username-form"><label for="username-input">Entrez votre nom </label><input type="text" id="username-input"><br><br><input id="register" type="submit" value="ENREGISTRER"> <input id="no-register" type="submit" value="NE PAS S\'ENREGISTRER"></form>'
    );

    // Gestion de la soumission du formulaire de saisie du nom de l'utilisateur
    $("#register").click(function (event) {
      // Empêche le rechargement de la page
      event.preventDefault();

      // Récupération du nom de l'utilisateur
      var username = $("#username-input").val();

      var score = {
        username: username,
        score: goodAnswers,
      };

      // Si le tableau de scores existe dans Local Storage
      if (localStorage.getItem("scores")) {
        // Conversion de la chaîne de caractères en objet JavaScript
        scores = JSON.parse(localStorage.getItem("scores"));
      }
      // Ajout du nouveau score au tableau de scores
      scores.push(score);
      // Enregistrement du tableau de scores dans Local Storage
      localStorage.setItem("scores", JSON.stringify(scores));
      window.location.href = "index.html";
    });

    $("#no-register").click(function (event) {
      event.preventDefault();
      window.location.href = "index.html";
    });
  }

  function disabledButtons() {
    $("#send").prop("disabled", true);
    $("#idk").prop("disabled", true);
    setTimeout(function () {
      $("#idk").prop("disabled", false);
      $("#send").prop("disabled", false);
    }, 4000);
  }

  function getStats() {
    $("#tour").text("Tour : " + round + " / 10");
    $("#good-answers").text("Bonnes réponses : " + goodAnswers);
    $("#bad-answers").text("Mauvaises réponses : " + countBadAnswers);
  }

  function loadPreview(preview) {
    // Récupération de l'élément audio du player
    let audioElement = $("#player");
    // Mise à jour de la source de l'audio
    audioElement.attr("src", preview);
  }

  function tourSuivant() {
    // Mise à jour du morceau en cours de lecture
    song = getRandom(trackList);
    currentTrack = trackList[song];
    console.log(currentTrack);

    // Chargement de la preview du morceau
    loadPreview(getPreview(currentTrack));
    // Incrémentation du tour

    if (challengeMod === "true" && badAnswers === true) {
      insertScore();
    } else if (challengeMod == "true" && badAnswers == false) {
      // Mise à jour de l'affichage du score
      $("#tour").text("Tour : " + round);
      $("#good-answers").text("Bonnes réponses : " + goodAnswers);
    } else if (challengeMod == "false" && badAnswers == true) {
      if (round >= 10) {
        insertScore();
      } else {
        // Mise à jour de l'affichage du tour et du score
        getStats();
      }
    } else if (challengeMod == "false" && badAnswers == false) {
      // Mise à jour de l'affichage du tour et du score
      getStats();
    }
    round++;
  }

  async function playArtist(id) {
    // Récupération de la liste de morceaux de l'artiste
    trackList = await getTrackList(id);
    trackList = trackList.data;

    // Récupération de la valeur de la variable challengeMod
    challengeMod = $.getUrlParam("challengeMod");

    console.log(challengeMod);
    console.log(scores);

    goodAnswers = 0;
    badAnswers = false;
    countBadAnswers = 0;
    round = 0;

    // Passage au premier tour
    tourSuivant();

    // Gestion de la réponse du joueur
    $("#send").click(function (event) {
      // Empêche le rechargement de la page
      event.preventDefault();
      // Récupération de la réponse du joueur
      let answer = $("#reponse").val();
      // Vérification de la réponse
      if (answer.toLowerCase() === getTitle(currentTrack).toLowerCase()) {
        // Bonne réponse : incrémentation du score
        goodAnswers++;
      } else {
        badAnswers = true;
        countBadAnswers++;
        // Affichage de l'alert
        $("#incorrect-answer-alert")
          .text(
            'Mauvaise réponse ! Le titre du morceau était "' +
              getTitle(currentTrack) +
              '"'
          )
          .fadeIn(500)
          .delay(3000)
          .fadeOut(500);

        disabledButtons();
      }
      // Passage au tour suivant
      tourSuivant();
    });
    $("#idk").click(function (event) {
      event.preventDefault();
      badAnswers = true;
      countBadAnswers++;
      // Affichage de l'alert
      $("#incorrect-answer-alert")
        .text(
          'Mauvaise réponse ! Le titre du morceau était "' +
            getTitle(currentTrack) +
            '"'
        )
        .fadeIn(500)
        .delay(3000)
        .fadeOut(500);

      disabledButtons();
      tourSuivant();
    });
  }
  // Récupération de l'ID de l'artiste sélectionné
  await playArtist(artistId);
});
