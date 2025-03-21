let stories = [
  {
    image: "https://picsum.photos/id/1011/360/640",
    text: "Adventure Awaits!",
    timestamp: Date.now(),
  },
  {
    image: "https://picsum.photos/id/1018/360/640",
    text: "Enjoying the Beach",
    timestamp: Date.now(),
  },
  {
    image: "https://picsum.photos/id/1025/360/640",
    text: "Time with Pets",
    timestamp: Date.now(),
  },
];

let currentStory = 0;
let storyDuration = 5000;
let timer;
let progressFills = [];

const container = document.querySelector("#container");
const content = document.querySelector("#content");
const progressBars = document.querySelector("#progressBars");
const prevButton = document.querySelector("#prevButton");
const nextButton = document.querySelector("#nextButton");
const uploadButton = document.querySelector("#uploadButton");
const fileInput = document.querySelector("#fileInput");

function loadLocalStories() {
  let localStories = JSON.parse(localStorage.getItem("userStories")) || [];
  const now = Date.now();

  localStories = localStories.filter(
    (story) => now - story.timestamp < 24 * 60 + 60 * 1000
  );

  localStorage.setItem("userStories", JSON.stringify(localStories));

  return localStories;
}

function mergeStories() {
  const userStories = loadLocalStories();
  stories = [
    ...userStories,
    ...stories.filter((story) => !story.userUploaded), // Don't duplicate local stories
  ];
}

function renderProgressBars() {
  progressBars.innerHTML = "";
  progressFills = [];

  stories.forEach((_, index) => {
    const bar = document.createElement("div");
    bar.classList.add("progress-bar");

    const fill = document.createElement("div");
    fill.classList.add("progress-bar-fill");

    if (index < currentStory) {
      fill.style.width = "100%";
    }

    bar.appendChild(fill);
    progressBars.appendChild(bar);
    progressFills.push(fill);
  });
}

fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.onload = function (event) {
    const base64Image = event.target.result;

    const newStory = {
      image: base64Image,
      text: "Your Story",
      timestamp: Date.now(),
      userUploaded: true,
    };

    let localStories = JSON.parse(localStorage.getItem("userStories")) || [];
    localStories.unshift(newStory); // Add at the beginning
    localStorage.setItem("userStories", JSON.stringify(localStories));

    mergeStories();
    showStory(0); // Show the new story immediately
  };

  reader.readAsDataURL(file);
});

function showStory(index) {
  mergeStories();
  if (stories.length === 0) {
    content.innerHTML = `<h2>Story not available</h2>`;
    return;
  }

  currentStory = index;
  if (currentStory >= stories.length) currentStory = 0;
  if (currentStory < 0) currentStory = stories.length - 1;

  const story = stories[currentStory];
  content.style.background = `url(${story.image})`;
  content.innerHTML = `<h2>${story.text}</h2>`;
  renderProgressBars();
  startProgressAnimation();
}

function storyProgressAnimation() {
  progressFills[
    currentStory
  ].style.transition = `width ${storyDuration}ms linear`;
  progressFills[currentStory].style.width = "100%";

  clearTimeout(timer);
  timer = setTimeout(() => nextStory(), storyDuration);
}

function prevStory() {
  currentStory--;
  if (currentStory < 0) {
    currentStory = stories.length - 1;
  }
  showStory(currentStory);
}

function nextStory() {
  currentStory++;
  if (currentStory >= stories.length) {
    currentStory = 0;
  }
  showStory(currentStory);
}

prevButton.addEventListener("click", () => {
  clearTimeout(timer);
  prevStory();
});

nextButton.addEventListener("click", () => {
  clearTimeout(timer);
  nextStory();
});

uploadButton.addEventListener("click", () => fileInput.click());

container.addEventListener("mouseover", () => clearTimeout(timer));
container.addEventListener("mouseout", () => startProgressAnimation());

mergeStories();
showStory(currentStory);
