
function loadTask() {
  var task = [];
  // CONSENT
  task[0] = {};
  task[0].type = 'consent';
  // consent is a default type with no callbacks - has no data.
  task[0].variables = {};
  task[0].variables.consent = NaN;

  // // SURVEY DEMOGRAPHICS
  task[1] = {};
  task[1].type = 'survey';
  // survey is a default type with no callbacks
  // the demographics survey is a default type
  task[1].surveys = ['survey-demo'];
  task[1].variables = {};
  // the default survey type needs an answer list that we can push to
  // as we get answers
  // if we don't set this it will be done automatically
  task[1].variables.answers = [];

  // INSTRUCTIONS
  task[2] = {};
  task[2].type = 'instructions';
  task[2].variables = {};
  task[2].instructions = ['instruct-1', 'instruct-2', 'instruct-3', 'instruct-4'];

  // PRACTICE TRIALS
  task[3] = addTaskBlock(5, 1, "high");

  //Number of trials per block
  nTrialsPerBlock = 40;
  // INSTRUCTIONS BEFORE BEGINNING REAL TRIALS 
  task[4] = {};
  task[4].type = 'instructions';
  task[4].variables = {};
  task[4].instructions = ['instruct-block1'];

  // Start the real task: 40 trial blocks
  task[5] = addTaskBlock(nTrialsPerBlock, 0, "low");

  // First break
  task[6] = {};
  task[6].type = 'instructions';
  task[6].variables = {};
  task[6].instructions = ['instruct-block2'];

  task[7] = addTaskBlock(nTrialsPerBlock, 0, "high");

  task[8] = {};
  task[8].type = 'instructions';
  task[8].variables = {};
  task[8].instructions = ['instruct-block3'];

  task[9] = addTaskBlock(nTrialsPerBlock, 0, "low");

  task[10] = {};
  task[10].type = 'instructions';
  task[10].variables = {};
  task[10].instructions = ['instruct-block4'];

  task[11] = addTaskBlock(nTrialsPerBlock, 0, "high");

  return task;
}



function addTaskBlock(numTrials, practice, runtype) {
  taskblock = {};
  taskblock.type = 'trial'; // this will give us use of the canvas

  // Set callback functions
  taskblock.callbacks = {};
  taskblock.callbacks.startTrial = startTrial;
  taskblock.callbacks.startSegment = startSegment;
  taskblock.callbacks.updateScreen = updateScreen;
  taskblock.callbacks.getResponse = getResponse;

  // Task parameters which get automatically assigned on each trial.
  taskblock.parameters = {};
  taskblock.parameters.practice = practice;
  taskblock.parameters.runtype = runtype;
  
  if (taskblock.parameters.runtype =="high"){
    taskblock.parameters.posdiff = [-15, -11, -9, 9, 11, 15];
  } else{
    taskblock.parameters.posdiff = [-2, -5, -9, 9, 5, 2];
  }
  
  // Task Variables which get set on each trial
  taskblock.variables = {};
  taskblock.variables.key = NaN;
  taskblock.variables.correct = NaN;
  taskblock.variables.difference = NaN;
  taskblock.variables.initialConfidence = NaN;
  taskblock.variables.confidence = NaN;
  taskblock.variables.jitters = NaN;

  // Segment timing
  taskblock.segnames = ['fixation','fixation','stim1','ISI', 'stim2', "response", "confidence", "ITI", "ITI"];
  taskblock.segmin = [500,500, 15, 500, 15, Infinity, Infinity, 500, 500];
  taskblock.segmax = [500,500, 15, 500, 15, Infinity, Infinity, 500, 500];

  // Responses - which segments should we look for a response.
  taskblock.response = [0, 0,0, 0, 0, 1, 1, 0, 0];

  // Trials
  taskblock.numTrials = numTrials; 
  // Keys
  taskblock.keys = [49,50]; // (check w/ http://keycode.info/)

  return taskblock
}

let fix, tex, texSprite, showResp, feedback_text;


function startTrial() {
  window.background = {};

  var i;
  for (i = 1; i < 22; i++) {
    index = i.toString();
    window.background[index] = jglCreateTexture('exps/aburrcon/background/' + index + '.jpg');

  }

  window.center = {};

  for (i = 1; i < 4; i++) {
    index = i.toString();
    window.center[index] = jglCreateTexture('exps/aburrcon/center/' + index + '.jpg');
  }

  window.difference = {};

  var difference = [-15, -11, -9, -5, -2, 5, 2, 9, 11, 15]

  for (i = 0; i < difference.length; i++) {
    index = difference[i].toString();
    window.difference[index] = jglCreateTexture('exps/aburrcon/stim/' + index + '.jpg');
  }


  jgl.trial.center = Math.floor(Math.random()*2);
  difference_index = Math.floor(Math.random()*6);
  jgl.trial.difference = taskblock.parameters.posdiff[difference_index];
}


function startSegment() {

  // ecc = 250; // distance from center of visual field to place images
  // scl = 0.5; // scale factor to stretch / shrink images

  // Setting fixation cross color
  jgl.active.fixColor = 0xFFFFFF;
  jgl.active.text = NaN;

  console.log(jgl.trial.segname);

  switch(jgl.trial.segname){
    case 'fixation':
      back_num = Math.floor(Math.random()* 21) +1;
      tex = window.background[back_num.toString()];
      rendered = jglBltTexture(tex);
      break;
    case 'stim1':
      if (jgl.trial.center==1){
        back_num = Math.floor(Math.random()* 3) +1;
        tex = window.center[back_num.toString()];
        rendered = jglBltTexture(tex);
      }else{
        tex = window.difference[jgl.trial.difference.toString()];
        console.log(jgl.trial.difference);
        rendered = jglBltTexture(tex);
      }
      break;
    case 'stim2':
      if (jgl.trial.center==1){
        tex = window.difference[jgl.trial.difference.toString()];
        rendered = jglBltTexture(tex);
        console.log(jgl.trial.difference);
      }else{
        back_num = Math.floor(Math.random()* 3) +1;
        tex = window.center[back_num.toString()];
        rendered = jglBltTexture(tex);
      }
      break;
    case 'ITI':
      back_num = Math.floor(Math.random()* 21) +1;
      tex = window.background[back_num.toString()];
      rendered = jglBltTexture(tex);
      break;
    case 'ISI':
      back_num = Math.floor(Math.random()* 21) +1;
      tex = window.background[back_num.toString()];
      rendered = jglBltTexture(tex);
      break;
    case 'confidence':
      tex = jglCreateTexture('exps/aburrcon/black.jpg');
      tex = jglBltTexture(tex);
      eventListenerAdd("wheel", confidence)
      eventListenerAdd("click", next);
      break;
    case "response":
      back_num = Math.floor(Math.random()* 21) +1;
      tex = window.background[back_num.toString()];
      rendered = jglBltTexture(tex);
      var texture = setInterval(displayBackground, 500);
      function displayBackground(){
        if (jgl.trial.segname=="response"){
          back_num = Math.floor(Math.random()* 21) +1;
          tex = window.background[back_num.toString()];
          rendered = jglBltTexture(tex);
        }else{
          clearInterval(texture);
        }
      }
      break;
  }
}

let height = Math.random()*150;

function confidence(event){

  height += event.deltaY * -0.05;

  // Restrict scale
  height = Math.min(Math.max(.125, height), 150);
}

function next(){
  jgl.trial.confidence = height/150.0;
  height = Math.random()*150;
  jumpSegment();
}

function updateScreen() { 
  // Draw fiation cross
  fix=jglFixationCross(undefined, undefined, jgl.active.fixColor,[0,0]);
  jgl.usingVisualAngles = true;
  // Delay segment
  if (jgl.trial.segname == 'confidence') {
    var graphics = new PIXI.Graphics();
    graphics.beginFill(0x000000);
    graphics.lineStyle(2, 0xFFFFFF);
    graphics.pivot.y = graphics.height;
    graphics.drawRect(-37.5, 75, 75, -150);
    jgl.pixi.graphicsContainer.addChild(graphics);
    var graphics = new PIXI.Graphics();
    graphics.beginFill(0x808080);
    graphics.lineStyle(2, 0xFFFFFF);
    graphics.pivot.y = graphics.height;
    graphics.drawRect(-37.5, 75, 75, height*-1);
    jgl.pixi.graphicsContainer.addChild(graphics);
  }

}

function getResponse() {
  taskblock = addTaskBlock(1,1);
  jgl.trial.key = jgl.event.key.keyCode;
  if (jgl.trial.key == 49 && jgl.trial.center==1 && jgl.trial.difference > 0) {
    console.log('Correct');
    jgl.trial.correct = 1;
    jumpSegment();
  }else if (jgl.trial.key == 50 && jgl.trial.center==1 && jgl.trial.difference < 0){
    console.log('Correct');
    jgl.trial.correct = 1;
    jumpSegment();
  }else if (jgl.trial.key == 49 && jgl.trial.center!=1 && jgl.trial.difference < 0){
  console.log('Correct');
  jgl.trial.correct = 1;
  jumpSegment();
  }else if (jgl.trial.key == 50 && jgl.trial.center!=1 && jgl.trial.difference > 0){
  console.log('Correct');
  jgl.trial.correct = 1;
  jumpSegment();
  }else{
    console.log('Incorrect');
    jgl.trial.correct = 0;
    jumpSegment();
  }
}
