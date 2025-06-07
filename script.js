function toggleSearch() {
    const searchContainer = document.getElementById('searchContainer');
    const searchBtn = document.querySelector('.search');

    if (!searchContainer.classList.contains('open')) {
        // Opening the search
        searchContainer.style.display = 'flex';

        // Add the open class after a tiny delay to trigger transition
        setTimeout(() => {
            searchContainer.classList.add('open');
        }, 5);

        // Hide search button with fade
        searchBtn.style.opacity = '0';
        setTimeout(() => {
            searchBtn.style.display = 'none';
        }, 150);

        // Focus on input after animation
        setTimeout(() => {
            searchContainer.querySelector('.search-input').focus();
        }, 100);
    } else {
        closeSearch();
    }
}

function closeSearch() {
    const searchContainer = document.getElementById('searchContainer');
    const searchBtn = document.querySelector('.search');

    // Remove open class to trigger closing animation
    searchContainer.classList.remove('open');

    // Show search button with fade in
    setTimeout(() => {
        searchBtn.style.display = 'flex';
        searchBtn.style.opacity = '1';
    }, 100);

    // Hide container after animation completes
    setTimeout(() => {
        searchContainer.style.display = 'none';
        // Clear the search input
        searchContainer.querySelector('.search-input').value = '';
    }, 250);
}

function handleSearch(event) {
    const searchTerm = event.target.value;

    if (event.key === 'Enter' && searchTerm.trim()) {
        console.log('Searching for:', searchTerm);
    }

    if (event.key === 'Escape') {
        closeSearch();
    }
}

console.log("lets write javascript")
let currentAudio = null;
let currentSongIndex = 0;
let allSongs = [];
let isDragging = false;
let isVolumeDragging = false; // ✅ Added volume dragging variable

async function getSongs() {
    try {
        let a = await fetch("http://127.0.0.1:5500/songs/")
        let response = await a.text();
        let hrefs = response.match(/href="[^"]*\.mp3"/g);

        if (hrefs) {
            // Convert to full HTTP URLs
            let songUrls = hrefs.map(href => {
                let path = href.replace('href="', '').replace('"', '');
                return path;
            });

            console.log("Found songs:", songUrls);
            return songUrls;
        } else {
            console.log("No .mp3 files found");
            return [];
        }
    } catch (error) {
        console.error("Error fetching songs:", error);
        return [];
    }
}

const playMusic = (fileName, pause = false) => {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }
    currentAudio = new Audio(fileName)
    currentAudio.volume = 0.7;
    console.log(fileName)
    if (!pause) {
        currentAudio.play();
    }
    fileName = decodeURIComponent(fileName);
    document.querySelector(".songinfo").innerHTML = fileName.split("mx-")[1]
    currentAudio.addEventListener('timeupdate', () => {
        const currentTime = currentAudio.currentTime;
        const duration = currentAudio.duration;

        document.querySelector('.time-display').textContent = formatTime(currentTime);

        // Update progress bar
        if (duration) {
            const progressPercent = (currentTime / duration) * 100;
            document.querySelector('.progress-fill').style.width = progressPercent + '%';
        }
    });
    currentAudio.addEventListener('loadedmetadata', () => {
        const duration = currentAudio.duration;
        document.querySelectorAll('.time-display')[1].textContent = formatTime(duration);
    });
}

function updateSeekPosition(e) {
    const progressTrack = document.querySelector(".progress-track");
    const rect = progressTrack.getBoundingClientRect();

    // Calculate position
    const clickX = e.clientX - rect.left;
    const trackWidth = progressTrack.offsetWidth;

    // Keep within bounds
    const boundedX = Math.max(0, Math.min(clickX, trackWidth));
    const clickPercent = (boundedX / trackWidth) * 100;
    const seekTime = (clickPercent / 100) * currentAudio.duration;

    // Update audio and visual
    currentAudio.currentTime = seekTime;
    document.querySelector('.progress-fill').style.width = clickPercent + '%';
}

// ✅ Added volume dragging function
function updateVolumePosition(e) {
    const volumeBar = document.querySelector(".volume-bar");
    const rect = volumeBar.getBoundingClientRect();

    // Calculate position
    const clickX = e.clientX - rect.left;
    const barWidth = volumeBar.offsetWidth;

    // Keep within bounds
    const boundedX = Math.max(0, Math.min(clickX, barWidth));
    const volumePercent = (boundedX / barWidth) * 100;
    const volumeLevel = volumePercent / 100;

    // Update audio volume
    if (currentAudio) {
        currentAudio.volume = volumeLevel;
    }

    // Update visual volume bar
    document.querySelector('.volume-fill').style.width = volumePercent + '%';
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function setVolume(e) {
    const volumeBar = document.querySelector(".volume-bar");
    const rect = volumeBar.getBoundingClientRect();

    const clickX = e.clientX - rect.left;
    const barWidth = volumeBar.offsetWidth;
    const volumePercent = (clickX / barWidth) * 100;

    // Set audio volume
    if (currentAudio) {
        currentAudio.volume = volumePercent / 100;
    }

    // Update visual bar
    document.querySelector('.volume-fill').style.width = volumePercent + '%';
}

async function main() {
    let currentSong;
    console.log("Starting main function...");

    let songs = await getSongs();
    allSongs = songs;
    playMusic(allSongs[0], true);
    let songUL = document.querySelector(".songlist ul");
    songUL.innerHTML = "";

    for (const song of songs) {
        if (typeof song !== "string") continue;
        let cleanSongName = song.replaceAll("%20", " ").replaceAll("%E2%80%93", "-").replaceAll(".mp3", "").split("mx-")[1];

        // Updated structure with left-section wrapper
        songUL.innerHTML = songUL.innerHTML + `
            <li data-song="${song}">
                <div class="left-section">
                    <img src="music.svg" alt="" class="invert">
                    <div class="info"> 
                        <div class="musicinfo">${cleanSongName}</div>
                        <div class="artist">Mohit</div>
                    </div>
                </div>
                <div class="playnow">
                    <span>Play Now</span>
                    <img src="playlist.svg" alt="" class="invert">
                </div>
            </li>`;
    }

    //an event lstner to each song
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            let songFileName = e.getAttribute("data-song");
            currentSongIndex = allSongs.indexOf(songFileName);
            playMusic(`http://127.0.0.1:5500/${songFileName}`);
        });
    });

    play.addEventListener("click", () => {
        if (currentAudio.paused) {
            currentAudio.play();
            document.getElementById("play").src = "pause.svg";
        } else {
            currentAudio.pause();
            document.getElementById("play").src = "playlist.svg";
        }
    });

    next.addEventListener("click", () => {
        currentSongIndex = (currentSongIndex + 1) % allSongs.length;
        playMusic(`http://127.0.0.1:5500/${allSongs[currentSongIndex]}`)
    });
    
    previous.addEventListener("click", () => {
        currentSongIndex = (currentSongIndex - 1 + allSongs.length) % allSongs.length;
        playMusic(`http://127.0.0.1:5500/${allSongs[currentSongIndex]}`)
    });

    const progressTrack = document.querySelector(".progress-track");

    // Start dragging
    progressTrack.addEventListener("mousedown", (e) => {
        if (!currentAudio || !currentAudio.duration) return;
        isDragging = true;
        updateSeekPosition(e);
    });

    // While dragging
    document.addEventListener("mousemove", (e) => {
        if (!isDragging && !isVolumeDragging) return;
        if (isDragging) updateSeekPosition(e);
        if (isVolumeDragging) updateVolumePosition(e); // ✅ Added volume dragging
    });

    // Stop dragging
    document.addEventListener("mouseup", () => {
        isDragging = false;
        isVolumeDragging = false; // ✅ Added volume dragging reset
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })
    
    // ✅ Fixed: Removed duplicate close listener
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })

    // Volume control - click
    document.querySelector(".volume-bar").addEventListener("click", setVolume);

    // ✅ Added volume dragging events
    const volumeBar = document.querySelector(".volume-bar");
    volumeBar.addEventListener("mousedown", (e) => {
        isVolumeDragging = true;
        updateVolumePosition(e);
    });
}

main()