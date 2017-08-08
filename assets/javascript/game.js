$(document).ready(function(){

	//hide slection and win loss at the beginning, when no player is in database
	$(".p1content").hide();
	$(".p2content").hide();


	var playerName = "";
	var player = 0; //1 being player 1, and 2 being player 2

	//setup firebase
	var config = {

		apiKey: "AIzaSyDUcFxYpxdP5sBK1g_WbVsLYXh5VH_anrg",
		authDomain: "something-unique-1ae09.firebaseapp.com",
		databaseURL: "https://something-unique-1ae09.firebaseio.com",
		projectId: "something-unique-1ae09",
		storageBucket: "something-unique-1ae09.appspot.com",
		messagingSenderId: "896672520827"

		};

	firebase.initializeApp(config);

	var database = firebase.database();

	
	//if the database is missing the game db, create it...
	database.ref().once('value', function(snapshot){

		console.log(snapshot.val());
		if (!snapshot.child('rpsGameDB').exists()) {

			console.log("need to initDB");
			initrpsGameDB();

		} else {

			console.log("db exists");

		}

	})

	function initrpsGameDB() {

		var rpsGameDB = {

			player1: {
				name: "",
				win: 0,
				loss: 0,
				choice: 0,
			},

			player2: {
				name: "",
				win: 0,
				loss: 0,
				choice: 0,
			},

			//there need to be a chat object with which we can use to push user inputted text...
			//something like
			/* chat: {}, */

		};

		database.ref().set({

			rpsGameDB,

		})

	}

	//add player and assign player=1 (player1) or player=2 (player2)
	$("#addPlayer").on("click", function(event){

		console.log("clicked");
		event.preventDefault();
		playerName = $("#name").val().trim();

		database.ref().once("value", function(snapshot){

			if (snapshot.val().rpsGameDB.player1.name === ""){
				player = 1;
				database.ref('rpsGameDB/player1/').update({name: playerName});
				$("#p1name").text(playerName);
				$("#p1win").text(snapshot.val().rpsGameDB.player1.win);
				$("#p1loss").text(snapshot.val().rpsGameDB.player1.loss);
		
				$(".p1content").show();
				$("#addPlayerRow").hide();
			
			} else {
				player = 2;
				database.ref('rpsGameDB/player2/').update({name: playerName});
				$("#p2name").text(playerName);
				$("#p2win").text(snapshot.val().rpsGameDB.player2.win);
				$("#p2loss").text(snapshot.val().rpsGameDB.player2.loss);
				$(".p2content").show();
				$("#addPlayerRow").hide();

			}


		})


	})

	//push the player1 selected choice to database
	$(".p1choice").on("click", function(){

		var selectedChoice = $(this).attr("id");

		database.ref().once('value', function(snapshot){

			var pName = database.ref('rpsGameDB/player1/');
			pName.update({choice: selectedChoice.substring(1)});

		})


	})

	//push the player2 selected choice to databse
	$(".p2choice").on("click", function(){

		var selectedChoice = $(this).attr("id");

		database.ref().once('value', function(snapshot){

			var pName = database.ref('rpsGameDB/player2/');
			pName.update({choice: selectedChoice.substring(1)});

		})

	})

	//When unload event happens, check to see which player "quit" and update database for that player to initial state
	$(window).on("unload", function(event){

		console.log("triggered");

		event.preventDefault();

		if (player === 1) {

			var p1exit = database.ref('rpsGameDB/player1/');
			p1exit.update({
				name: "",
				win: 0,
				loss: 0,
				choice: 0,
			});

			player = 0;	

		}

		if (player === 2) {

			var p2exit = database.ref('rpsGameDB/player2/');
			p2exit.update({
				name: "",
				win: 0,
				loss: 0,
				choice: 0,
			});

			player = 0;

		}

		return null;

	})

	//handles initial load and the main game logic
	database.ref().on('value', function(snapshot){

		//update player name, win, loss for player 1 and 2.
		$("#p1name").text(snapshot.val().rpsGameDB.player1.name);
		$("#p1win").text(snapshot.val().rpsGameDB.player1.win);
		$("#p1loss").text(snapshot.val().rpsGameDB.player1.loss);
		$("#p2name").text(snapshot.val().rpsGameDB.player2.name);
		$("#p2win").text(snapshot.val().rpsGameDB.player2.win);
		$("#p2loss").text(snapshot.val().rpsGameDB.player2.loss);
		$("#p1win").show();
		$("#p1loss").show();
		$("#p2win").show();
		$("#p2loss").show();

		//empty chat log and append the new chat log...
		//this part still needs to be done...

		//As soon as both player made a selection, game will evaluate to determine win/loss/tie. During the determination process, user input is hidden to prevent "cheating"
		if (snapshot.val().rpsGameDB.player1.choice != 0 && 
		    snapshot.val().rpsGameDB.player2.choice != 0    ) {

			$("#p1selection").hide();
			$("#p1name").show();
			$("#p2selection").hide();
			$("#p2name").show();

			var p1 = snapshot.val().rpsGameDB.player1.choice;
			var p2 = snapshot.val().rpsGameDB.player2.choice;

			//tie condition
			if ((p1 === "r" && p2 === "r") ||
			    (p1 === "p" && p2 === "p") ||
			    (p1 === "s" && p2 === "s")    ) {

				$("#result").text("TIE!");


				setTimeout(function(){

					$("#result").text("");
					var p1Choice = database.ref('rpsGameDB/player1/');
					p1Choice.update({choice: 0});
					var p2Choice = database.ref('rpsGameDB/player2/');
					p2Choice.update({choice: 0});
					if (player === 1) {

						$("#p1selection").show();

					}

					if (player === 2) {

						$("#p2selection").show();

					}

				}, 3000)

			}


			//p1 wins
			if(p1 === "r" && p2 === "s") {

				$("#result").text("Player1 Wins!");
				var p1w = snapshot.val().rpsGameDB.player1.win;
				var p2l = snapshot.val().rpsGameDB.player2.loss;

				p1w++;
				p2l++;


				setTimeout(function(){

					$("#result").text("");
					var p1Choice = database.ref('rpsGameDB/player1/');
					p1Choice.update({choice: 0, win: p1w});
					var p2Choice = database.ref('rpsGameDB/player2/');
					p2Choice.update({choice: 0, loss: p2l});
					if (player === 1) {

						$("#p1selection").show();

					}

					if (player === 2) {

						$("#p2selection").show();

					}

				}, 3000)

			}

			if(p1 === "p" && p2 === "r") {

				$("#result").text("Player1 Wins!");
				var p1w = snapshot.val().rpsGameDB.player1.win;
				var p2l = snapshot.val().rpsGameDB.player2.loss;

				p1w++;
				p2l++;


				setTimeout(function(){

					$("#result").text("");
					var p1Choice = database.ref('rpsGameDB/player1/');
					p1Choice.update({choice: 0, win: p1w});
					var p2Choice = database.ref('rpsGameDB/player2/');
					p2Choice.update({choice: 0, loss: p2l});
					if (player === 1) {

						$("#p1selection").show();

					}

					if (player === 2) {

						$("#p2selection").show();

					}

				}, 3000)

			}

			if(p1 === "s" && p2 === "p") {

				$("#result").text("Player1 Wins!");
				var p1w = snapshot.val().rpsGameDB.player1.win;
				var p2l = snapshot.val().rpsGameDB.player2.loss;

				p1w++;
				p2l++;


				setTimeout(function(){

					$("#result").text("");
					var p1Choice = database.ref('rpsGameDB/player1/');
					p1Choice.update({choice: 0, win: p1w});
					var p2Choice = database.ref('rpsGameDB/player2/');
					p2Choice.update({choice: 0, loss: p2l});
					if (player === 1) {

						$("#p1selection").show();

					}

					if (player === 2) {

						$("#p2selection").show();

					}

				}, 3000)

			}

			//p2 wins
			if(p1 === "p" && p2 === "s") {

				$("#result").text("Player2 Wins!");
				var p2w = snapshot.val().rpsGameDB.player2.win;
				var p1l = snapshot.val().rpsGameDB.player1.loss;

				p2w++;
				p1l++;


				setTimeout(function(){

					$("#result").text("");
					var p1Choice = database.ref('rpsGameDB/player1/');
					p1Choice.update({choice: 0, loss: p1l});
					var p2Choice = database.ref('rpsGameDB/player2/');
					p2Choice.update({choice: 0, win: p2w});
					if (player === 1) {

						$("#p1selection").show();

					}

					if (player === 2) {

						$("#p2selection").show();

					}

				}, 3000)

			}

			if(p1 === "s" && p2 === "r") {

				$("#result").text("Player2 Wins!");
				var p2w = snapshot.val().rpsGameDB.player2.win;
				var p1l = snapshot.val().rpsGameDB.player1.loss;

				p2w++;
				p1l++;


				setTimeout(function(){

					$("#result").text("");
					var p1Choice = database.ref('rpsGameDB/player1/');
					p1Choice.update({choice: 0, loss: p1l});
					var p2Choice = database.ref('rpsGameDB/player2/');
					p2Choice.update({choice: 0, win: p2w});
					if (player === 1) {

						$("#p1selection").show();

					}

					if (player === 2) {

						$("#p2selection").show();

					}

				}, 3000)

			}

			if(p1 === "r" && p2 === "p") {

				$("#result").text("Player2 Wins!");
				var p2w = snapshot.val().rpsGameDB.player2.win;
				var p1l = snapshot.val().rpsGameDB.player2.loss;

				p2w++;
				p1l++;


				setTimeout(function(){

					$("#result").text("");
					var p1Choice = database.ref('rpsGameDB/player1/');
					p1Choice.update({choice: 0, loss: p1l});
					var p2Choice = database.ref('rpsGameDB/player2/');
					p2Choice.update({choice: 0, win: p2w});
					if (player === 1) {

						$("#p1selection").show();

					}

					if (player === 2) {

						$("#p2selection").show();

					}

				}, 3000)

			}

		}

		//need to update the chat log here

	})

	/*
	$("#submit").on('click', function(event){

		var text = $().val().trim();

		if (player === 1) {
	
			database.ref('rpsGameDB/chat/').push( player1's name: + text);

		}

		if (player === 2) {
	
			database.ref('rpsGameDB/chat/').push( player2's name: + text);

		}

	})

	*/

})