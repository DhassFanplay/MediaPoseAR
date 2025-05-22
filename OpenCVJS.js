
let pose;
let canvas, ctx;
let initialized = false;

// Create canvas dynamically
function initializeCanvas(width, height) {
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        ctx = canvas.getContext('2d');
        document.body.appendChild(canvas); // Optional: comment out if not visible
    }
}

// Setup BlazePose once
function setupPose() {
    pose = new Pose({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
    });

    pose.setOptions({
        modelComplexity: 2,
        smoothLandmarks: true,
        enableSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    });

    pose.onResults(onPoseResults);
}

// Unity calls this every frame with image data
// imageData should be ImageBitmap, HTMLVideoElement, or HTMLCanvasElement
window.ReceiveWebcamFrame = async function (imageBitmap) {
    if (!initialized) {
        setupPose();
        initializeCanvas(imageBitmap.width, imageBitmap.height);
        initialized = true;
    }

    // Draw incoming Unity frame into canvas
    ctx.drawImage(imageBitmap, 0, 0, canvas.width, canvas.height);

    // Send to BlazePose
    await pose.send({ image: canvas });
};

function onPoseResults(results) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

    if (results.poseLandmarks) {
        drawLandmarks(results.poseLandmarks);
    }
}

// Draw keypoints on canvas
function drawLandmarks(landmarks) {
    ctx.fillStyle = 'lime';
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;

    for (let i = 0; i < landmarks.length; i++) {
        const lm = landmarks[i];
        const x = lm.x * canvas.width;
        const y = lm.y * canvas.height;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillText(i.toString(), x + 4, y - 4); // Debug index

        // Highlight foot landmarks
        if ([27, 28, 31, 32].includes(i)) {
            ctx.beginPath();
            ctx.arc(x, y, 6, 0, 2 * Math.PI);
            ctx.fillStyle = 'red';
            ctx.fill();
            ctx.fillStyle = 'lime';
        }
    }
}
