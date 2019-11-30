
// Get the video player
const video = $(".my-player").get(0);

let mouseDownOnVolumnRange = false;
let mouseDownOnProgressBar = false;

let cachedVolume = "1";
let videoStarted = false;

const animationTime = 1000;

// Driver code
$( function() {
  // DOM Ready - do your stuff

  // We don't know the aspect ratio of the video being played.
  // So, we're adjusting the outer container's dimentions dynamically.
  adjustVideoContainerSize();

  // Hook click events on all the controls
  $(".my-player").click(playPause);
  $(".playPause").click(playPause);
  $(".backward").click(backward);
  $(".forward").click(forward);
  $(".theater").click(theater);
  $(".expand").click(expand);

  // Volumn related events
  $(".volume").click(volumeButtonClick);
  $(".volume-range").click(volumeRangeClick);

  $(".volume-range").mousedown( () => mouseDownOnVolumnRange = true);
  $(".volume-range").mouseup( () => mouseDownOnVolumnRange = false);
  $(".volume-range").mouseout( () => mouseDownOnVolumnRange = false);
  $(".volume-range").mousemove(volumnRangeMouseMove);

  // To give a sliding effect on the volumn range
  $(".volume").hover(() => $(".range-field ").addClass("my-display"));
  $(".options").mouseleave(() => $(".range-field ").removeClass("my-display"));

  // To change states related play pause (like play pause button icons, the hightlighter).
  // The video can also be stopped from other places
  // (like browser does it sometimes when a pop up appears on the screen or an alert etc.)
  // So, we can't just rely on the click events on our controls to do the same.
  $(".my-player").on("play", updatePlayPauseStates);
  $(".my-player").on("pause", updatePlayPauseStates);
  $(".my-player").on("canplay", initializeTimeProgress);

  // Progress related events
  $(".my-player").on("timeupdate", updateVideoProgress);
  $(".progress-bar-container").on("click", updateVideoProgressToNewPosition);

  $(".progress-bar-container").mousedown( () => mouseDownOnProgressBar = true);
  $(".progress-bar-container").mouseup( () => mouseDownOnProgressBar = false);
  $(".progress-bar-container").mousemove(progressBarMouseMove);

  // Controls hide and seek
  $(".my-player").mouseenter( _ => $(".my-controls").removeClass("squeeze") );
  $(".my-player").mouseleave( _ => $(".my-controls").addClass("squeeze") );
  $(".my-controls").mouseenter( _ => $(".my-controls").removeClass("squeeze") );
  $(".my-controls").mouseleave( _ => $(".my-controls").addClass("squeeze") );

  // Hide the highlighter in the beginning.
  $(".my-play-pause-highlighter").hide();

  // To play and pause the video on space key.
  $(window).keyup((e) => (e.keyCode === 32) ? playPause() : "");
} );

// To adjust parent container as per video dimentions
function adjustVideoContainerSize() {

  // This is a jQuery object.
  const video = $(".my-player");

  const ht = video.height();
  const wd = video.width();

  $(".video-container").css("width", wd);
  $(".video-container").css("height", ht);
}

// Toggle Play and Pause features
function playPause() {
  if (video.paused === false) {
    video.pause();
  }
  else {
    video.play();
    cachedVolume = video.volume;
  }
}

function updatePlayPauseStates() {
  if (video.paused) {
    // Update the icon on the play-pause button.
    $(".playPause").html('<i class="fas fa-play">');

    // Show/Hide the controls tab.
    $(".my-controls").removeClass("play");

    $(".my-play-pause-highlighter").removeClass("my-zoom-out");
    $(".my-play-pause-highlighter").show();
    $(".my-play-pause-text").html('<i class="fas fa-pause">');
    $(".my-play-pause-highlighter").fadeOut(800);
    $(".my-play-pause-highlighter").addClass("my-zoom-out");
  }
  else {
    // Update the icon on the play-pause button.
    $(".playPause").html('<i class="fas fa-pause"></i>');

    // Show/Hide the controls tab.
    $(".my-controls").addClass("play");

    $(".my-play-pause-highlighter").removeClass("my-zoom-out");
    $(".my-play-pause-highlighter").show();
    $(".my-play-pause-text").html('<i class="fas fa-play">');
    $(".my-play-pause-highlighter").fadeOut(800);
    $(".my-play-pause-highlighter").addClass("my-zoom-out");
  }
}

// Handle backward and forward features
function backward() {
  video.currentTime -= parseFloat(10);
}

function forward() {
  video.currentTime += parseFloat(20);
}

function theater() {
  console.log(this);
}

function expand() {
  console.log(this);
}

// Volumn controls

function volumeButtonClick() {
  if (video.volume > 0) {
    video.volume = "0";
  }
  else {
    video.volume = cachedVolume;
  }

  // Update the slider value.
  $(".volume-range").val(video.volume);

  // Update the volumn button icon
  adjustVolumnButtonIcon(video.volume);
}

function volumeRangeClick() {
  video.volume = this.value;
  cachedVolume = this.value;
  adjustVolumnButtonIcon(this.value);
}

function volumnRangeMouseMove() {
  if(mouseDownOnVolumnRange === false)  return;  // Not to be entertained

  video.volume = this.value;
  cachedVolume = this.value;

  adjustVolumnButtonIcon(this.value);
}

function adjustVolumnButtonIcon(volumnRange) {
  if (volumnRange == 0) {
    $(".volume").html('<i class="fas fa-volume-mute"></i>');
  }
  else if (volumnRange <= 0.5) {
    $(".volume").html('<i class="fas fa-volume-down"></i>');
  }
  else {
    $(".volume").html('<i class="fas fa-volume-up">');
  }
}

function updateVideoProgress() {
  const progressPercentage = (video.currentTime / video.duration) * 100;
  $(".progress-bar").css("width", `${progressPercentage}%`);

  updateTimeProgress(video.currentTime, video.duration);
}

function updateVideoProgressToNewPosition(e) {
  // We're finding out what is the percentage width is,
  // and we're readjusting our current time to that much percent of the duration.
  video.currentTime = (e.offsetX / this.offsetWidth) * video.duration;
}

function progressBarMouseMove(e) {
  if (!mouseDownOnProgressBar) return;  // Do not entertain when mouse is not down.

  video.currentTime = (e.offsetX / this.offsetWidth) * video.duration;
}

// Time progress related functions
function initializeTimeProgress() {
  if (videoStarted)  return;  // Do not do anything after the video has started.

  updateTimeProgress(0, video.duration);
  videoStarted = true;
}

function updateTimeProgress(currentTime, duration) {

  const timeProgress = makeDisplayTimeString(Math.floor(currentTime))
                      + " / "
                      + makeDisplayTimeString(Math.floor(duration));

  $(".time-progress").text(timeProgress);
}

function makeDisplayTimeString(time) {
  const mins = Math.floor(time / 60);
  const rem = time % 60;
  return `${mins}:${rem < 10 ? "0" : ""}${rem}`;
}
