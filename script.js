// Seleção de elementos do DOM
const playPauseBtn = document.querySelector(".play-pause-btn");
const fullScreenBtn = document.querySelector(".full-screen-btn");
const muteBtn = document.querySelector(".mute-btn");
const currentTimeElem = document.querySelector(".current-time");
const totalTimeElem = document.querySelector(".total-time")
const controlsContainer = document.querySelector('.video-controls-container');
const thumbnailImg = document.querySelector(".thumbnail-img");
const volumeSlider = document.querySelector(".volume-slider");
const videoContainer = document.querySelector(".video-container");
const timelineContainer = document.querySelector(".timeline-container");
const video = document.querySelector("video");

// Obtendo elementos do DOM relacionados à navegação
const prevButton = document.getElementById('prev-button');
const nextButton = document.getElementById('next-button');
const randomButton = document.getElementById('random-button');
const loopButton = document.getElementById('loop-button');

// Mutáveis e Variáveis
let maxVideoIndex = 76;
let currentVideoIndex = 1;
let randomHistory = [];
let isLoopActive = false;
let isRandomActive = false; // Desative a reprodução aleatória por padrão
let videoQueue = [...Array(maxVideoIndex).keys()].map(i => i + 1);

// Função para gerar um índice aleatório entre min e max
function getRandomIndex(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Função para carregar um vídeo
function loadVideo(index) {
    video.src = `videos/video${index}.mp4`;
    video.load();
    video.play();
}

// Event Listener para o botão Anterior
prevButton.addEventListener('click', () => {
    if (isRandomActive) {
        if (randomHistory.length > 1) {
            randomHistory.pop(); // Remove o vídeo atual
            currentVideoIndex = randomHistory.pop(); // Obtém o vídeo anterior
            loadVideo(currentVideoIndex);
        }
    } else {
        if (currentVideoIndex > 1) {
            currentVideoIndex--;
            loadVideo(currentVideoIndex);
        }
    }
});

// Event Listener para o botão Próximo
nextButton.addEventListener('click', () => {
    if (isRandomActive) {
        getRandomVideo();
    } else {
        if (currentVideoIndex < maxVideoIndex) {
            currentVideoIndex++;
            loadVideo(currentVideoIndex);
        } else {
            // Se atingir o último vídeo, retorne ao primeiro
            currentVideoIndex = 1;
            loadVideo(currentVideoIndex);
        }
    }
});

// Event Listener para o botão Aleatório
randomButton.addEventListener('click', () => {
    isRandomActive = !isRandomActive; // Alterne entre aleatório ativado/desativado

    if (isRandomActive) {
        randomButton.classList.add('active-random');
    } else {
        randomButton.classList.remove('active-random');
    }
});

// Função para obter o próximo vídeo aleatório
function getRandomVideo() {
    if (videoQueue.length === 0) {
        videoQueue = [...Array(maxVideoIndex).keys()].map(i => i + 1);
    }

    const randomIndex = Math.floor(Math.random() * videoQueue.length);
    currentVideoIndex = videoQueue[randomIndex];
    videoQueue.splice(randomIndex, 1);

    // Adiciona o vídeo atual ao histórico
    randomHistory.push(currentVideoIndex);

    loadVideo(currentVideoIndex);
}

// Event Listener para o botão de Loop
loopButton.addEventListener('click', () => {
    isLoopActive = !isLoopActive;

    if (isLoopActive) {
        video.loop = true;
        loopButton.classList.add('active-loop');
    } else {
        video.loop = false;
        loopButton.classList.remove('active-loop');
    }
});

// Event Listener para o término do vídeo
video.addEventListener('ended', () => {
    if (isRandomActive) {
        getRandomVideo();
    } else {
        if (currentVideoIndex < maxVideoIndex) {
            currentVideoIndex++;
            loadVideo(currentVideoIndex);
        } else {
            // Se atingir o último vídeo, retorne ao primeiro
            currentVideoIndex = 1;
            loadVideo(currentVideoIndex);
        }
    }
});

// Carregar o vídeo inicial
loadVideo(currentVideoIndex);

// Event Listener para eventos de teclado
document.addEventListener("keydown", e => {
    const tagName = document.activeElement.tagName.toLowerCase()

    if (tagName === "input") return

    switch (e.key.toLowerCase()) {
        case " ":
            if (tagName === "button") return
        case "k":
            togglePlay()
            break
        case "f":
            toggleFullScreenMode()
            break
        case "m":
            toggleMute()
            break
        case "arrowleft":
        case "j":
            skip(-5)
            break
        case "arrowright":
        case "l":
            skip(5)
            break
    }
})

// Timeline
timelineContainer.addEventListener("mousemove", handleTimelineUpdate)
timelineContainer.addEventListener("mousedown", toggleScrubbing)
document.addEventListener("mouseup", e => {
  if (isScrubbing) toggleScrubbing(e)
})
document.addEventListener("mousemove", e => {
  if (isScrubbing) handleTimelineUpdate(e)
})

let isScrubbing = false
let wasPaused
function toggleScrubbing(e) {
  const rect = timelineContainer.getBoundingClientRect()
  const percent = Math.min(Math.max(0, e.x - rect.x), rect.width) / rect.width
  isScrubbing = (e.buttons & 1) === 1
  videoContainer.classList.toggle("scrubbing", isScrubbing)
  if (isScrubbing) {
    wasPaused = video.paused
    video.pause()
  } else {
    video.currentTime = percent * video.duration
    if (!wasPaused) video.play()
  }

  handleTimelineUpdate(e)
}

function handleTimelineUpdate(e) {
  const rect = timelineContainer.getBoundingClientRect()
  const percent = Math.min(Math.max(0, e.x - rect.x), rect.width) / rect.width

  if (isScrubbing) {
    e.preventDefault()
    timelineContainer.style.setProperty("--progress-position", percent)
  }
}

// Duration
video.addEventListener("loadeddata", () => {
    totalTimeElem.textContent = formatDuration(video.duration)
  })
  
  video.addEventListener("timeupdate", () => {
    currentTimeElem.textContent = formatDuration(video.currentTime)
    const percent = video.currentTime / video.duration
    timelineContainer.style.setProperty("--progress-position", percent)
  })
  
  const leadingZeroFormatter = new Intl.NumberFormat(undefined, {
    minimumIntegerDigits: 2,
  })
  function formatDuration(time) {
    const seconds = Math.floor(time % 60)
    const minutes = Math.floor(time / 60) % 60
    const hours = Math.floor(time / 3600)
    if (hours === 0) {
      return `${minutes}:${leadingZeroFormatter.format(seconds)}`
    } else {
      return `${hours}:${leadingZeroFormatter.format(
        minutes
      )}:${leadingZeroFormatter.format(seconds)}`
    }
  }
  
  function skip(duration) {
    video.currentTime += duration
  }

// Volume
muteBtn.addEventListener("click", toggleMute)
volumeSlider.addEventListener("input", e => {
    video.volume = e.target.value
    video.muted = e.target.value === 0
})

function toggleMute() {
    video.muted = !video.muted
}

video.addEventListener("volumechange", () => {
    volumeSlider.value = video.volume
    let volumeLevel
    if (video.muted || video.volume === 0) {
        volumeSlider.value = 0
        volumeLevel = "muted"
    } else if (video.volume >= 0.5) {
        volumeLevel = "high"
    } else {
        volumeLevel = "low"
    }

    videoContainer.dataset.volumeLevel = volumeLevel
})

// Modos de visualização
fullScreenBtn.addEventListener("click", toggleFullScreenMode)

function toggleFullScreenMode() {
    if (document.fullscreenElement == null) {
        videoContainer.requestFullscreen()
        controlsContainer.classList.add('fullscreen')
    } else {
        document.exitFullscreen()
        controlsContainer.classList.remove('fullscreen')
    }
}

document.addEventListener("fullscreenchange", () => {
    videoContainer.classList.toggle("full-screen", document.fullscreenElement)
})

// Play/Pause
playPauseBtn.addEventListener("click", togglePlay)
video.addEventListener("click", togglePlay)

function togglePlay() {
    video.paused ? video.play() : video.pause()
}

video.addEventListener("play", () => {
    videoContainer.classList.remove("paused")
})

video.addEventListener("pause", () => {
    videoContainer.classList.add("paused")
})