<template>
  <div class="container">
    <div class="piece a-piece"></div>
    <div class="piece b-piece"></div>
    <div class="piece c-piece"></div>
    <div class="piece d-piece"></div>
    <div v-for="(star, index) in stars" :key="'star-' + index" :style="star.style" class="star"></div>
    <div v-for="(meteor, index) in meteors" :key="'meteor-' + index" :style="meteor.style" class="meteor"></div>
    <div v-for="(planet, index) in planets" :key="'planet-' + index" :style="planet.style" class="planet"></div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      stars: [],
      meteors: [],
      planets: [],
      minStars: 500,
      maxStars: 600,
      minMeteors: 3,
      maxMeteors: 5,
      probability: [0.7, 0.65, 0.5, 0.35, 0.3],
      lastMeteorPosition: null
    };
  },
  mounted() {
    this.generateStars();
    this.generateMeteors();
  },
  methods: {
    generateStars() {
      const numStars = Math.floor(Math.random() * (this.maxStars - this.minStars + 1)) + this.minStars;
      for (let i = 0; i < numStars; i++) {
        const star = {
          style: {
            top: Math.floor(Math.random() * 100) + "%",
            left: Math.floor(Math.random() * 100) + "%",
            width: Math.floor(Math.random() * 3) + "px",
            height: Math.floor(Math.random() * 3) + "px",
            backgroundColor: this.getRandomColor(),
            zIndex: 1,
          },
          duration: Math.floor(Math.random() * 1000) + 1,
          startTime: Date.now(),
        };
        this.stars.push(star);
        setInterval(() => {
          this.removeStar(star);
        }, star.duration * 1000);
      }
    },
    removeStar(star) {
      const index = this.stars.indexOf(star);
      if (index > -1) {
        this.stars.splice(index, 1);
        setTimeout(() => {
          this.generateStar(star);
        }, 1000);
      }
    },
    generateStar(star) {
      star.style.top = Math.floor(Math.random() * 100) + "%";
      star.style.left = Math.floor(Math.random() * 100) + "%";
      star.duration = Math.floor(Math.random() * 1000) + 1;
      star.startTime = Date.now();
      this.stars.push(star);
      setInterval(() => {
        this.removeStar(star);
      }, star.duration * 1000);
    },
    getRandomNumMeteors() {
      const randomNum = Math.random();
      let probabilitySum = 0;
      for (let i = 0; i < this.probability.length; i++) {
        probabilitySum += this.probability[i];
        if (randomNum <= probabilitySum) {
          return i + 1;
        }
      }
      return this.probability.length;
    },
    generateMeteors() {
      const numMeteors = this.getRandomNumMeteors();
      for (let i = 0; i < numMeteors; i++) {
        this.addMeteor();
      }
    },
    addMeteor() {
      const meteor = {
        style: {
          top: `${Math.floor(Math.random() * 100)}%`,
          left: `${Math.floor(Math.random() * 100)}%`
        },
        duration: Math.floor(Math.random() * 10) + 10,
        startTime: Date.now()
      };
      if (this.lastMeteorPosition !== null) {
        let tries = 0;
        while (this.isSamePosition(meteor.style, this.lastMeteorPosition) && tries < 10) {
          meteor.style.top = `${Math.floor(Math.random() * 100)}%`;
          meteor.style.left = `${Math.floor(Math.random() * 100)}%`;
          tries++;
        }
        if (this.meteors.length >= 10) {
          this.removeMeteor(this.meteors[0]);
          this.removeMeteor(this.meteors[1]);
        }
      }
      this.lastMeteorPosition = meteor.style;
      this.meteors.push(meteor);
      setTimeout(() => {
        this.removeMeteor(meteor);
      }, meteor.duration * 1000);
    },
    removeMeteor(meteor) {
      const index = this.meteors.indexOf(meteor);
      if (index > -1) {
        this.meteors.splice(index, 1);
        setTimeout(() => {
          this.addMeteor();
        }, 1000);
        if (this.meteors.length < this.maxMeteors) {
          this.addMeteor();
        }
      }
    },
    isSamePosition(pos1, pos2) {
      return pos1.top === pos2.top && pos1.left === pos2.left;
    },
    generatePlanets() {
      const numPlanets = Math.floor(Math.random() * 3) + 3;
      for (let i = 0; i < numPlanets; i++) {
        const planet = {
          style: {
            top: Math.floor(Math.random() * 100) + "%",
            left: Math.floor(Math.random() * 100) + "%",
            backgroundColor: this.getRandomColor(),
          },
          duration: Math.floor(Math.random() * 2000) + 1,
          startTime: Date.now(),
        };
        this.planets.push(planet);
        setInterval(() => {
          this.removePlanet(planet);
        }, planet.duration * 1000);
      }
    },
    removePlanet(planet) {
      const index = this.planets.indexOf(planet);
      if (index > -1) {
        this.planets.splice(index, 1);
        setTimeout(() => {
          this.generatePlanet(planet);
        }, 1000);
      }
    },
    generatePlanet(planet) {
      planet.style.top = Math.floor(Math.random() * 100) + "%";
      planet.style.left = Math.floor(Math.random() * 100) + "%";
      planet.duration = Math.floor(Math.random() * 2000) + 1;
      planet.startTime = Date.now();
      this.planets.push(planet);
      setInterval(() => {
        this.removePlanet(planet);
      }, planet.duration * 1000);
    },
    getRandomColor() {
      const colors = ["#FFFFFF", "#FFD700", "#FFA500", "#00FFFF", "#FF69B4", "#00BFFF", "#FF1493", "#7FFF00"];
      return colors[Math.floor(Math.random() * colors.length)];
    },
  },
};
</script>

<style scoped>
/* 添加全局重置 */
body, html {
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-wrap: wrap;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.piece {
  width: 50%;
  height: 50%;
  position: relative;
  box-sizing: border-box;
}

.a-piece {
  background-color: #000;
}

.b-piece {
  background-color: #000;
}

.c-piece {
  background-color: #000;
}

.d-piece {
  background-color: #000;
}

.star {
  position: absolute;
  border-radius: 50%;
  animation: twinkling 1s infinite;
}

.meteor {
  position: absolute;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background-color: #FFF;
  animation: meteor 2s ease-in-out infinite;
}

.planet {
  position: absolute;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #FFF;
  animation: planet 2s infinite;
}

@keyframes twinkling {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

/* 更新流星动画支持全屏 */
@keyframes meteor {
  0% {
    transform: translateX(0) translateY(0);
    opacity: 1;
  }
  100% {
    transform: translateX(calc(-100vw - 100%)) translateY(calc(100vh + 100%));
    opacity: 0;
  }
}

@keyframes planet {
  0% { transform: rotate(0); }
  100% { transform: rotate(360deg); }
}
</style>