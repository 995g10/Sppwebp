const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const zoomInButton = document.getElementById('zoomIn');
const zoomOutButton = document.getElementById('zoomOut');
let videoStream = null;
let videoElement = null;
let zoomLevel = 1;

// Initialize WebXR
async function initWebXR() {
    if (navigator.xr) {
        const xrSession = await navigator.xr.requestSession('immersive-vr');
        const xrReferenceSpace = await xrSession.requestReferenceSpace('local');
        const gl = canvas.getContext('webgl', { xrCompatible: true });
        xrSession.updateRenderState({ baseLayer: new XRWebGLLayer(xrSession, gl) });

        xrSession.requestAnimationFrame(onXRFrame);
    } else {
        console.error('WebXR not supported');
    }
}

// Render XR Frame
function onXRFrame(time, frame) {
    const session = frame.session;
    const pose = frame.getViewerPose(session.renderState.baseLayer.getReferenceSpace());

    if (pose) {
        const glLayer = session.renderState.baseLayer;
        gl.bindFramebuffer(gl.FRAMEBUFFER, glLayer.framebuffer);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Draw the video feed onto the canvas
        ctx.drawImage(videoElement, 0, 0, canvas.width * zoomLevel, canvas.height * zoomLevel);
    }

    session.requestAnimationFrame(onXRFrame);
}

// Access Camera Feed
async function startCameraFeed() {
    videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoElement = document.createElement('video');
    videoElement.srcObject = videoStream;
    videoElement.play();
}

// Handle Zoom In
zoomInButton.addEventListener('click', () => {
    zoomLevel += 0.1;
    if (zoomLevel > 2) zoomLevel = 2; // Limit max zoom level
});

// Handle Zoom Out
zoomOutButton.addEventListener('click', () => {
    zoomLevel -= 0.1;
    if (zoomLevel < 1) zoomLevel = 1; // Limit min zoom level
});

// Initialize everything
async function init() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    await startCameraFeed();
    await initWebXR();
}

init().catch(console.error);
