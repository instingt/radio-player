const { Howl, Howler } = require("howler");

const sound = new Howl({
  src: ["https://radio.nikonov.tech/stream"],
  html5: true,
  autoplay: true,
  onplay: play,
  onpause: pause,
});

const toggleButton = document.getElementById(
  "toggleButton",
) as HTMLButtonElement;
const trackTitle = document.getElementById("trackTitle") as HTMLHeadingElement;
const visualizer = document.querySelector(".visualizer") as HTMLElement;
let isPlaying = true;

// Определяем количество баров в зависимости от ширины экрана
let numberOfBars = Math.floor(window.innerWidth / 10); // Один бар на каждые 10 пикселей

const bars: HTMLElement[] = [];

// Функция для создания баров
function createBars() {
  bars.length = 0; // Очищаем массив баров
  visualizer.innerHTML = ""; // Очищаем визуализатор

  for (let i = 0; i < numberOfBars; i++) {
    const bar = document.createElement("div");
    bar.classList.add("bar");

    // Случайная задержка и длительность анимации
    const randomDelay = Math.random() * -1; // От -0s до -1s
    const randomDuration = 0.5 + Math.random() * 1; // От 0.5s до 1.5s

    bar.style.animationDelay = `${randomDelay}s`;
    bar.style.animationDuration = `${randomDuration}s`;

    visualizer.appendChild(bar);
    bars.push(bar);
  }
}

// Вызываем функцию создания баров при загрузке страницы
createBars();

// Пересоздаем бары при изменении размера окна для адаптивности
window.addEventListener("resize", () => {
  numberOfBars = Math.floor(window.innerWidth / 10);
  createBars();
});

toggleButton.addEventListener("click", () => {
  sound.playing() ? sound.pause() : sound.play();
});

function play() {
  toggleButton.textContent = "Pause";
  bars.forEach((bar) => {
    bar.style.animationPlayState = "running";
    bar.style.opacity = "1";
    bar.style.transform = "scaleY(1)";
  });
  trackTitle.style.color = "#fff"; // Возвращаем исходный цвет заголовка
}

function pause() {
  toggleButton.textContent = "Play";
  bars.forEach((bar) => {
    bar.style.animationPlayState = "paused";
    bar.style.opacity = "0.3";
    bar.style.transform = "scaleY(0.3)";
  });
  trackTitle.style.color = "#888"; // Затемняем заголовок
}

interface Track {
  title: string;
  trackId: string;
}
function patrceTrack(titleWithId: string): Track {
  const parts = titleWithId.trim().split(" ");
  const trackId = parts.pop()?.replace("[", "").replace("].mp3", "") ?? "";

  return {
    title: parts.join(" "),
    trackId,
  };
}

function updateTrackInfo() {
  fetch("https://radio.nikonov.tech/current", {
    mode: "cors",
  })
    .then((response) => response.text())
    .then((data) => {
      let track: Track = {
        title: "Я хуй знает кто ты",
        trackId: "dQw4w9WgXcQ",
      };
      if (data) {
        track = patrceTrack(data);
      }

      trackTitle.textContent = track.title + "\u00A0::\u00A0";

      const trackLink = document.createElement("a");
      trackLink.textContent = "YouTube";
      trackLink.href = `https://www.youtube.com/watch?v=${track.trackId}`;
      trackLink.target = "_blank";

      trackTitle.appendChild(trackLink);
    });
}

updateTrackInfo();
pause(); // stop animation
sound.play(); // start autoplay

// start pooling https://radio.nikonov.tech/current
setInterval(() => {
  updateTrackInfo();
}, 60 * 1000); // one minute
