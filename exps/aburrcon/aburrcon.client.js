
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

  // Start the real task: 20 trial blocks
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
  
  if (runtype=="high"){
    task.parameters.posdiff = [-15, -11, -9, 9, 11, 15];
    window.posdiff = [-15, -11, -9, 9, 11, 15];
  } else{
    task.parameters.possdiff = [-2, -5, -9, 9, 5, 2];
    window.posdiff = [-2, -5, -9, 9, 5, 2];
  }

  // Task Variables which get set on each trial
  taskblock.variables = {};
  taskblock.variables.key = NaN;
  taskblock.variables.correct = NaN;
  taskblock.variables.difference = NaN;
  taskblock.variables.initialConfidence = NaN;
  taskblock.variables.confidence = NaN;
 

  // Segment timing
  taskblock.segnames = ['fixation','stim1','ISI', 'stim2', "response", "confdence", "ITI"];
  taskblock.segmin = [1000, 10, 500, 10, 2000, 20000, 1000];
  taskblock.segmax = [1000, 10, 500, 10, 2000, 20000, 1000];

  // Responses - which segments should we look for a response.
  taskblock.response = [0, 0, 0, 0, 1, 1, 0];

  // Trials
  taskblock.numTrials = numTrials; // Specify number of trials according to input.

  // Keys
  taskblock.keys = [49,50]; // (check w/ http://keycode.info/)

  return taskblock
}

let fix, tex, texSprite, showResp, feedback_text;

function startTrial() {
  imgNames = ['face', 'jetplane', 'elephant', 'sand', 'lawn', 'dirt', 'tulips', 'fireworks', 'bananas'];
  layerNames = ['pool1', 'pool2', 'pool4'];
  pool_sizes = ['1x1', '2x2', '4x4'];

  // Randomly select an image to show on each trial.
  jgl.trial.img_idx = Math.floor(Math.random()*imgNames.length);
  jgl.trial.img_name = imgNames[jgl.trial.img_idx];

  // Randomly select a distractor layer to show on each trial
  jgl.trial.layer_idx = Math.floor(Math.random()*layerNames.length);
  jgl.trial.layer_name = layerNames[jgl.trial.layer_idx];

  // Randomly select a pooling size to show on each trial.
  jgl.trial.pool_idx = Math.floor(Math.random()*pool_sizes.length);
  jgl.trial.poolsize = pool_sizes[jgl.trial.pool_idx]; 
  console.log('Image: ' + jgl.trial.img_name + '; Layer: ' + jgl.trial.layer_name + '; pool_size: ' + jgl.trial.poolsize);

  // Randomly select the position (1,2, or 3) for the target.
  jgl.trial.target_position = Math.floor(Math.random()*3);

  // Randomly select whether the original will be present on this trial.
  jgl.trial.origPresent = Math.floor(Math.random()*2);

}


function startSegment() {
  ecc = 250; // distance from center of visual field to place images
  scl = 0.5; // scale factor to stretch / shrink images

  // Create temporary variables to track fixation color.
  jgl.active.fix = 0;
  jgl.active.fixColor = 0xFFFFFF;
  jgl.active.text = NaN;
  console.log(jgl.trial.segname);
  switch (jgl.trial.segname){
    case 'delay':
      jgl.active.fix=1;
      break; 
    case 'stim':
      jgl.active.fix=1;

      xPos = [0, -ecc*Math.cos(30*Math.PI/180), ecc*Math.cos(30*Math.PI/180)];
      yPos = [-ecc, ecc*Math.sin(30*Math.PI/180), ecc*Math.sin(30*Math.PI/180)];
      distLocs = math.setDifference([0,1,2], [jgl.trial.target_position]);

      // Load and display images
      texDir = 'exps/texOdd/color/textures';
      origDir = 'exps/texOdd/color/originals';
      distPath = texDir + '/' + jgl.trial.poolsize + '_' + jgl.trial.layer_name + '_' + jgl.trial.img_name;
      texD1 = jglCreateTexture(distPath + '_smp1.png');
      texD2 = jglCreateTexture(distPath + '_smp2.png');

      if (jgl.trial.origPresent==1){
        texOdd= jglCreateTexture(origDir + '/' + jgl.trial.img_name + '.png');
      } else {
        texOdd = jglCreateTexture(distPath + '_smp3.png');
      }
      texSprite1 = jglBltTexture(texD1,xPos[distLocs[0]], yPos[distLocs[0]],0, scale=scl);
      texSprite3 = jglBltTexture(texOdd,xPos[jgl.trial.target_position], yPos[jgl.trial.target_position],0, scale=scl);
      texSprite2 = jglBltTexture(texD2,xPos[distLocs[1]], yPos[distLocs[1]],0, scale=scl);

      //
      showResp = false;

      break;
    case 'feedback':
      jgl.active.fix=1;
      jglDestroy(texSprite1); jglDestroy(texSprite3); jglDestroy(texSprite2);
      if( jgl.trial.correct == 1 ){
        jgl.active.fixColor=0x00FF00; // green for correct
      } else{
        jgl.active.fixColor=0xFF0000; // red for incorrect
      }
      break;
    case 'iti':
      jgl.active.fix=1;
      jglDestroy(feedback_text);
      break;
  }
}

function updateScreen() { 
  // Draw fiation cross
  if (jgl.active.fix) {
    if (fix!=undefined){
      fix.destroy();
    }
    fix=jglFixationCross(undefined, undefined, jgl.active.fixColor,[0,0]);
  } 
  
  // Delay segment
  if (jgl.trial.segname == 'delay') {
  }


  // Stimulus segment

  // Feedback segment (draw text feedback to screen)
  if (jgl.trial.segname == 'feedback' && !showResp){
    showResp = true;
    if (jgl.trial.correct == 1){
      jglTextSet('Arial', 1, '#00ff00');
      feedback_text=jglTextDraw("Correct response",0,-2);
      jgl.active.fixColor=0x00FF00;
    } else {
      jglTextSet('Arial', 1, '#ff0000');
      feedback_text=jglTextDraw('Incorrect response', 0, -2);
      jgl.active.fixColor=0xFF0000;
    }
  }
}

function getResponse() {
  taskblock = addTaskBlock(1,1);
  jgl.trial.key = jgl.event.key.keyCode;
  //console.log(jgl.trial.key);
  //console.log(taskblock.keys[jgl.trial.target_position]);
  if (jgl.trial.key == taskblock.keys[jgl.trial.target_position]) {
    console.log('Correct');
    jgl.trial.correct = 1;
    jumpSegment();
  }
  else{
    console.log('Incorrect :(');
    jgl.trial.correct = 0;
    jumpSegment();
  }
}
