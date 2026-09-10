const canvas = document.getElementById("stars");
const ctx = canvas.getContext("2d");

let stars = [];
let mouse = { x:0, y:0, active:false };

// Resize canvas and initialize stars
function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  initStars();
}
window.addEventListener("resize", resize);
resize();

function initStars() {
  stars = [];
  const screenArea = canvas.width * canvas.height;
  const count = Math.floor(screenArea / 1200);
  for (let i=0;i<count;i++){
    stars.push({
      x: Math.random()*canvas.width,
      y: Math.random()*canvas.height,
      r: Math.random()*1.5 + 1.2,
      vx: (Math.random()-0.5)*0.8,
      vy: (Math.random()-0.5)*0.8,
      depth: Math.random()*1.5+0.5
    });
  }
}

document.addEventListener("mousemove",(e)=>{
  mouse.x = e.clientX;
  mouse.y = e.clientY;
  mouse.active = true;
});

function drawStarOutline(x,y,r){
  const points = 5;
  const inner = r*0.45;
  ctx.beginPath();
  for(let i=0;i<points*2;i++){
    const angle = (i*Math.PI)/points - Math.PI/2;
    const radius = i%2===0 ? r : inner;
    const px = x + Math.cos(angle)*radius;
    const py = y + Math.sin(angle)*radius;
    if(i===0) ctx.moveTo(px,py);
    else ctx.lineTo(px,py);
  }
  ctx.closePath();
  ctx.strokeStyle="rgba(17,17,17,0.9)";
  ctx.lineWidth=0.6;
  ctx.stroke();
}

function animate(){
  ctx.fillStyle="rgba(255,255,255,0.08)";
  ctx.fillRect(0,0,canvas.width,canvas.height);

  stars.forEach((s,i)=>{
    let ax=0, ay=0, neighborCount=0;
    for(let j=0;j<stars.length;j++){
      if(i===j) continue;
      const other = stars[j];
      const dx = other.x - s.x;
      const dy = other.y - s.y;
      const dist = Math.hypot(dx,dy);
      if(dist<40){
        ax += other.vx; ay += other.vy;
        neighborCount++;
        if(dist<8){ ax -= dx*0.03; ay -= dy*0.03; }
      }
    }
    if(neighborCount>0){
      ax/=neighborCount; ay/=neighborCount;
      s.vx += (ax-s.vx)*0.04; s.vy += (ay-s.vy)*0.04;
    }

    if(mouse.active){
      const dx = s.x - mouse.x;
      const dy = s.y - mouse.y;
      const dist = Math.hypot(dx,dy);
      if(dist<100){
        const force = (100-dist)/100;
        s.vx += (dx/dist)*force*2*s.depth;
        s.vy += (dy/dist)*force*2*s.depth;
      }
    }

    const speed = Math.hypot(s.vx, s.vy);
    const maxSpeed = 1.6*s.depth;
    if(speed > maxSpeed){
      s.vx = (s.vx/speed)*maxSpeed;
      s.vy = (s.vy/speed)*maxSpeed;
    }

    s.x += s.vx;
    s.y += s.vy;

    if(s.x<0) s.x=canvas.width;
    if(s.x>canvas.width) s.x=0;
    if(s.y<0) s.y=canvas.height;
    if(s.y>canvas.height) s.y=0;

    drawStarOutline(s.x,s.y,s.r);
  });

  requestAnimationFrame(animate);
}
animate();

// === Email Form Submission ===
const form = document.getElementById("emailForm");
const toast = document.getElementById("toast");

form.addEventListener("submit", async (e)=>{
  e.preventDefault();
  const email = document.getElementById("email").value.trim();

  if(!email){
    showToast("Please enter a valid email.");
    return;
  }

  try {
    const response = await fetch("https://docs.google.com/spreadsheets/d/13ADI-cEikN6oXIqdpqF6CKkyxEP5ro1soLiiMDBlWvM/edit?usp=sharing", {
      method: "POST",
      body: JSON.stringify({ email }),
      headers: { "Content-Type": "application/json" }
    });

    const result = await response.json();

    if(result.status === "success"){
      showToast("✅ Email saved successfully!");
      form.reset();
    } else {
      showToast("⚠️ Error: " + (result.message || "Unknown error"));
    }

  } catch(err){
    showToast("⚠️ Error: Could not connect.");
  }
});

function showToast(message){
  toast.textContent = message;
  toast.style.opacity = 1;
  setTimeout(()=>{ toast.style.opacity = 0; }, 3000);
}
