import { useState, useEffect } from "react";
import { PanelType } from "../../types/daad";
import "../../styles/tutorial.css";

interface TutorialSystemProps {
  onNavigate: (panel: PanelType) => void;
  currentPanel: PanelType;
}

interface TutorialStep {
  id: string;
  title: string;
  panel: PanelType;
  content: string;
  action?: string;
  highlight?: string;
  nextLabel?: string;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: "welcome",
    title: "Welcome to DAAD Builder!",
    panel: "game-info",
    content: "Welcome! This tutorial will guide you through creating your first text adventure game. DAAD Builder is a complete development environment for classic adventure games. Let's start by setting up your game's basic information.",
    action: "We're currently on the Story Information panel. This is where you define your game's title, author, and introduction.",
    nextLabel: "Let's Begin!",
  },
  {
    id: "game-info",
    title: "Story Information",
    panel: "game-info",
    content: "Every great adventure needs a compelling story. Fill in your game's title, author name, and version. The intro text is what players see when they start your game - make it engaging!",
    action: "Try typing a title like 'The Lost Temple' and adding your name as the author.",
    nextLabel: "Next: Create Locations",
  },
  {
    id: "locations-intro",
    title: "Building Your World",
    panel: "locations",
    content: "Locations (or rooms) are the places in your adventure. Players navigate between them using directional commands. Each location has a name, description, and exits to other locations.",
    action: "Click the '+ Add Location' button to create your first room. Try making a 'Forest Clearing' or 'Castle Entrance'.",
    nextLabel: "Next: Add Objects",
  },
  {
    id: "locations-exits",
    title: "Connecting Locations",
    panel: "locations",
    content: "Exits connect your locations together. Use the direction buttons (N, S, E, W, etc.) to link rooms. Players will use commands like GO NORTH or just NORTH to move between locations.",
    action: "Create at least 2 locations and connect them with an exit. For example, set the NORTH exit of one room to point to the other room.",
    nextLabel: "Next: Add Items",
  },
  {
    id: "objects-intro",
    title: "Adding Items",
    panel: "objects",
    content: "Items are objects players can interact with. They have a noun (required) like 'key' or 'sword', and an optional adjective like 'rusty' or 'golden'. Items can be takeable, wearable, or fixed in place.",
    action: "Click '+ Add Object' to create your first item. Try making a 'golden key' or a 'rusty sword'.",
    nextLabel: "Next: Learn About Vocabulary",
  },
  {
    id: "vocabulary-intro",
    title: "Teaching the Parser",
    panel: "vocabulary",
    content: "The vocabulary defines which words players can use. You need to add verbs (TAKE, USE, OPEN), nouns (KEY, DOOR), adjectives (GOLDEN, RUSTY), and adverbs (CAREFULLY, QUICKLY).",
    action: "The vocabulary is already populated with common words like TAKE, EXAMINE, and GO. You can add synonyms or new words specific to your game.",
    nextLabel: "Next: Create Rules",
  },
  {
    id: "rules-intro",
    title: "Game Logic with Rules",
    panel: "rules",
    content: "Rules are the heart of your game! They define how the game responds to player actions. Each rule has CONDITIONS (what must be true) and ACTIONS (what happens). Rules execute in order from top to bottom.",
    action: "Click '📚 Browse Templates' to see ready-made rule patterns, or '+ New Rule' to create your own from scratch.",
    nextLabel: "Next: Rule Templates",
  },
  {
    id: "rules-templates",
    title: "Using Templates",
    panel: "rules",
    content: "Templates are pre-built rules for common game mechanics. They're a great way to learn DAAD's rule system and speed up development. Browse categories like 'Object Interaction', 'Puzzles', and 'NPCs'.",
    action: "Open the template browser and add a 'Take Object' or 'Examine Object' template. You can customize the object IDs after adding it.",
    nextLabel: "Next: Understand Flags",
  },
  {
    id: "flags-intro",
    title: "Variables and State",
    panel: "flags",
    content: "Flags are variables that store game state. Use them for puzzles, tracking progress, health points, score, inventory limits, and more. Flags store numbers from 0-255.",
    action: "Flags 0-37 have special meanings in DAAD (like current location, turns taken). Create custom flags starting from ID 38 for your game's unique needs.",
    nextLabel: "Next: Add Messages",
  },
  {
    id: "messages-intro",
    title: "Game Text",
    panel: "messages",
    content: "Messages are the text shown to players. System messages (0-52) control default responses like 'You can't do that' or 'You don't see that here'. Custom messages (53+) are for your specific game content.",
    action: "System messages are already set up. Click '📋 Init System' to see the default messages. You can customize them or add new messages for your rules.",
    nextLabel: "Next: Test Your Game",
  },
  {
    id: "preview-intro",
    title: "Testing & Debugging",
    panel: "preview",
    content: "The Play Test panel lets you test your game in real-time! Select a target platform to see how it will look on different systems. Type commands just like a player would.",
    action: "Try commands like LOOK, EXAMINE OBJECT, TAKE ITEM, GO NORTH, INVENTORY. Use the platform selector to test on different retro systems!",
    nextLabel: "Next: Debug Tools",
  },
  {
    id: "debug-intro",
    title: "Advanced Debugging",
    panel: "debug",
    content: "Debug Tools help you find and fix problems. The Flag Inspector shows variable values in real-time. The Rule Logger tracks which rules fire. Breakpoints let you pause execution at specific rules.",
    action: "Open the Flag Inspector tab to see your game's flag values. This is incredibly useful for debugging puzzles and game state.",
    nextLabel: "Next: Validation",
  },
  {
    id: "validation-intro",
    title: "Validate Your Game",
    panel: "validation",
    content: "The Validation panel checks for common errors like broken exits, unreachable locations, undefined vocabulary, and missing objects. Always validate before exporting!",
    action: "Click 'Validate Game' to check for issues. Fix any warnings or errors before publishing.",
    nextLabel: "Next: Final Tips",
  },
  {
    id: "conclusion",
    title: "You're Ready!",
    panel: "game-info",
    content: "Congratulations! You've completed the tutorial. You now know the basics of creating text adventures with DAAD Builder. Here are some final tips:\n\n• Save frequently (Ctrl+S)\n• Use templates to speed up development\n• Test often in the Preview panel\n• Press F1 anytime for context help\n• Validate before exporting\n\nNow go create something amazing!",
    action: "The tutorial is complete, but your adventure is just beginning. Explore the features, experiment with rules, and have fun!",
    nextLabel: "Finish Tutorial",
  },
];

export default function TutorialSystem({ onNavigate, currentPanel }: TutorialSystemProps) {
  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showStartPrompt, setShowStartPrompt] = useState(true);

  const currentStep = TUTORIAL_STEPS[currentStepIndex];
  const progress = ((currentStepIndex + 1) / TUTORIAL_STEPS.length) * 100;

  useEffect(() => {
    // Check if user has completed tutorial before
    const tutorialCompleted = localStorage.getItem("daad_tutorial_completed");
    if (tutorialCompleted) {
      setShowStartPrompt(false);
    }
  }, []);

  const startTutorial = () => {
    setIsActive(true);
    setShowStartPrompt(false);
    setCurrentStepIndex(0);
    onNavigate(TUTORIAL_STEPS[0].panel);
  };

  const nextStep = () => {
    if (currentStepIndex < TUTORIAL_STEPS.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      onNavigate(TUTORIAL_STEPS[nextIndex].panel);
    } else {
      // Tutorial complete
      completeTutorial();
    }
  };

  const previousStep = () => {
    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1;
      setCurrentStepIndex(prevIndex);
      onNavigate(TUTORIAL_STEPS[prevIndex].panel);
    }
  };

  const skipTutorial = () => {
    setIsActive(false);
    setShowStartPrompt(false);
    localStorage.setItem("daad_tutorial_completed", "true");
  };

  const completeTutorial = () => {
    setIsActive(false);
    localStorage.setItem("daad_tutorial_completed", "true");
  };

  const restartTutorial = () => {
    setCurrentStepIndex(0);
    setIsActive(true);
    onNavigate(TUTORIAL_STEPS[0].panel);
  };

  // Show start prompt on first load
  if (showStartPrompt && !isActive) {
    return (
      <div className="tutorial-start-overlay">
        <div className="tutorial-start-dialog">
          <div className="tutorial-start-header">
            <h2>🎓 Welcome to DAAD Builder!</h2>
          </div>
          <div className="tutorial-start-body">
            <p>Would you like to take a guided tutorial? It will walk you through:</p>
            <ul>
              <li>Creating your first adventure game</li>
              <li>Building locations and adding items</li>
              <li>Writing rules for game logic</li>
              <li>Testing and debugging your game</li>
            </ul>
            <p className="tutorial-start-note">
              The tutorial takes about 10 minutes. You can skip or exit at any time.
            </p>
          </div>
          <div className="tutorial-start-footer">
            <button className="tutorial-btn tutorial-btn-secondary" onClick={skipTutorial}>
              Skip Tutorial
            </button>
            <button className="tutorial-btn tutorial-btn-primary" onClick={startTutorial}>
              Start Tutorial
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isActive) {
    return (
      <button
        className="tutorial-restart-btn"
        onClick={restartTutorial}
        title="Restart Tutorial"
      >
        🎓
      </button>
    );
  }

  return (
    <div className="tutorial-overlay">
      <div className="tutorial-panel">
        {/* Header */}
        <div className="tutorial-header">
          <div className="tutorial-header-content">
            <span className="tutorial-step-number">
              Step {currentStepIndex + 1} of {TUTORIAL_STEPS.length}
            </span>
            <h3>{currentStep.title}</h3>
          </div>
          <button className="tutorial-close" onClick={skipTutorial} title="Exit Tutorial">
            ✕
          </button>
        </div>

        {/* Progress Bar */}
        <div className="tutorial-progress-container">
          <div className="tutorial-progress-bar" style={{ width: `${progress}%` }} />
        </div>

        {/* Content */}
        <div className="tutorial-content">
          <p className="tutorial-description">{currentStep.content}</p>
          {currentStep.action && (
            <div className="tutorial-action">
              <strong>👉 Try this:</strong>
              <p>{currentStep.action}</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="tutorial-nav">
          <button
            className="tutorial-btn tutorial-btn-secondary"
            onClick={previousStep}
            disabled={currentStepIndex === 0}
          >
            ← Previous
          </button>
          <button className="tutorial-btn tutorial-btn-skip" onClick={skipTutorial}>
            Skip Tutorial
          </button>
          <button
            className="tutorial-btn tutorial-btn-primary"
            onClick={nextStep}
          >
            {currentStep.nextLabel || "Next →"}
          </button>
        </div>
      </div>
    </div>
  );
}
