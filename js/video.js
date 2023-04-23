function openYoutubeVideo() {
    document.getElementById('youtube-video-container').style.display= "block";
    document.getElementById('youtube-video-container').innerHTML = '<iframe id="youtube-video" width="100%" height="100%" src="https://www.youtube.com/embed/rDNqCv3TA1Y?autoplay=1&controls=0" allow="autoplay;"></iframe><img id="youtube-video-close-button" src="./icons/youtube-close-button.svg" onclick="closeYoutubeVideo()"style="position: absolute; top: 4%; left: 3%; z-index: 10000001; width: 5%; height: 5%;cursor: pointer;">'
    document.getElementById('youtube-video-container').style.display= "block";
}
function closeYoutubeVideo() {
    document.getElementById('youtube-video-container').style.display= "none";
    document.getElementById('youtube-video-container').innerHTML = '';
    document.getElementById('youtube-video-container').style.display= "none";
    document.getElementById('youtube-video-container').innerHTML = '';
}
