const CLIENT_ID = '137278254979-sps8vg6jcado2do3s1hfn1jvj1vrcdri.apps.googleusercontent.com';
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest'];
const SCOPES = 'https://www.googleapis.com/auth/youtube.readonly';

const authorizeButton = document.getElementById('authorize-button');
const signoutButton = document.getElementById('signout-button');
const content = document.getElementById('content');
const channelForm = document.getElementById('channel-form');
const channelInput = document.getElementById('channel-input');
const videoContainer = document.getElementById('video-container');

const defaultChannel = 'techguyweb';

function handleClientLoad(){
    gapi.load('client:auth2', initClient);
}

channelForm.addEventListener('submit', e => {
    e.preventDefault();

    const channel = channelInput.nodeValue;

    getChannel(channel);
})

function initClient() {
    gapi.client.init({
        apiKey: 'AIzaSyAuxB3sdMWdz_-Uu41og8lg1DaQtMsypUY',
        discoveryDocs: DISCOVERY_DOCS,
        clientID: CLIENT_ID,
        scope: SCOPES
    }).then(() => {
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        authorizeButton.onclick = handleAuthClick;
        signoutButton.onclick = handleSignoutClick;
    });
}

function updateSigninStatus(isSignedIn){
    if(isSignedIn){
        authorizeButton.style.display ='none';
        signoutButton.style.display = 'block';
        content.style.display= 'block';
        videoContainer.style.display = 'block';
        getChannel(defaultChannel);
    } else {
        authorizeButton.style.display ='block';
        signoutButton.style.display = 'none';
        content.style.display= 'none';
        videoContainer.style.display = 'none';
    }
}

function handleAuthClick(){
    gapi.auth2.getAuthInstance().signIn();
}

function handleSignoutClick(){
    gapi.auth2.getAuthInstance().signOut();
}

function showChannelData(data){
    const channelData = document.getElementById('channel-data');
    channelData.innerHTML = data;
}

function getChannel(Channel){
    gapi.clinet.youtube.channels.list({
        part: 'snippet,contentDetails,statistics',
        forUsername: channel
    })
    .then(response => {
        console.log(resonse);
        const channel = response.result.items[0];

        const output = `
            <ul class = "collection">
                <li class = "collection-item">Title: ${channel.snippet.title}</li>
                <li class = "collection-item">ID: ${channel.id}</li>
                <li class = "collection-item">Subscribers: ${numberWithCommas(channel.statistics.subcriberCount)}</li>
                <li class = "collection-item">Views: ${numberWithCommas(channel.statistics.viewCount)}</li>
                <li class = "collection-item">Videos: ${numberWithCommas(channel.statistics.videoCount)}</li>
            </ul>
            <p>${channel.snippet.desciption}</p>
            <hr>
            <a class = "btn red" target="_blank" href="https://youtube.com/${channel.snippet.customUrl}">Visit Channel</a>
        `;
        showChannelData(output);

        const playlistId = channel.contentDetails.relatedPlaylist.uploads;
        requestVideoPlaylist(playlistId);
    })
    .catch(err => alert('No Channel By that Name'));
}

function numberWithCommas(x){
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function requestVideoPlaylist(playlistId){
    const requestOptions = {
        playlistId: playlistId,
        part: 'snippet',
        maxResults: 10
    }

    const request = gapi.client.youtube.playlistItems.list(requestOptions);

    request.execute(response => {
        console.log(response);
        const playListItems = reponse.result.items;
        if(playListItems){
            let output = '<br><h4 class="center-align">Latest Videos</h4>';

            playListItems.forEach(item => {
                const videoId = item.snippet.resourceId.videoId;

                output +=`
                <div class="col s3">
                <iframe width="100%" height="auto" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
                </div>
                `;
            });

            videoContainer.innerHTML = output;
        } else {
            videoContainer.innerHTML = "No uploaded Videos";
        }
    });
}



