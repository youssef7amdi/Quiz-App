// Select Data
const startPage = document.getElementById("start-test"),
  nameInput = document.getElementById("get-name"),
  testCategory = document.getElementById("test-category"),
  startTest = document.getElementById("start-btn"),
  numSpan = document.getElementById("num-span"),
  countdownSpan = document.getElementById("count-span"),
  quizBullets = document.getElementById("quiz-bullets");

let theName,
  theCategory,
  rightAnswers = 0,
  wrongAnswers = 0;

window.onload = function () {
  nameInput.focus();
};
// Start Page
startTest.addEventListener("click", function () {
  if (nameInput.value.trim() === "") {
    nameInput.value = "";
    nameInput.focus();
  } else {
    theName = nameInput.value;
    theCategory = testCategory.value;
    document.querySelector(".category span").textContent = theCategory;
    fetchQuestionsCount(theCategory);
    countDown(
      document.getElementById("minutes"),
      document.getElementById("seconds")
    );
    fetchQuestions(theCategory);

    startPage.style.display = "none";
  }
});

// function fetch
function fetchQuestionsCount(category) {
  fetch(`/json/${category.toLowerCase()}.json`)
    .then((result) => {
      let myData = result.json();
      return myData;
    })
    .then((fullData) => {
      numSpan.textContent = fullData.length;
      return fullData.length;
    })
    .then((count) => {
      quizBullets.innerHTML = "";
      for (let i = 0; i < count; i++) {
        const bullet = document.createElement("span");
        bullet.className = "bullet";
        bullet.textContent = i + 1;
        quizBullets.appendChild(bullet);
      }
    });
}

// countDown Function
function countDown(minutes, seconds) {
  minutes.innerHTML = 1;
  seconds.innerHTML = "00";
  if (seconds.parentElement.classList.contains("near"))
    seconds.parentElement.classList.remove("near");
  let myFunction = setInterval(() => {
    if (minutes.innerHTML > 0) {
      minutes.innerHTML--;
      seconds.innerHTML = 59;
    } else {
      seconds.innerHTML--;
      if (seconds.innerHTML === "10")
        seconds.parentElement.classList.add("near");
      if (seconds.innerHTML < 10) seconds.innerHTML = "0" + seconds.innerHTML;
      if (seconds.innerHTML === "00") {
        clearInterval(myFunction);
        submit.click();
        countDown(minutes, seconds);
      }
    }
  }, 1000);
}

// select quiz area and answers
const questionTitle = document.getElementById("quiz-area"),
  questionAnswersArea = document.getElementById("answers-area");

// fetch Questions function;
let currentQuestionIndex = 0;
function fetchQuestions(category) {
  fetch(`/json/${category.toLowerCase()}.json`)
    .then((result) => {
      let myData = result.json();
      return myData;
    })
    .then((myQuestions) => {
      shuffle(myQuestions);
      addQuestionTitle(myQuestions, currentQuestionIndex);
      addQuestionAnswer(myQuestions, currentQuestionIndex);
      addActiveToBullets([...quizBullets.children], currentQuestionIndex);

      return myQuestions;
    })
    .then((myQuestions) => {
      submitFunction(myQuestions, currentQuestionIndex);
    });
}

// function add question title
function addQuestionTitle(arr, index) {
  questionTitle.innerHTML = "";
  let span = document.createElement("span");
  span.innerHTML = `Q<sub>${index + 1}</sub>.`;
  let questionSpan = document.createElement("span");
  questionSpan.innerText = ` ${arr[index].title}`;
  questionTitle.appendChild(span);
  questionTitle.appendChild(questionSpan);
}

// function add Question answer
function addQuestionAnswer(arr, index) {
  questionAnswersArea.innerHTML = "";
  let length = Object.keys(arr[index]).length - 2;
  let array = [];
  for (let i = 1; i <= length; i++) {
    let answerDiv = document.createElement("div");
    answerDiv.className = "answer";
    answerDiv.setAttribute("id", "answer");
    let toggle = document.createElement("span");
    toggle.className = "toggle";
    toggle.id = "toggle";
    answerDiv.innerText = `${arr[index][Object.keys(arr[index])[i]]}`;
    answerDiv.prepend(toggle);
    array.push(answerDiv);
    shuffle(array);
    array.forEach((el) => questionAnswersArea.appendChild(el));
  }
}
// function add class active
addClassActive();
function addClassActive() {
  document.addEventListener("click", (el) => {
    if (el.target.classList.contains("answer")) {
      removeClassActive(Array.from(el.target.parentElement.children));
      el.target.classList.add("active");
    }
  });
}
function removeClassActive(arr) {
  arr.forEach((el) => el.classList.remove("active"));
}

// function check answer
// let questionstatus = false;
function checkAnswer(answersParent, arr, index) {
  let activeElement = [...answersParent.children].filter((el) =>
    el.classList.contains("active")
  )[0];
  console.log(activeElement);
  if (activeElement === undefined) {
    wrongAnswers++;
  } else {
    if (activeElement.textContent === arr[index].right_answer) {
      rightAnswers++;
    } else {
      wrongAnswers++;
    }
  }
  console.log(wrongAnswers);
  console.log(rightAnswers);
}

let submit = document.getElementById("submit-button");
function submitFunction(arr, index) {
  submit.addEventListener("click", function () {
    if (!submit.classList.contains("finish-test")) {
      checkAnswer(questionAnswersArea, arr, index);
      index++;
      addQuestionTitle(arr, index);
      addQuestionAnswer(arr, index);
      addActiveToBullets([...quizBullets.children], index);
      document.getElementById("minutes").innerHTML = 1;
      document.getElementById("seconds").innerHTML = "00";
      if (
        document
          .getElementById("seconds")
          .parentElement.classList.contains("near")
      )
        document
          .getElementById("seconds")
          .parentElement.classList.remove("near");
      if (index === arr.length - 1) {
        submit.innerHTML = "Finish Test";
        submit.classList.add("finish-test");
      }
    } else {
      checkAnswer(questionAnswersArea, arr, index);
      let percentage = ((rightAnswers / arr.length) * 100).toFixed(2);
      finishingPage(percentage, rightAnswers);
    }
  });
}

function finishingPage(percentage, rightCount) {
  let finishingDiv = document.createElement("div");
  finishingDiv.className = "finishing-page";
  let container = document.createElement("div");
  container.className = "container";
  let resultSpan = document.createElement("span");
  resultSpan.className = "result";
  if (percentage < 60) {
    container.classList.add("failed");
    resultSpan.innerText = "Failed";
  } else if (percentage >= 60 && percentage < 75) {
    container.classList.add("good");
    resultSpan.innerHTML = "Good!";
  } else if (percentage >= 75 && percentage < 90) {
    resultSpan.innerHTML = "Very Good!";
    container.classList.add("very-good");
  } else {
    resultSpan.innerHTML = "Excellent!";
    container.classList.add("excellent");
  }
  let textSpan = document.createElement("span");
  textSpan.className = "text";
  textSpan.innerHTML = `You Succes in <span>${rightCount}</span> Questions.`;
  let retestBtn = document.createElement("button");
  retestBtn.innerHTML = "ReTest";
  retestBtn.className = "retest-btn";
  container.appendChild(resultSpan);
  container.appendChild(textSpan);
  container.appendChild(retestBtn);
  finishingDiv.appendChild(container);
  document.body.appendChild(finishingDiv);
}

// retest click
document.addEventListener("click", function (e) {
  if (e.target.classList.contains("retest-btn")) window.location.reload();
});
// function add Class Active to bullets
function addActiveToBullets(arr, index) {
  arr[index].classList.add("active");
}
// shuffling
function shuffle(array) {
  // Settings Vars
  let current = array.length,
    temp,
    random;

  while (current > 0) {
    // Get Random Number
    random = Math.floor(Math.random() * current);
    current--;
    // [1] Save Current Element in Stash
    temp = array[current];

    // [2] Current Element = Random Element
    array[current] = array[random];

    // [3] Random Element = Get Element From Stash
    array[random] = temp;
  }
}

// may be needed
// let answersArr = [];
// for (key in myQuestions[currentQuestionIndex]) {
//   if (myQuestions[currentQuestionIndex].hasOwnProperty(key)) {
//     let value = myQuestions[currentQuestionIndex][key];

//     let answer = {
//       [key]: value,
//     };
//     answersArr.push(answer);
//   }
// }
// shuffle(answersArr)
// console.log(answersArr);
