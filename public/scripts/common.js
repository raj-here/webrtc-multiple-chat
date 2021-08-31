function unselectUsersFromList() {
    const alreadySelectedUser = document.querySelectorAll(
        ".active-user.active-user--selected"
    );
    alreadySelectedUser.forEach(el => {
        el.setAttribute("class", "active-user");
    });
}

function createUserItemContainer(socketId) {
    const userContainerEl = document.createElement("div");
    const usernameEl = document.createElement("p");
    userContainerEl.setAttribute("class", "active-user");
    userContainerEl.setAttribute("id", socketId);
    usernameEl.setAttribute("class", "username");
    usernameEl.innerHTML = `Socket: ${socketId}`;
    userContainerEl.appendChild(usernameEl);
    userContainerEl.addEventListener("click", () => {
        unselectUsersFromList();
        userContainerEl.setAttribute("class", "active-user active-user--selected");
        const talkingWithInfo = document.getElementById("talking-with-info");
        callUser(socketId);
    });
    return userContainerEl;
}

function createVideoContainer(socketId) {
    const videoContainerEl = document.createElement("div");
    videoContainerEl.setAttribute("class", "video-container");
    const videoEl = document.createElement("video");
    videoEl.autoplay = true;
    videoEl.setAttribute("id", socketId);
    videoEl.setAttribute("class", "remote-video");
    videoContainerEl.appendChild(videoEl);
    return videoContainerEl;
}

function updateUserList(socketIds) {
    const activeUserContainer = document.getElementById("active-user-container");
    const activeUserVideoContainer = document.getElementById("video-containers");
    socketIds.forEach(socketId => {
        const alreadyExistingUser = document.getElementById(socketId);
        if (!alreadyExistingUser) {
            const userContainerEl = createUserItemContainer(socketId);
            activeUserContainer.appendChild(userContainerEl);
        }
        activeUserVideoContainer.appendChild(createVideoContainer(socketId + "_video"));
    });
}

const socket = io.connect("/");

socket.on('connect', function () {
    mySocketId = socket.id;
});

socket.on("update-user-list", ({ users }) => {
    updateUserList(users);
});

socket.on("remove-user", ({ socketId }) => {
    const elToRemove = document.getElementById(socketId);
    const videoElToRemove = document.getElementById(socketId + "_video");
    if (elToRemove) {
        elToRemove.remove();
    }
    if(videoElToRemove) {
        videoElToRemove.remove();
    }
});

socket.on("call-rejected", data => {
    alert(`User: "Socket: ${data.socket}" rejected your call.`);
    unselectUsersFromList();
});
