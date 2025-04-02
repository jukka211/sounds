let letters = [];   // array to hold shapes for each word
let font;
let mic;

// Define the extra spacing between letters in pixels.
let letterSpacing = -20;

function preload() {
  font = loadFont('Arial Black.ttf');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // Initialize microphone input
  mic = new p5.AudioIn();
  mic.start();
}

function draw() {
  background(0);
  
  // Get the microphone sound level
  let micLevel = mic.getLevel();
  
  // Amplify the sound reaction
  let amplifiedLevel = micLevel * 100;  // Adjust the multiplier as needed
  
  // Map the amplified level to a threshold between 0.1 and 1.5
  let threshold = map(amplifiedLevel, 0, 1, 0.1, 1.5);
  
  // Common parameters
  let baseFontSize = 250;       // Shared font size for all words
  let lineSpacing = 200;        // Vertical space between lines
  let baseY = 300;              // y-coordinate for the first line
  
  // Define the words for each line (will be converted to uppercase)
  let words = ["da,", "da-da,", "da,", "da,", "da-da,", "da,"];
  
  // Clear the letters array for each frame
  letters = [];
  
  // Loop over each word to create its shapes and center it
  for (let i = 0; i < words.length; i++) {
    // Convert word to uppercase
    let word = words[i].toUpperCase();
    
    // Calculate the bounds of the word using the font and font size
    let bounds = font.textBounds(word, 0, 0, baseFontSize);
    
    // Calculate extra width added by letter spacing:
    // (number of letters - 1) * letterSpacing.
    // Note: here word.length gives the number of characters.
    let extraSpacing = letterSpacing * (word.length - 1);
    
    // Calculate x such that the word (including extra spacing) is centered on the canvas
    let x = (width - (bounds.w + extraSpacing)) / 2;
    // Set y-coordinate based on the line number
    let y = baseY + i * lineSpacing;
    
    // Options for textToShapes
    let options = {          
      x: x,                 
      y: y, 
      fontSize: baseFontSize,         
      sampleFactor: 0.6,     
      simplifyThreshold: threshold  
    };
    
    // Generate shapes for the word and store in the letters array.
    // The result is an array of letters; each letter is an array of contours.
    letters.push(textToShapes(font, word, options));
  }
  
  // Helper function to draw a single letter with inner contours (holes)
  // The offset parameter shifts the letter horizontally.
  function drawLetter(contours, offset) {
    if (!contours || contours.length === 0) return;
    
    fill(255);
    stroke(0);
    beginShape();
    // Draw outer contour (first set of vertices) with added offset
    for (let i = 0; i < contours[0].length; i++) {
      vertex(contours[0][i].x + offset, contours[0][i].y);
    }
    // For each additional contour, define a hole
    for (let c = 1; c < contours.length; c++) {
      beginContour();
      for (let i = 0; i < contours[c].length; i++) {
        vertex(contours[c][i].x + offset, contours[c][i].y);
      }
      endContour();
    }
    endShape(CLOSE);
  }
  
  // Loop over each word and then each letter in the word.
  // For each letter, add an offset based on its index in the word.
  for (let w = 0; w < letters.length; w++) {
    let wordLetters = letters[w];
    for (let l = 0; l < wordLetters.length; l++) {
      let offset = l * letterSpacing;
      let letterContours = wordLetters[l];
      drawLetter(letterContours, offset);
    }
  }

  // Display the current threshold value on screen
  fill(0);
  noStroke();
  textSize(16);
  text('Threshold: ' + threshold.toFixed(2), 20, 30);
}
