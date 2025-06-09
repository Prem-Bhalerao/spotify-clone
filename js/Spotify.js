console.log("Hello World");

let currentSong = new Audio();
let songs;
let currFolder;

const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:3000/${folder}/`);
    let response = await a.text();
    console.log("Server response for songs:", response);
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    let songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.includes(".mp3")) {
            songs.push(decodeURIComponent(element.href.split(`/${folder}/`)[1]));
        }
    }
    console.log("Parsed songs:", songs);
    return songs;
}

const playMusic = (track, pause = false) => {
    if (!pause) {
        try {
            const encodedTrack = encodeURIComponent(track.trim());
            currentSong.src = `/${currFolder}/${encodedTrack}`;
            console.log(`Playing: ${currentSong.src}`);
            currentSong.play();
        } catch (error) {
            console.error("Error playing track:", error);
        }
    }
    document.querySelector(".song-info1").innerHTML = decodeURIComponent(track);
    document.querySelector(".Songtime").innerHTML = "";
};

async function main() {
    // Initial song list
    songs = await getSongs("songs/cs");
    console.log("Songs fetched:", songs);
    if (songs.length > 0) {
        playMusic(songs[0], true);
        updateSongListUI();
    } else {
        console.log("No songs found in folder: songs/cs");
    }

    // Function to update the song list UI
    function updateSongListUI() {
        let songUL = document.querySelector(".songList ul");
        songUL.innerHTML = "";
        for (const song of songs) {
            songUL.innerHTML += `
                <li class="song">
                    <div class="song-info">
                        <span class="song-name">${decodeURIComponent(song)}</span>
                        <span class="song-artist">Prem</span>
                    </div>
                    <button class="play-now"><img src="img/play.svg" alt="play"></button>
                </li>`;
        }

        Array.from(songUL.getElementsByTagName("li")).forEach(e => {
            e.addEventListener("click", element => {
                const songName = e.querySelector(".song-info .song-name").innerHTML.trim();
                console.log(songName);
                playMusic(songName);
                const playButton = document.querySelector("#Play");
                const playIcon = playButton.querySelector("img");
                playIcon.src = "img/pause.svg";
            });
        });
    }

    // Play/Pause Button
    const playButton = document.querySelector("#Play");
    const playIcon = playButton.querySelector("img");

    playButton.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            playIcon.src = "img/pause.svg";
        } else {
            currentSong.pause();
            playIcon.src = "img/play.svg";
        }
    });

    // Time Update and Progress Bar
    currentSong.addEventListener("timeupdate", () => {
        const currentTime = currentSong.currentTime;
        const duration = currentSong.duration;

        if (!isNaN(duration) && duration > 0) {
            const progressPercentage = (currentTime / duration) * 100;
            document.querySelector(".progress").style.width = `${progressPercentage}%`;
            document.querySelector(".progress-circle").style.left = `${progressPercentage}%`;
        }

        const formattedCurrentTime = formatTime(currentTime);
        const formattedDuration = formatTime(duration || 0);
        document.querySelector(".time").innerHTML = `${formattedCurrentTime}`;
        document.querySelector(".Songtime").innerHTML = `${formattedDuration}`;
    });

    document.querySelector(".progress-bar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".progress-circle").style.left = `${percent}%`;
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    // Hamburger Menu
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%";
    });

    // Previous and Next Buttons
    const previous = document.querySelector("#Previous");
    const next = document.querySelector("#Next");

    const getCurrentSongIndex = () => {
        const currentSongName = decodeURIComponent(currentSong.src.split("/").slice(-1)[0]);
        return songs.indexOf(currentSongName);
    };

    previous.addEventListener("click", () => {
        console.log("Previous clicked");
        const index = getCurrentSongIndex();
        if (index > 0) {
            playMusic(songs[index - 1]);
            const playButton = document.querySelector("#Play");
            const playIcon = playButton.querySelector("img");
            playIcon.src = "img/pause.svg";
        }
    });

    next.addEventListener("click", () => {
        console.log("Next clicked");
        const index = getCurrentSongIndex();
        if (index < songs.length - 1 && index !== -1) {
            playMusic(songs[index + 1]);
            const playButton = document.querySelector("#Play");
            const playIcon = playButton.querySelector("img");
            playIcon.src = "img/pause.svg";
        }
    });

    // Volume Controls
    const volumeSlider = document.querySelector(".range input[type='range']");
    const volumeIcon = document.querySelector(".volume img");

    if (volumeSlider) {
        volumeSlider.addEventListener("input", (e) => {
            const volumeValue = e.target.value;
            console.log("Volume changed to:", volumeValue, "/100");
            currentSong.volume = volumeValue / 100;
            if (volumeValue == 0) {
                volumeIcon.src = "img/mute.svg";
            } else {
                volumeIcon.src = "img/volume.svg";
            }
        });
    } else {
        console.log("Volume slider not found");
    }

    if (volumeIcon) {
        volumeIcon.addEventListener("click", () => {
            if (currentSong.volume > 0) {
                currentSong.volume = 0;
                volumeSlider.value = 0;
                volumeIcon.src = "img/mute.svg";
            } else {
                currentSong.volume = 0.5;
                volumeSlider.value = 50;
                volumeIcon.src = "img/volume.svg";
            }
        });
    } else {
        console.log("Volume icon not found");
    }

    // Fetch and display albums dynamically
    async function displayAlbums() {
        console.log("Displaying albums");
        let a = await fetch(`http://127.0.0.1:3000/songs/`);
        let response = await a.text();
        console.log("Albums response:", response);
        let div = document.createElement("div");
        div.innerHTML = response;
        let anchors = div.getElementsByTagName("a");
        let cardContainer = document.querySelector(".cardContainer");
        let array = Array.from(anchors);

        for (let index = 0; index < array.length; index++) {
            const e = array[index];
            if (e.href.includes("/songs/") && !e.href.includes(".htaccess")) {
                let folder = e.href.split("/").slice(-2)[0];
                try {
                    let infoFetch = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
                    let info = await infoFetch.json();
                    cardContainer.innerHTML += `
                        <div class="card" data-folder="${folder}">
                            <div class="image-container">
                                <img src="http://127.0.0.1:3000/songs/${folder}/cover.jpg" alt="${info.title}">
                                <div class="play-button">
                                    <svg viewBox="0 0 24 24">
                                        <path d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"></path>
                                    </svg>
                                </div>
                            </div>
                            <div class="song-info">
                                <h3>${info.title}</h3>
                                <p>${info.description}</p>
                            </div>
                        </div>`;
                } catch (error) {
                    console.error(`Error fetching info for ${folder}:`, error);
                }
            }
        }

        // Attach click events to newly created cards
        Array.from(cardContainer.getElementsByClassName("card")).forEach(e => {
            e.addEventListener("click", async item => {
                const folder = item.currentTarget.dataset.folder;
                console.log("Card clicked, loading folder:", folder);
                songs = await getSongs(`songs/${folder}`);
                if (songs.length > 0) {
                    updateSongListUI();
                    playMusic(songs[0], true);
                } else {
                    console.log(`No songs found in folder: songs/${folder}`);
                }
            });
        });
    }

    // Call displayAlbums to load albums on page load
    await displayAlbums();
}

main();