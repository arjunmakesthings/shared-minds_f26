// every tunable number and color in the app, in one place. change a value
// here to reshape how mapper looks, lays out, and listens — nothing else
// needs to change. voice command phrases live in commands.js instead, since
// editing "what to say" is a different kind of change from these.
const CONFIG = {
  // how each node box looks and is drawn on the canvas
  node: {
    fontSize: 18,
    fontFamily: "'Alegreya Sans', sans-serif", // keep this in sync with style.css's font-family
    padding: 16,
    height: 50,
    borderWidth: 2,
    fillColor: '#ffffff',
    selectedFillColor: '#eeeeee', // fill when a node is clicked/selected
    borderColor: '#000000',       // also used for the connecting edges
    anchorBorderColor: '#2b6cff', // border color of the current anchor node
    textColor: '#000000'
  },

  // the canvas/camera itself
  canvas: {
    backgroundColor: '#ffffff',
    minScale: 0.1,
    maxScale: 8,
    zoomIntensity: 0.001 // how fast the scroll wheel zooms
  },

  // where new nodes are placed and how the graph settles into position
  layout: {
    branchSpacing: 220,        // world units a brand-new node starts from its parent
    goldenAngleDegrees: 137.5, // spread angle between successive "go broad" siblings
    fitMargin: 80,             // breathing room kept around the graph when auto-fitting

    // repulsion keeps any two nodes (and a node and an unrelated edge) apart;
    // link springs pull connected nodes toward a target distance instead
    repelPadding: 24,
    repelStrength: 0.5,
    linkStrength: 0.1,
    edgePadding: 16,
    edgeRepelStrength: 0.5,
    edgeCrossStep: 5,
    iterations: 200,

    // main branches off the central question are spaced far apart (distinct
    // topics); anything deeper hugs its local anchor tightly (one cluster)
    rootLinkGap: 130,
    subLinkGap: 10
  },

  // speech recognition
  voice: {
    lang: 'en-US',
    placeholderText: 'speak:',
    enterIcon: '⏎',
    restartDelay: 250,      // ms, lets the browser release audio resources between sessions
    watchdogInterval: 1000, // ms, how often the watchdog checks for activity
    watchdogTimeout: 7000,  // ms of silence from the engine before we assume it's stuck
    maxStaleRestarts: 2     // give up after this many watchdog-forced restarts in a row
  }
};
