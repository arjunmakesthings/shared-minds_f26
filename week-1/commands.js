// every spoken command the app understands, in one place — edit a phrase
// here (e.g. change 'go broad' to 'think wide') and it takes effect
// everywhere that command is recognized or displayed, including the
// always-on command list in the top-left corner.
const COMMANDS = {
  thinkBroad: {
    phrase: 'go broad',
    description: 'branch a new node outward from the anchor'
  },
  thinkDeep: {
    phrase: 'go deep',
    description: 'chain a new node forward in a line from the anchor'
  },
  delete: {
    phrase: 'delete',
    description: 'remove the anchor node and everything branching from it'
  },
  goBack: {
    phrase: 'go back',
    description: 'move the anchor to its parent'
  },
  goForward: {
    phrase: 'go forward',
    description: 'move the anchor forward along a deep chain'
  },
  changeNode: {
    phrase: 'change node',
    description: 'cycle the anchor through its siblings'
  }
};
