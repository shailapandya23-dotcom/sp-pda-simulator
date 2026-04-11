# Pushdown Automaton (PDA) Simulator

A beautiful, interactive web application designed to visually simulate the operation of a Deterministic Pushdown Automaton (DPDA). This project helps learners and enthusiasts understand how PDAs evaluate context-free languages through states, transitions, and stack operations.

## Features

- 🎨 **Premium Pink & White Theme**: A modern glassmorphism design that provides a stunning first impression. 
- ⚙️ **Custom Machine Definition**: Allows you to easily define starting states, accept states, and an initial stack symbol.
- 🔀 **Dynamic Transitions Table**: Create, view, and delete transitioning rules for `(Current State, Input Symbol, Top of Stack) -> (Next State, Push Symbols)`.
- 📊 **Visual Stack Mechanics**: Watch the PDA stack push and pop elements in real-time with fluid animations.
- 🎞️ **Step-by-Step Simulation**: Enter an input string and use the playback controls (Play, Pause, Step Forward) to track the exact state shifts and see whether a string is Accepted or Rejected.
- 🚀 **Zero Dependencies**: Built entirely with Vanilla JavaScript, HTML, and CSS. No `npm`, Node.js, or complex setups required!

## How to Use Locally

1. Clone or download this repository.
2. Navigate to the project folder.
3. Open `index.html` directly in any modern web browser (Chrome, Edge, Firefox, etc.).
4. Click **"Load a^n b^n Preset"** to immediately test a pre-configured PDA, or enter your own custom states and transitions on the left panel!

## Simulation Example (a^n b^n)

The application comes with a built-in preset to evaluate the string $a^n b^n$ (e.g., `aabb` or `aaabbb`). 
1. Load the preset.
2. Enter an input like `aabb` in the Simulation field and click "Load".
3. Click "Play" or use "Step Forward".
4. Watch as the machine reads `a` and pushes to the stack, transitions state upon reading `b`, and pops from the stack until empty and accepted!

## Author

Created for an educational assignment to demonstrate how context-free languages are recognized by computational machines.
