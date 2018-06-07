// Define arrays to hold data standing data
var winners = [];
var finals = [];
var semiFinals = [];
var quarters = [];
var eighths = [];
var pools = {"a" : {},
			 "b" : {},
			 "c" : {},
			 "d" : {},
			 "e" : {},
			 "f" : {},
			 "g" : {},
			 "h" : {}};
var gameData = {};
resetTeamNodes();

// User Data Management - Placed in {} block to prevent access to currentUserName 
{
let currentUserName = "";
	
	$(function () {
		// On submit, disable form submission but allow required fields warnings to popup.
		$("#userInfo").submit(function (ev) {
			ev.preventDefault();
		});

		// Verify validity and perform different actions based on which loginInfo button was pressed
		$("#loginInfo button").click(function (ev) {
			if ($(this).attr('id') === "logout") {
				console.log("User: '" + currentUserName + "'' Logged Out");
				currentUserName = "";
				$("#saveBracket").prop("disabled", true);
				$("#loadBracket").prop("disabled", true);
				$("#logout").prop("disabled", true);
				$("#login").prop("disabled", false);
				$("#newUser").prop("disabled", false);
				$("#username").prop("disabled", false);
				$("#username").prop("value", "");
				$("#password").prop("disabled", false);
				$("#password").prop("value", "");
			}
			if ($("#loginInfo")[0].checkValidity()) {

				let username = $('#username').val();
				let password = $('#password').val();

				if ($(this).attr('id') === "login") {
					loginUser(username, password);
				} else if ($(this).attr('id') === "new-user") {
					newUser(username, password);
				} else {
					alert("Incorrect button configuration! Form Submit Button Error");
					console.log("Incorrect button configuration! Form Submit Button Error");
				}
			}			
		});
	});

	function loginUser(userName, password) {
		var storedUsers = JSON.parse(localStorage.getItem("storedUsers"));
		
		if (storedUsers) {
			if (storedUsers.hasOwnProperty(userName)) {
				if (storedUsers[userName] === password) {
					currentUserName = userName;
					$("#saveBracket").prop("disabled", false);
					$("#loadBracket").prop("disabled", false);
					$("#logout").prop("disabled", false);
					$("#login").prop("disabled", true);
					$("#newUser").prop("disabled", true);
					$("#username").prop("disabled", true);
					$("#username").prop("value", currentUserName);
					$("#password").prop("disabled", true);
					$("#password").prop("value", "*******");
					console.log("! User '" + userName + "' Logged in!");
				} else {
					console.log("! Incorrect password for user: '" + userName + "'");
					alert("! Incorrect password for user: '" + userName + "'");
				}
			} else {
				console.log("! UserName does not exist on this machine!");
				alert("! UserName does not exist on this machine!");
			}
		} else {
			console.log("! No UserNames exist on this machine, create new user!");
			alert("! No UserNames exist on this machine, create new user!");
		}
	}
	function newUser(userName, password) {
		var storedUsers = JSON.parse(localStorage.getItem("storedUsers"));
		var alreadyExists = false;
		if (storedUsers) {
			if (storedUsers.hasOwnProperty(userName)) {
				alreadyExists = true;
			}
		} else {
			storedUsers = {};
		}

		if (alreadyExists) {
			console.log("! User: " + userName + " already exists!");
			alert("! User: " + userName + " already exists!");
		} else {
			storedUsers[userName] = password;
			window.localStorage.setItem("storedUsers", JSON.stringify(storedUsers));
			console.log("! New User: '" + userName + "'' has been created!");
			alert("! New User: '" + userName + "'' has been created! Please Login.");
		}
	}
	function resetBracketData() {
		// Request data from storage.

		$.ajax({
			url: "storage\\app-base.json",
			type: "GET",
			dataType: "json"
		})
		.fail(function(xhr, status, errorThrown) {
			alert("Sorry, there was a problem accessing base bracket data!");
			console.log("Sorry, there was a problem accessing base bracket data!")
			console.log("Error: " + errorThrown);
			console.log("Status: " + status);
		})
		.always(function(xhr, status) {
			console.log("AJAX Base Pools Request Executed");
		})
		.done(function(json) {
			gameData = json.gameData;
			displayAllGameData();
			pools = json.pools;
			displayPools();
			resetTeamNodes();
			setSortables();
			setEighthsNames(json.pools);
			displayAllFields();
			console.log("Bracket and Pools reset to initial values");
		});
	}

	function saveBracketData() {
		
		// Don't allow save if nothing is loaded
		if (pools["a"].rank1) {
			if (currentUserName) {
				let poolsForJSON = {};
				let eighthsForJSON = {};
				let quartersForJSON = {};
				let semiFinalsForJSON = {};
				let finalsForJSON = {};
				let winnersForJSON = {};

				for (key in pools) {
					poolsForJSON[key] = pools[key];
				}
				for (i = 0; i < eighths.length; i++) {
					eighthsForJSON[i] = (({teamName, gameLocation, gameIndex}) => ({teamName, gameLocation, gameIndex}))(eighths[i]);
				}
				for (i = 0; i < quarters.length; i++) {
					quartersForJSON[i] = (({teamName, gameLocation, gameIndex}) => ({teamName, gameLocation, gameIndex}))(quarters[i]);
				}
				for (i = 0; i < semiFinals.length; i++) {
					semiFinalsForJSON[i] = (({teamName, gameLocation, gameIndex}) => ({teamName, gameLocation, gameIndex}))(semiFinals[i]);
				}
				for (i = 0; i < finals.length; i++) {
					finalsForJSON[i] = (({teamName, gameLocation, gameIndex}) => ({teamName, gameLocation, gameIndex}))(finals[i]);
				}
				for (i = 0; i < winners.length; i++) {
					winnersForJSON[i] = (({teamName, gameLocation, gameIndex}) => ({teamName, gameLocation, gameIndex}))(winners[i]);
				}

				var saveDataJSON = JSON.stringify({"pools" : poolsForJSON, "eighths" : eighthsForJSON, "quarters" : quartersForJSON, "semiFinals" : semiFinalsForJSON, "finals" : finalsForJSON, "winners" : winnersForJSON}, null, '\t');	

				window.localStorage.setItem(currentUserName, saveDataJSON);
				console.log("***User: '" + currentUserName + "' stored their Bracket data to LocalStorage***");
				alert("***User: '" + currentUserName + "' stored their Bracket data***")

				/* // Note: JQuery and web javascript cannot write to files for security issues. Would need to use alternative language such as PHP. 
				$.ajax({
					url: "storage\\testMe.json",
					data: saveDataJSON,
					success: console.log("Saved Data Locally"),
					error: function(xhr, textStatus, errorThrown) {
						console.log("Failure to Save Data Locally");
						alert("Oops, something went wrong when trying to Save Data Locally!" +
								xhr + "	" + textStatus + "	" + errorThrown);
					},
					timeout: 5000,
					method: "POST"
				});*/
			} else {
				console.log("Cannot save : No user is logged in");
				alert("Cannot save : No user is logged in");
			}
		} else {
			console.log("No data is loaded, save not allowed");
			alert("No data is loaded, save not allowed");
		}
		
		
	}

	function loadBracketData() {
		let loadDataFromJSON = JSON.parse(localStorage.getItem(currentUserName));
		if (loadDataFromJSON) {
			console.log("***User: '" + currentUserName + "' retrieved their Bracket data from LocalStorage***");	
			for (key in pools) {
				pools[key] = loadDataFromJSON.pools[key];
			}
			for (i = 0; i < eighths.length; i++) {
				eighths[i].teamName = loadDataFromJSON.eighths[i].teamName;
			}
			for (i = 0; i < quarters.length; i++) {
				quarters[i].teamName = loadDataFromJSON.quarters[i].teamName;
			}
			for (i = 0; i < semiFinals.length; i++) {
				semiFinals[i].teamName = loadDataFromJSON.semiFinals[i].teamName;
			}
			for (i = 0; i < finals.length; i++) {
				finals[i].teamName = loadDataFromJSON.finals[i].teamName;
			}
			for (i = 0; i < winners.length; i++) {
				winners[i].teamName = loadDataFromJSON.winners[i].teamName;
			}
			displayPools();
			setSortables();
			displayAllFields();
			alert("***User: '" + currentUserName + "' retrieved their Bracket data***")
		} else {
			console.log("***User: '" + currentUserName + "' does not have a saved bracket.***");
			alert("***User: '" + currentUserName + "' does not have a saved bracket.***");
		};
		
	}

	//Style buttons based on user.
	if (currentUserName) {
		$("#saveBracket").prop("disabled", false);
	} else {
		$("#saveBracket").prop("disabled", true);
	}
}

//Get game Data
$.ajax({
	url: "storage\\app-base.json",
	type: "GET",
	dataType: "json"
})
.fail(function(xhr, status, errorThrown) {
	alert("Sorry, there was a problem accessing game data!");
	console.log("Sorry, there was a problem accessing game data!")
	console.log("Error: " + errorThrown);
	console.log("Status: " + status);
})
.always(function(xhr, status) {
	console.log("AJAX Base GameData Request Executed");
})
.done(function(json) {
	gameData = json.gameData;
	displayAllGameData();
});

function displayGameData(gameSet) {
	$("#" + gameSet + " .dateTime").each(function(index) {
		$(this).find(".date").html(eval("gameData." + gameSet + ".game" + (index+1) + ".date"));
		$(this).find(".time").html(eval("gameData." + gameSet + ".game" + (index+1) + ".time"));
	})
}

function displayAllGameData() {
	displayGameData("eighths");
	displayGameData("quarters");
	displayGameData("semiFinals");
	displayGameData("finals");
}

function displayPools() {
	$("#pools > div").each(function(index) {
		let poolID = $(this).prop("id").slice(-1);
		$(this).find("li").each(function(index2) {
			$(this).html(pools[poolID]["rank" + (index2 + 1)]);
		}); 
	});
	//console.log("Displayed Pools");
}

function setSortables() {
	$("#pools ul").sortable({
		placeholder: "ui-state-highlight",
		axis: "y",
		containment: "parent",
		create: function(event, ui) {
			$(this).addClass("cursorDrag");
		},
		update: function(event, ui) {
			let poolID = $(this).parent().closest("[id]").prop("id").slice(-1);
			let swapTeams = {};

			$(this).find("li").each(function(index) {
				if(pools[poolID]["rank" + (index + 1)] !== $(this).html()) {
					swapTeams[pools[poolID]["rank" + (index + 1)]] = $(this).html();
					pools[poolID]["rank" + (index + 1)] = $(this).html();	
				}
			});
			console.log("pool-" + poolID + " Updated");
			setEighthsNames(pools);
			replaceTeams(quarters, swapTeams);
			replaceTeams(semiFinals, swapTeams);
			replaceTeams(finals, swapTeams);
			replaceTeams(winners, swapTeams);
			displayAllFields();
		}
	});
	$("#pools ul").disableSelection();
}

function replaceTeams(gameSet, replacements) {
	$(gameSet).each(function(index) {
		if(replacements[this.teamName]) {
			this.teamName = replacements[this.teamName];
		}
	})
}

// Define class for each Team Node. 
	// upperNode is in reference to the winning slot of each match.
	// dropClass indicates highlighted cells when dragging elements.
function TeamNode(teamName, upperNode, dropClass, gameLocation, gameIndex) {
	this.teamName = teamName;
	this.upperNode = upperNode;
	this.dropClass = dropClass;
	this.gameLocation = gameLocation;
	this.gameIndex = gameIndex;
}

// Function to initiate on start/reset of bracket.
	// Clears all names and sets up references.
function defaultTeamNodes(count, upperNode, currentGameStr) {
	let teamNodes = [];
	for (i = 0; i < count; i++) {
		if(upperNode) {
			teamNodes[i] = new TeamNode("", upperNode[Math.floor(i/2)], false, currentGameStr, i);
		} else {
			teamNodes[i] = new TeamNode("",null, false, currentGameStr, i);
		}	
	}
	return teamNodes;
}

// Runs default function on each game set
function resetTeamNodes() {
	winners = defaultTeamNodes(1,null, "winners");
	finals = defaultTeamNodes(2, winners, "finals");
	semiFinals = defaultTeamNodes(4, finals, "semiFinals");
	quarters = defaultTeamNodes(8, semiFinals, "quarters");
	eighths = defaultTeamNodes(16, quarters, "eighths");
	//winners have second and third place.
	winners[1] = {"teamName": "", "upperNode": null, "dropClass": false, "gameLocation": "winners", "gameIndex": 1};
	winners[2] = {"teamName": "", "upperNode": null, "dropClass": false, "gameLocation": "winners", "gameIndex": 2};
	// Finals round has a losers team match, need extra positions.
	finals[0]["loserNode"] = winners[1];
	finals[1]["loserNode"] = winners[1];
	finals[2] = {"teamName": "", "upperNode": winners[2], "dropClass": false, "gameLocation": "finals", "gameIndex": 2};
	finals[3] = {"teamName": "", "upperNode": winners[2], "dropClass": false, "gameLocation": "finals", "gameIndex": 3};	
	semiFinals[0]["loserNode"] = finals[2];
	semiFinals[1]["loserNode"] = finals[2];
	semiFinals[2]["loserNode"] = finals[3];
	semiFinals[3]["loserNode"] = finals[3];
	console.log("Team Nodes Reset to Default Objects.");
}

// Generates eighths team names based on pool standing.
function setEighthsNames(poolGroups) {
	eighths[0].teamName = poolGroups.a.rank1;
	eighths[1].teamName = poolGroups.b.rank2;
	eighths[2].teamName = poolGroups.c.rank1;
	eighths[3].teamName = poolGroups.d.rank2;
	eighths[4].teamName = poolGroups.e.rank1;
	eighths[5].teamName = poolGroups.f.rank2;
	eighths[6].teamName = poolGroups.g.rank1;
	eighths[7].teamName = poolGroups.h.rank2;
	eighths[8].teamName = poolGroups.b.rank1;
	eighths[9].teamName = poolGroups.a.rank2;
	eighths[10].teamName = poolGroups.d.rank1;
	eighths[11].teamName = poolGroups.c.rank2;
	eighths[12].teamName = poolGroups.f.rank1;
	eighths[13].teamName = poolGroups.e.rank2;
	eighths[14].teamName = poolGroups.h.rank1;
	eighths[15].teamName = poolGroups.g.rank2;
	console.log("Eighths Team Names Set using Pool Values.")
}

// Displays team names in designated id section in html.
function displayFields(idString) {
	$("#" + idString + " .teamName").not(".clonedTeam").each(function(index) {
		$(this).html(
			eval(idString + "[index].teamName")
		);
		if($(this).html() !== "") {
			$(this).draggable({
				helper: "clone",
				cursorAt: {left:($(this).width()/2)},
				create: function(event, ui) {
					$(this).addClass("cursorDrag");
				},
				start: function(event, ui) {
					$(ui.helper).width($(this).width());
					$(ui.helper).addClass("clonedTeam");
					findDroppables(this);
				},
				stop: function(event, ui) {
					clearAllDropClasses();
					updateAllDropClasses();
				}
			});
		};

		function clearAllDropClasses() {
			for(each in quarters) {
				quarters[each].dropClass = false;
			}
			for(each in semiFinals) {
				semiFinals[each].dropClass = false;
			}
			for(each in finals) {
				finals[each].dropClass = false;
			}
			for(each in winners) {
				winners[each].dropClass = false;
			}
		}

		function findDroppables(team) {
			clearAllDropClasses();
			// winners area should always be droppable (except for current team)
			let nearestID = $(this).closest("[id]").prop("[id]")
			let selectedTeamName = $(team).html();
			if(nearestID === "first-Place") {
				if(winners[1].teamName !== selectedTeamName) {
					winners[1].dropClass = true;
				}
				if(winners[2].teamName !== selectedTeamName) {
					winners[2].dropClass = true;
				}
			} else if (nearestID === "second-Place") {
				if(winners[0].teamName !== selectedTeamName) {
					winners[0].dropClass = true;
				}
				if(winners[2].teamName !== selectedTeamName) {
					winners[2].dropClass = true;
				}
			} else if (nearestID === "third-Place") {
				if(winners[0].teamName !== selectedTeamName) {
					winners[0].dropClass = true;
				}
				if(winners[1].teamName !== selectedTeamName) {
					winners[1].dropClass = true;
				}
			} else {
				if(winners[0].teamName !== selectedTeamName) {
					winners[0].dropClass = true;
				}
				if(winners[1].teamName !== selectedTeamName) {
					winners[1].dropClass = true;
				}
				if(winners[2].teamName !== selectedTeamName) {
					winners[2].dropClass = true;
				}
			};
			let selectTeamName = $(team).html();
			let matchDistance = gameDistance($(team).parent().parent().closest("[id]").prop("id"));
			let currentTeam = eighths.find( baseTeam => baseTeam.teamName === selectTeamName);
			for (i = 0; i < matchDistance; i++) {
				currentTeam = currentTeam.upperNode;
				if (currentTeam.loserNode) {
					if (currentTeam.loserNode.teamName !== selectTeamName) {
						currentTeam.loserNode.dropClass = true;
					}
				}
			}
			while (currentTeam.upperNode) {
				if (currentTeam.loserNode) {
					if (currentTeam.loserNode.teamName !== selectTeamName) {
						currentTeam.loserNode.dropClass = true;
					}
				}
				if (currentTeam.upperNode.teamName !== selectTeamName) {
					currentTeam.upperNode.dropClass = true;
				} 
				currentTeam = currentTeam.upperNode;
			}
			updateAllDropClasses();
		};
	});
	// eighths will never have dropabbles; these are updated from pools.
	if(idString !== "eighths") {
		updateDropClasses(idString);
	}
}

function updateDropClasses(gameSet) {
	// Dragging function creates a <p> copy with .teamName, need to limit if statements to valid gameSet[index] range
	$("#" + gameSet + " .teamName").not(".clonedTeam").each(function(index) {
		if($(this).hasClass("dropClass") !== eval(gameSet + "[index].dropClass")) {
					$(this).toggleClass("dropClass");
			};
		let isDropClass = $(this).hasClass("dropClass");
		if(isDropClass) {
			setDroppable(this);
		} else {
			if($(this).hasClass("ui-droppable")) {
				$(this).droppable("destroy");
			}
		}
	});	
}

function setDroppable(team) {
	$(team).droppable({
		classes: {
			"ui-droppable-active": "ui-state-active",
			"ui-droppable-hover": "ui-state-hover"
		},
		drop: function(event, ui) {
			let replacedTeamName = $(this).html();
			let newTeamName = ui.helper.html();
			let targetGameFull = $(this).parent().parent().closest("[id]").prop("id");
			let targetGameLoss = $(this).parent().closest("[id]").prop("id");
			console.log("Target Game Full: " + targetGameFull + " ; Sub: " + targetGameLoss);
			setGameWin(targetGameFull, targetGameLoss, newTeamName, replacedTeamName);
		}
	});
}

// Displays all game sets' html
function displayAllFields() {
	displayFields("eighths");
	displayFields("quarters");
	displayFields("semiFinals");
	displayFields("finals");
	displayFields("winners");
	//console.log("All Fields Displayed");
}
function updateAllDropClasses() {
	updateDropClasses("quarters");
	updateDropClasses("semiFinals");
	updateDropClasses("finals");
	updateDropClasses("winners");
	//console.log("quarters, semiFinals, finals, and winners dropClass updated")
}

// Updates game sets to reflect moved team in bracket.
function setGameWin(targetGameFull, targetGameLoss, newTeam, oldTeam) {
	// First find the initial game's object
	let baseTeam = eighths.find( team => team.teamName === newTeam);
	// Determine how many games they should win based on moved team.
	let fullDistance = gameDistance(targetGameFull);
	let lossDistance = gameDistance(targetGameLoss);
	// Traverse Bracket (towards winner) and update game set data.
	updateGames(baseTeam, fullDistance, lossDistance, oldTeam);
	// Update HTML after setting data
	displayAllFields();
}

function gameDistance(gameSet) {
	switch(gameSet) {
		case 'eighths':
			return 0;
		case 'quarters':
			return 1;
		case 'semiFinals':
			return 2;
		case 'finals':
			return 3;
		case 'winners':
			return 4;
		// Since finals games have a losers game, special directions for third-Place-Game
		case 'first-Place-Game':
			return 3;
		case 'third-Place-Game':
			return 2;
		// Setting winners position requires special instructions due to Third Place Games
		case 'first-Place':
			return 4;
		case 'second-Place':
			return 3;
		case 'third-Place':
			return 2;
		default:
			console.log("Invalid GameSet ID: " + gameSet);
			return 0;
		}
}

function updateGames(currentTeam, fullDistance, lossDistance, targetTeam) {
	// Update games until location of possible loss.
	currentTeam = traverseMatchDistance(currentTeam, lossDistance);
	// If lose game, continue updated after loss (if allowed to play more)
	if ((fullDistance - lossDistance) > 0 ) {
		if (currentTeam.upperNode.teamName === currentTeam.teamName) {
			console.log("	--- Clearing upperNodes of " + currentTeam.upperNode.teamName + " from " + currentTeam.upperNode.gameLocation + "[" + currentTeam.upperNode.gameIndex + "]");
			let clearTeam = currentTeam.upperNode;
			clearTeam.teamName = "";
			traverseWithTeam(clearTeam, currentTeam.teamName);
		}
		console.log("Updating from first loser game to target game");
		console.log("	From " + currentTeam.gameLocation + "[" + currentTeam.gameIndex + "] to " + currentTeam.loserNode.gameLocation + "[" + currentTeam.loserNode.gameIndex + "]");
		console.log("	Replacing: " + currentTeam.loserNode.teamName + " with " + currentTeam.teamName);
		let forceUpdateTeam = currentTeam.loserNode;
		forceUpdateTeam.teamName = currentTeam.teamName;
		forceUpdateTeam = traverseMatchDistance(forceUpdateTeam, (fullDistance - lossDistance - 1));
		traverseWithTeam(forceUpdateTeam, targetTeam);
	}
	traverseWithTeam(currentTeam, targetTeam);
	checkForAutoFill();
	

		
	function getVersusTeam(gameSet, index) {
		// Returns opposing team to selected team
		return eval(gameSet + "[" + (index+1-2*(index%2)) + "]");
	}

	function traverseMatchDistance(traversingTeam, matchDistance) {
		// Automatically traverses [matchDistance] games from current game. 
		for (i = 0; i < matchDistance; i++) {
			console.log((i+1) + " of " + matchDistance);
			if (traversingTeam.loserNode) {
				if (traversingTeam.loserNode.teamName === traversingTeam.teamName) {
					console.log("	--- Clearing loserNodes of " + traversingTeam.loserNode.teamName + " from " + traversingTeam.loserNode.gameLocation + "[" + traversingTeam.loserNode.gameIndex + "]");
					let clearTeam = traversingTeam.loserNode;
					clearTeam.teamName = "";
					traverseWithTeam(clearTeam, traversingTeam.teamName);
				}
			}
			logUpperChange(traversingTeam);
			traversingTeam.upperNode.teamName = traversingTeam.teamName;
			traversingTeam = traversingTeam.upperNode;
		}
		return traversingTeam;
	}

	function traverseWithTeam(traversingTeam, replacedTeam) {
		// Traverses the rest of the bracket if team change needs to cascade throughout.
		while (traversingTeam.upperNode || traversingTeam.loserNode) {
			if (traversingTeam.upperNode) {
				if (traversingTeam.upperNode.teamName !== "" && 
					traversingTeam.upperNode.teamName === replacedTeam) {
					console.log("Traversing into upperNode");
					logUpperChange(traversingTeam);
					traversingTeam.upperNode.teamName = traversingTeam.teamName;
					traversingTeam = traversingTeam.upperNode;
					continue;
				}
			}
			if (traversingTeam.loserNode) {
				if (traversingTeam.loserNode.teamName !== "" &&
					traversingTeam.loserNode.teamName === replacedTeam) {
					console.log("Traversing into loserNode");
					traversingTeam.loserNode.teamName = traversingTeam.teamName;
					traversingTeam = traversingTeam.loserNode;
					continue;
				}
			}
			console.log("Exiting Traversal");
			break;
		}			
	}
	// logUpperChange and logLoserChange logs which locations were changed to the web console.
	function logUpperChange(team) {
		console.log("	From" + team.gameLocation + "[" + team.gameIndex + "] to " + team.upperNode.gameLocation + "[" + team.upperNode.gameIndex + "]");
		console.log("	Replacing: " + team.upperNode.teamName + " with " + team.teamName);
	}
	function logLoserChange(team) {
		console.log("	From" + team.gameLocation + "[" + team.gameIndex + "] to " + team.loserNode.gameLocation + "[" + team.loserNode.gameIndex + "]");
		console.log("	Replacing: " + team.loserNode.teamName + " with " + team.teamName);
	}

	function checkForAutoFill() {
		let eachTeam = {};
		let versusTeam = {};
		// Starting from the eighths spot, cycle through teams and determine if the bracket needs updated.
		for (index in eighths) {
			eachTeam = eighths[index];
			console.log("*- Checking " + eachTeam.teamName + " for automatic updates");
			while (eachTeam.upperNode || eachTeam.loserNode) {
				if (eachTeam.upperNode) {
					versusTeam = getVersusTeam(eachTeam.gameLocation, eachTeam.gameIndex);
					//console.log("	- Checking upperNode " + eachTeam.upperNode.gameLocation + "[" + eachTeam.upperNode.gameIndex + "] need clear");
					// If there are leftover teamNames that are impossible, clean them up.
					if (eachTeam.upperNode.teamName !== eachTeam.teamName && 
						eachTeam.upperNode.teamName !== versusTeam.teamName && 
						eachTeam.upperNode.teamName !== "") 
						{
						console.log("	--- Clearing upperNodes of " + eachTeam.upperNode.teamName + " from " + eachTeam.upperNode.gameLocation + "[" + eachTeam.upperNode.gameIndex + "]");
						let clearTarget = eachTeam.upperNode.teamName;
						let clearTeam = eachTeam.upperNode;
						clearTeam.teamName = "";
						traverseWithTeam(clearTeam, clearTarget);
						console.log("	--- Returning from Clearing upperNodes");
					}
					
					if (eachTeam.loserNode) {
						//console.log("	- Checking loserNode " + eachTeam.loserNode.gameLocation + "[" + eachTeam.loserNode.gameIndex + "] need clear");
						// If there are leftover teamNames that are impossible, clean them up.
						if (eachTeam.loserNode.teamName !== eachTeam.teamName && 
							eachTeam.loserNode.teamName !== versusTeam.teamName && 
							eachTeam.loserNode.teamName !== "") 
							{
							console.log("	--- Clearing loserNodes of " + eachTeam.loserNode.teamName + " from " + eachTeam.loserNode.gameLocation + "[" + eachTeam.loserNode.gameIndex + "]");
							let clearTarget = eachTeam.loserNode.teamName;
							let clearTeam = eachTeam.loserNode;
							clearTeam.teamName = "";
							traverseWithTeam(clearTeam, clearTarget);
							console.log("	--- Returning from Clearing upperNodes");
						} 
					}
				}

				if (eachTeam.upperNode) {
					//console.log("	- Checking upperNode data");
					// Move forward if upperNode is current Team, no changes needed.
					if (eachTeam.upperNode.teamName === eachTeam.teamName) {
					eachTeam = eachTeam.upperNode;
					continue;
					}

					if (eachTeam.loserNode) {
						//console.log("	- Checking loserNode data");
						// Move forward if loserNode is current Team, no change needed.
						if (eachTeam.loserNode.teamName === eachTeam.teamName) {
						eachTeam = eachTeam.loserNode;
						continue;
						  // if opposing team lost (located in loserNode), then automatically update upper node with this team.
						} else if (eachTeam.loserNode.teamName === versusTeam.teamName && versusTeam.teamName !== "") {
							console.log("	*Automatically fill " + eachTeam.upperNode.gameLocation + "[" + eachTeam.upperNode.gameIndex + "] with " + eachTeam.teamName + " because opposing team lost");
							eachTeam.upperNode.teamName = eachTeam.teamName;
							eachTeam = eachTeam.upperNode;
							continue;
						  // if opposing team won (located in upperNode), then automatically update loser node with this team.
						} else if (eachTeam.upperNode.teamName === versusTeam.teamName && versusTeam.teamName !== "") {
							console.log("	*Automatically fill " + eachTeam.loserNode.gameLocation + "[" + eachTeam.loserNode.gameIndex + "] with " + eachTeam.teamName + " because opposing team won");
							eachTeam.loserNode.teamName = eachTeam.teamName;
							eachTeam = eachTeam.loserNode;
							continue;
						}
					}
				}
				// If the 'if' statements did not 'continue' the while loop, no other changes needed for this team set.
				break;
			}
		}
	}
}