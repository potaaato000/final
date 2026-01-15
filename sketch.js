let correctCount = 0;  // 记录正确点击的次数
let imgCat;      // 准备放猫图片的盒子
let imgCarrots;  // 准备放胡萝卜图片的盒子  
let imgTissue;   // 准备放纸巾图片的盒子
let imgMickey;   // 准备放米老鼠图片的盒子
let shapes = []; // 准备一个空篮子，用来装天上掉下来的东西
let bottomWord = ""; // 准备显示底部文字的牌子（现在还是空的）
let wordTimer = 0; // 准备一个计时器，记录文字切换的时间
let feedback = ""; // 准备显示"真棒"文字的牌子
let feedbackTimer = 0; // "真棒"文字的计时器
let soundFileCarrots; // 准备放胡萝卜声音的录音机
let soundFileTissue;  // 准备放纸巾声音的录音机  
let soundFileMickey;  // 准备放米老鼠声音的录音机  
let soundFileGood;    // 准备放"真棒"声音的录音机
let bgm;             // 准备放背景音乐的录音机


// 跟踪上次播放状态，避免重复播放
let lastBottomWord = ""; // 记住上次底部写的是什么字（就是方便下面“lastBottomWord = bottomWord”
// 这里记住这一次底部显示的是什么字，这样下一次文字切换时，程序才能判断出文字是不是真的变了）
let feedbackPlayed = false; // 记住"真棒"声音是否已经播放过（就是每次都要重置一下）

// 加载图片和音频
function preload() {
  imgCat = loadImage('assets/cat.png');
  imgCarrots = loadImage('assets/carrots.png');
  imgTissue = loadImage('assets/tissue.png');
  imgMickey = loadImage('assets/mickey.png');
  soundFileCarrots = loadSound('assets/carrots.mp3');
  soundFileTissue = loadSound('assets/tissue.mp3');
  soundFileMickey = loadSound('assets/mickey.mp3');
  soundFileGood = loadSound('assets/good.mp3');
  bgm = loadSound('assets/bgm.mp3');
}

function setup() {
  createCanvas(400, 600);
  // Draw the image.
  image(imgCat, 0, 0);
  textAlign(CENTER, CENTER);//不在下面写是因为这属于初始设定，所有文字都是这个对齐逻辑
  bottomWord = random(["萝卜", "纸巾", "米老鼠"]);
  lastBottomWord = bottomWord; // 初始化上次记录
  imageMode(CENTER);  // 重要：设置图片中心对齐
  
  // 处理浏览器自动播放策略（ai写的）（感觉有点多余但是算了不删了）
  let startButton = createButton('点击开始音频');
  startButton.position(10, 10);
  startButton.mousePressed(enableAudio);
}

function enableAudio() {  //（想加个背景音，这个没学过，让ai帮忙写进去然后再学的）
  // 恢复音频上下文以解决浏览器自动播放限制
  if (getAudioContext().state !== 'running') {
    getAudioContext().resume();
  }

  if (!bgm.isPlaying()) {//之前存好并且已经调用的音乐现在可以用“bgm.xx来设定了）
    bgm.loop(); // 使用loop()方法实现循环播放
    bgm.setVolume(0.3); // 设置BGM音量（0.0到1.0之间）
  }

  // 移除按钮
  select('button').remove();
}

function draw() {
  background(240);
  // 放入背景图
  image(imgCat, 200, 300, 400, 600);

  // 每3秒切换一次底部文字 （通过“framecount来计算，同时也可以通过framerate来调整计数速度，这个速度就是刷新速度）
  if (frameCount - wordTimer > 150) {
    bottomWord = random(["萝卜", "纸巾", "米老鼠"]);
    wordTimer = frameCount;
    
    // 播放对应的音频（只在文字改变时播放）
    playBottomWordAudio();
  }
  
  // 随机添加新形状（这段代码在每一帧都进行一次“抽奖”，
  // 但只有同时满足“天上物体少于5个”和“抽中了2%概率”这两个条件时，
  // 才会生成一个新物体。这确保了物体不会无限增多，且出现得比较随机。（不知道为什么要百分之二的概率，这个是ai写的）
  if (shapes.length < 5 && random() < 0.02) {
    shapes.push(new Shape());
  }
  
  // 更新并显示所有形状（总之就是让天上有的都显示出来，归零了以后天上还会形成新的一批）
  for (let i = shapes.length - 1; i >= 0; i--) {
    shapes[i].y += shapes[i].speed;
    shapes[i].display(); 
    
    // 移除超出画布的形状
    if (shapes[i].y > height + 50) {
      shapes.splice(i, 1);//这个是ai写的，本人并不知道这个移除功能
      
    }
  }
  
  // 显示底部文字
  fill(0);
  textSize(32);
  text(bottomWord, width/2, height - 30);
  
  // 显示反馈文字（持续1秒）
  if (feedback !== "" && frameCount - feedbackTimer < 60) {
    fill(255, 255, 255);
    textSize(36);
    text(feedback, width/2, height/2);
    //确保只有当屏幕上确实有反馈文字（比如"蒸蚌"），并且这个文字显示的时间还没超过大约1秒时，
    // 才会执行后续显示文字和播放音效的代码。


    // 播放反馈音频（只在反馈出现时播放一次）
    if (!feedbackPlayed) {
      soundFileGood.play();
      feedbackPlayed = true;
    }
  } else {
    feedback = ""; // 1秒后清除反馈
    feedbackPlayed = false; // 重置播放状态
  }
  fill(255);
  textSize(20);
  textAlign(RIGHT, TOP);
  text("得分: " + correctCount, width - 20, 20);
  textAlign(CENTER, CENTER); // 恢复默认对齐方式
}

// 播放底部文字对应的音频
function playBottomWordAudio() {
  // 只在文字实际改变时播放
  if (bottomWord !== lastBottomWord) {
    if (bottomWord === "萝卜") {
      soundFileCarrots.play();
    } else if (bottomWord === "纸巾") {
      soundFileTissue.play();
    } else if (bottomWord === "米老鼠") {
      soundFileMickey.play();
    }
    lastBottomWord = bottomWord; // 更新记录
  }
}

function Shape() {
  this.type = random(["circle", "square", "triangle"]);
  this.x = random(50, width - 50);
  this.y = -30;
  this.size = 40;
  this.speed = random(2, 4);
  //this.color = color(random(100, 255), random(100, 255), random(100, 255));
  
  this.display = function() {
    // 移除 stroke 和 fill，因为图片不需要这些
    noFill();
    noStroke();
    
    if (this.type === "circle") {
      
      image(imgCarrots, this.x, this.y, this.size, this.size);
    } else if (this.type === "square") {
      
      image(imgTissue, this.x, this.y, this.size, this.size);
    }else if (this.type === "triangle") {
      
      image(imgMickey, this.x, this.y, this.size, this.size);
    }
  };
}

function mousePressed() {
  // 确保音频上下文已启动（ai加进去的，当时并没有想到这里也要加这个）
  if (getAudioContext().state !== 'running') {
    getAudioContext().resume();
  }
  //鼠标点击图形检验
  //用dist函数检验鼠标与图片的位置关系，进入图片范围则判定点击中）
  for (let i = 0; i < shapes.length; i++) {
    let d = dist(mouseX, mouseY, shapes[i].x, shapes[i].y);
    
    // 简单的碰撞检测
    if (d < shapes[i].size) {
      let shapeNames = {circle: "萝卜", square: "纸巾",triangle: "米老鼠"};
      
      if (shapeNames[shapes[i].type] === bottomWord) {
        feedback = "蒸蚌";
        feedbackTimer = frameCount;
        shapes.splice(i, 1);
        correctCount++;  // 增加计数器
      }
      break;
    }
  }
}