vconst startBtn = document.getElementById("start");
const alertSound = document.getElementById("shush");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 400;

const colors = ["#66CCFF", "#FFCC66", "#FF66CC", "#66FF66", "#CC66FF"];
const balls = [];
const THRESHOLD = 0.2;
let started = false;

// Create 10 colorful balls
for (let i = 0; i < 10; i++) {
  const radius = 10;
  const x = Math.random() * (canvas.width - 2 * radius) + radius;
  const y = Math.random() * (canvas.height - 2 * radius) + radius;
  const baseDx = (Math.random() * 2 - 1) * 2;
  const baseDy = (Math.random() * 2 - 1) * 2;

  balls.push({
    x,
    y,
    baseDx,
    baseDy,
    radius,
    color: colors[i % colors.length],
  });
}

startBtn.addEventListener("click", () => {
  if (started) return;
  started = true;
  startBtn.disabled = true;

  navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
    const audioCtx = new AudioContext();
    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    source.connect(analyser);

    const pcmData = new Float32Array(analyser.fftSize);

    function animate() {
      analyser.getFloatTimeDomainData(pcmData);
      let sumSquares = 0;
      for (const val of pcmData) {
        sumSquares += val * val;
      }
      const volume = Math.sqrt(sumSquares / pcmData.length);

      // Shhh if too loud
      if (volume > THRESHOLD && alertSound.paused) {
        alertSound.play();
      }

      // Animation
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const speedFactor = 1 + volume * 4;

      balls.forEach((ball) => {
        // Bounce off edges
        if (
          ball.x + ball.baseDx * speedFactor > canvas.width - ball.radius ||
          ball.x + ball.baseDx * speedFactor < ball.radius
        ) {
          ball.baseDx = -ball.baseDx;
        }

        if (
          ball.y + ball.baseDy * speedFactor > canvas.height - ball.radius ||
          ball.y + ball.baseDy * speedFactor < ball.radius
        ) {
          ball.baseDy = -ball.baseDy;
        }

        ball.x += ball.baseDx * speedFactor;
        ball.y += ball.baseDy * speedFactor;

        // Draw ball
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = ball.color;
        ctx.fill();
      });

      requestAnimationFrame(animate);
    }

    animate();
  }).catch((err) => {
    alert("Microphone access is required.");
    console.error(err);
  });
});
