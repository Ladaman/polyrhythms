const paper = document.getElementById("paper");
const pen = paper.getContext("2d");

let startTime = new Date().getTime();
let soundEnabled = true;

document.onvisibilitychange = () => {
  soundEnabled = false;
};
paper.onclick = () => {
  soundEnabled = !soundEnabled;
};

const colors = [
  "#D0E7F5",
  "#D9E7F4",
  "#D6E3F4",
  "#BCDFF5",
  "#B7D9F4",
  "#C3D4F0",
  "#9DC1F3",
  "#9AA9F4",
  "#8D83EF",
  "#AE69F0",
  "#D46FF1",
  "#DB5AE7",
  "#D911DA",
  "#D601CB",
  "#E713BF",
  "#F24CAE",
  "#FB79AB",
  "#FFB6C1",
  "#FED2CF",
  "#FDDFD5",
  "#FEDCD1",
];

//the time it takes the dots to realign in seconds
const duration = 225;
const volume = 0.2;

const calculateNextImpactTime = (currentImpactTime, velocity) => {
  return currentImpactTime + (Math.PI / velocity) * 1000;
};

const arcs = colors.map((color, index) => {
  const audio = new Audio(`./assets/audio/audio-${index + 1}.wav`);

  audio.volume = volume;

  const numberOfLoops = 50 - index;
  const oneFullLoop = 2 * Math.PI;
  const velocity = (oneFullLoop * numberOfLoops) / duration;
  return {
    color,
    audio,
    nextImpactTime: calculateNextImpactTime(startTime, velocity),
    velocity,
  };
});

//plays the key from the keys array
const playKey = (index) => arcs[index].audio.play();

const draw = () => {
  const currentTime = new Date().getTime();
  const elapsedTime = (currentTime - startTime) / 1000;

  paper.width = paper.clientWidth;
  paper.height = paper.clientHeight;

  const start = {
    x: paper.width * 0.1,
    y: paper.height * 0.9,
  };
  const end = {
    x: paper.width * 0.9,
    y: paper.height * 0.9,
  };

  pen.strokeStyle = "#ffffff";
  pen.lineWidth = 6;

  pen.beginPath();
  pen.moveTo(start.x, start.y);
  pen.lineTo(end.x, end.y);
  pen.stroke();

  //half-arc center
  const center = {
    x: paper.width * 0.5,
    y: paper.height * 0.9,
  };

  const length = end.x - start.x;
  const initialArcRadius = length * 0.05;
  const spacing = (length / 2 - initialArcRadius) / colors.length;

  arcs.forEach((arc, index) => {
    //circle position on the arc

    const maxAngle = 2 * Math.PI;
    const arcRadius = initialArcRadius + index * spacing;
    const distance = Math.PI + elapsedTime * arc.velocity;
    const modDistance = distance % maxAngle;
    const adjustedDistance =
      modDistance >= Math.PI ? modDistance : maxAngle - modDistance;

    const x = center.x + arcRadius * Math.cos(adjustedDistance);
    const y = center.y + arcRadius * Math.sin(adjustedDistance);

    //draw arc
    pen.beginPath();
    pen.arc(center.x, center.y, arcRadius, Math.PI, 2 * Math.PI);
    pen.stroke();
    pen.strokeStyle = arc.color;

    //draw circle
    pen.fillStyle = "#ffffff";
    pen.beginPath();
    pen.arc(x, y, length * 0.0065, 0, 2 * Math.PI);
    pen.fill();

    if (currentTime >= arc.nextImpactTime) {
      if (soundEnabled) {
        playKey(index);
        arc.lastImpactTime = arc.nextImpactTime;
      }
      arc.nextImpactTime = calculateNextImpactTime(
        arc.nextImpactTime,
        arc.velocity
      );
    }
  });

  requestAnimationFrame(draw);
};
draw();
