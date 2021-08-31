const { RTCPeerConnection, RTCSessionDescription } = window;

isAlreadyCalling = false;
let localStream;

const connections = {};

const callWith = {};


navigator.getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);

navigator.getUserMedia(
  { video: true, audio: false },
  stream => {
    const localVideo = document.getElementById("local-video");
    if (localVideo) {
      localVideo.srcObject = localStream = stream;
    }
  },
  error => {
    console.warn(error.message);
  }
);

const getNewOrReturnConnection = (socketId) => {
  if (connections[socketId]) {
    return connections[socketId]
  }
  callWith[socketId] = false;
  const connection = connections[socketId] = new RTCPeerConnection();

  connection.ontrack = function ({ streams: [stream] }) {
    const remoteVideo = document.getElementById(socketId + "_video");
    if (remoteVideo) {
      remoteVideo.srcObject = stream;
    }
  };

  localStream.getTracks().forEach(track => {
    connection.addTrack(track, localStream);
  });

  return connection;
}

async function callUser(socketId) {
  const peerConnection = getNewOrReturnConnection(socketId);
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(new RTCSessionDescription(offer));
  socket.emit("call-user", {
    offer,
    to: socketId
  });
}


socket.on("call-made", async (data) => {
  const peerConnection = getNewOrReturnConnection(data.socket);
  await peerConnection.setRemoteDescription(
    new RTCSessionDescription(data.offer)
  );
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(new RTCSessionDescription(answer));

  socket.emit("make-answer", {
    answer,
    to: data.socket
  });
});

socket.on("answer-made", async (data) => {
  const peerConnection = getNewOrReturnConnection(data.socket);
  await peerConnection.setRemoteDescription(
    new RTCSessionDescription(data.answer)
  );

  if (!callWith[data.socket]) {
    callUser(data.socket);
    callWith[data.socket] = true;
  } else {
  }
});

