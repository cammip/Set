"use strict";
(function() {
  // Represents the timer for the current game
  let timerId;

  // Represents the time in seconds left in the current game
  let remainingSeconds;

  const STYLE = ["solid", "outline", "striped"];
  const COLOR = ["green", "purple", "red"];
  const SHAPE = ["diamond", "oval", "squiggle"];
  const COUNT = [1, 2, 3];

  window.addEventListener("load", init);

  /**
   * Initializes and adds event listeners
   */
  function init() {
    let start = document.querySelector("#start-btn");
    let back = document.querySelector("#back-btn");
    let refresh = document.getElementById("refresh-btn");
    let isEasy;

    start.addEventListener("click", () => {
      toggleViews();

      isEasy = findDifficulty();

      document.getElementById("set-count").textContent = "0";

      startTimer();
      createGame(isEasy);

      refresh.disabled = false;
    });

    back.addEventListener("click", () => {
      toggleViews();
      clearGame();
    });

    refresh.addEventListener("click", () => {
      clearBoard();
      createGame(isEasy);
    });
  }

  /**
   * This method finds if the user clicks easy
   * @returns {boolean} did the user select easy
   */
  function findDifficulty() {
    const radioButtons = document.getElementsByName('diff');
    let result;

    for (let i = 0; i < radioButtons.length; i++) {
      if (radioButtons[i].checked) {
        const selectedValue = radioButtons[i].value;

        if (selectedValue === "easy") {
          result = true;
        } else {
          result = false;
        }
      }
    }
    return result;
  }

  /**
   * Used to switch between the menu view and game view of the game
   */
  function toggleViews() {
    document.getElementById("menu-view").classList.toggle("hidden");
    document.getElementById("game-view").classList.toggle("hidden");
  }

  /**
   * This method initializes the game board
   * @param {boolean} isEasy - is the difficulty level set to easy
   */
  function createGame(isEasy) {
    let count;
    const easy = 9;
    const standard = 12;

    if (isEasy) {
      count = easy;
    } else {
      count = standard;
    }

    clearBoard();

    const board = document.getElementById('board');
    for (let i = 0; i < count; i++) {
      board.appendChild(generateUniqueCard(isEasy));
    }
  }

  /**
   * Resets the game by clearing the timer
   */
  function clearGame() {
    clearInterval(timerId);
    remainingSeconds = 0;
    document.getElementById("time").textContent = "00:00";
  }

  /**
   * This method clears the board of all cards
   */
  function clearBoard() {
    const board = document.getElementById('board');
    board.innerHTML = '';
  }

  /**
   * Generates a random number 0 to 2
   * @returns {number} a random number
   */
  function randomNum() {
    return Math.ceil(Math.random() * 3) - 1;
  }

  /**
   * Creates a randomly-generated array of string attributes in the form
   * For Easy difficulty, the "style" is fixed to "solid"
   * @param {boolean} isEasy - did the user select easy difficulty
   * @returns {Array} an array in the format [STYLE, SHAPE, COLOR, COUNT]
   */
  function generateRandomAttributes(isEasy) {
    let results = [];

    if (isEasy) {
      results[0] = "solid";
    } else {
      results[0] = STYLE[randomNum()];
    }

    results[1] = SHAPE[randomNum()];
    results[2] = COLOR[randomNum()];
    results[3] = COUNT[randomNum()];

    return results;
  }

  /**
   * Return a div element with COUNT number of img elements appended as children
   * @param {boolean} isEasy - did the user select easy difficulty
   * @returns {Element} a div that represents cards on the board
   */
  function generateUniqueCard(isEasy) {
    // Create a container for the new card
    let newCard = document.createElement("div");
    newCard.classList.add("card");

    newCard.addEventListener('click', cardSelected);

    // Get a new attribute for the card and look for duplicates
    let dupes = true;
    let newAttributes;
    let attributeString;
    let sliced;

    while (dupes) {
      newAttributes = generateRandomAttributes(isEasy);
      attributeString = newAttributes.join("-");
      sliced = attributeString.slice(0, -2);

      // Check if a card with the same ID already exists
      if (!document.getElementById(attributeString)) {
        dupes = false;
      }
    }

    // Set the ID of the card
    newCard.setAttribute("id", sliced);

    // Create new image(s)
    let imgCount = parseInt(newAttributes[3]);
    for (let j = 0; j < imgCount; j++) {
      let newImg = document.createElement("img");
      newImg.src = "img/" + sliced + ".png";
      newImg.alt = sliced + "-" + imgCount;
      newImg.setAttribute("id", sliced + "-" + imgCount);
      newCard.setAttribute("id", sliced + "-" + imgCount);

      newCard.append(newImg);
    }
    return newCard;
  }

  /**
   * Starts the timer for a new game. No return value.
   */
  function startTimer() {
    // Get time selected
    const drop = document.querySelector("select");
    const selectedOption = drop.options[drop.selectedIndex].value;

    // Set the remainingSeconds to the selected time value
    remainingSeconds = parseInt(selectedOption);

    // Call advanceTimer every second
    const interval = 1000;
    timerId = setInterval(advanceTimer, interval);

    document.getElementById("time").textContent = convertTime(remainingSeconds);
  }

  /**
   * Updates the game timer (module-global and #time shown on page) by 1 second.
   * No return value.
   */
  function advanceTimer() {
    remainingSeconds--;

    // Updates time left on the page displayed
    document.getElementById("time").textContent = convertTime(remainingSeconds);

    if (remainingSeconds <= 0) {
      clearGame();

      document.getElementById("refresh-btn").disabled = true;

      // Removes listener to cardSelected
      let cards = document.querySelectorAll('.card');
      cards.forEach(card => {
        card.removeEventListener('click', cardSelected);
      });

      // Removes selected class from cards
      cards.forEach(card => {
        card.classList.remove("selected");
      });
    }
  }

  /**
   * Returns a string containing the time of seconds to minutes
   * @param {number} timeLeft - how many seconds left
   * @returns {string} string representation of time left in minutes
   */
  function convertTime(timeLeft) {
    const seconds = 60;

    let mins = Math.floor(timeLeft / seconds);
    let secs = timeLeft % seconds;

    const tenthPlace = 10;
    if (secs < tenthPlace) {
      secs = "0" + secs;
    }

    return "0" + mins + ":" + secs;
  }

  /**
   * Used when a card is selected, checking how many cards are currently selected.
   * If 3 cards are selected, uses isASet (provided) to handle "correct" and "incorrect"
   * cases. No return value.
   */
  function cardSelected() {
    let selectedCards = [];
    const secsLeft = 1000;

    // Clicking on a card should toggle its .selected state
    this.classList.toggle("selected");

    selectedCards = document.querySelectorAll('.card.selected');

    // When three cards are .selected on the board, there are two possible cases
    if (selectedCards.length === 3) {

      // For both cases, the three selected cards should lose the .selected
      selectedCards.forEach(card => {
        card.classList.remove('selected');
      });

      if (isASet(selectedCards)) {
        let sets = parseInt(document.getElementById("set-count").textContent);

        // Number of sets found should be incremented
        document.getElementById("set-count").textContent = sets + 1;

        // Immediately replace the selected cards with a new unique cards
        let selectedCardIds = addIds(selectedCards);

        for (let i = 0; i < 3; i++) {

          // Gets the card container
          let currentCard = document.getElementById(selectedCardIds[i]);
          let newCard = generateUniqueCard(findDifficulty());
          currentCard.replaceWith(newCard);

          sendMessage(newCard, "SET!", secsLeft);
        }
      } else {
        let selectedCardIds = addIds(selectedCards);

        for (let i = 0; i < 3; i++) {
          let currCard = document.getElementById(selectedCardIds[i]);
          sendMessage(currCard, "Not a Set", secsLeft);
        }
      }
    }
  }

  /**
   * Adds all card ids
   * @param {Array} allCards - all selected cards
   * @returns {Array} of ids
   */
  function addIds(allCards) {
    let result = [];
    allCards.forEach(card => {
      result.push(card.id);
    });

    return result;
  }

  /**
   * Displays message
   * @param {Element} update - element updating
   * @param {string} msg - message
   * @param {int} secs - secondsLeft
   */
  function sendMessage(update, msg, secs) {
    update.classList.add('hide-imgs');
    let warning = document.createElement("p");
    warning.textContent = msg;
    update.appendChild(warning);

    setTimeout(() => {
      update.classList.remove('hide-imgs');
      update.removeChild(warning);
    }, secs);
  }

  /**
   * Checks to see if the three selected cards make up a valid set. This is done by comparing each
   * of the type of attribute against the other two cards. If each four attributes for each card are
   * either all the same or all different, then the cards make a set. If not, they do not make a set
   * @param {DOMList} selected - list of all selected cards to check if a set.
   * @return {boolean} true if valid set false otherwise.
   */
  function isASet(selected) {
    let attributes = [];
    for (let i = 0; i < selected.length; i++) {
      attributes.push(selected[i].id.split("-"));
    }
    for (let i = 0; i < attributes[0].length; i++) {
      let diff = attributes[0][i] !== attributes[1][i] &&
                attributes[1][i] !== attributes[2][i] &&
                attributes[0][i] !== attributes[2][i];
      let same = attributes[0][i] === attributes[1][i] &&
                    attributes[1][i] === attributes[2][i];
      if (!(same || diff)) {
        return false;
      }
    }
    return true;
  }
})();

