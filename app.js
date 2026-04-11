// PDA Configuration
let startState = 'q0';
let acceptStates = ['q2'];
let initialStackSymbol = 'Z0';

let transitions = [];

// Simulation State
let simState = {
    currentState: '',
    stack: [],
    inputString: '',
    headPosition: 0,
    status: 'idle', // idle, running, accepted, rejected
    playInterval: null
};

// DOM Elements
const els = {
    // Definition
    startState: document.getElementById('start-state'),
    acceptStates: document.getElementById('accept-states'),
    initStack: document.getElementById('init-stack'),
    
    tCurrState: document.getElementById('t-curr-state'),
    tInput: document.getElementById('t-input'),
    tStackTop: document.getElementById('t-stack-top'),
    tNextState: document.getElementById('t-next-state'),
    tStackPush: document.getElementById('t-stack-push'),
    btnAddTransition: document.getElementById('add-transition-btn'),
    transitionsList: document.getElementById('transitions-list'),
    btnLoadPreset: document.getElementById('load-preset-btn'),

    // Simulation
    inputString: document.getElementById('input-string'),
    btnLoadInput: document.getElementById('load-input-btn'),
    btnStep: document.getElementById('btn-step'),
    btnPlay: document.getElementById('btn-play'),
    btnPause: document.getElementById('btn-pause'),
    btnReset: document.getElementById('btn-reset'),
    simStatus: document.getElementById('sim-status'),
    
    tapeContainer: document.getElementById('tape-container'),
    currentStateBubble: document.getElementById('current-state-bubble'),
    stackItems: document.getElementById('stack-items'),
    eventLog: document.getElementById('event-log')
};

// Initialization
function init() {
    els.btnAddTransition.addEventListener('click', addTransition);
    els.btnLoadPreset.addEventListener('click', loadPreset);
    els.btnLoadInput.addEventListener('click', loadInput);
    els.btnStep.addEventListener('click', step);
    els.btnPlay.addEventListener('click', play);
    els.btnPause.addEventListener('click', pause);
    els.btnReset.addEventListener('click', resetSimulation);
    
    // Sync main config fields
    els.startState.addEventListener('change', (e) => startState = e.target.value.trim());
    els.acceptStates.addEventListener('change', (e) => acceptStates = e.target.value.split(',').map(s => s.trim()));
    els.initStack.addEventListener('change', (e) => initialStackSymbol = e.target.value.trim());

    // Update variables on load
    startState = els.startState.value.trim();
    acceptStates = els.acceptStates.value.split(',').map(s => s.trim());
    initialStackSymbol = els.initStack.value.trim();
}

// Definition Logic
function addTransition() {
    const t = {
        currState: els.tCurrState.value.trim(),
        input: els.tInput.value.trim() || 'e',
        pop: els.tStackTop.value.trim(),
        nextState: els.tNextState.value.trim(),
        push: els.tStackPush.value.trim() || 'e'
    };

    if (!t.currState || !t.pop || !t.nextState) {
        alert("State, Pop, and Next State fields are required!");
        return;
    }

    transitions.push(t);
    renderTransitions();
    
    // Clear inputs
    els.tCurrState.value = '';
    els.tInput.value = '';
    els.tStackTop.value = '';
    els.tNextState.value = '';
    els.tStackPush.value = '';
}

function removeTransition(index) {
    transitions.splice(index, 1);
    renderTransitions();
}

function renderTransitions() {
    els.transitionsList.innerHTML = '';
    transitions.forEach((t, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${t.currState}</td>
            <td>${t.input}</td>
            <td>${t.pop}</td>
            <td>${t.nextState}</td>
            <td>${t.push}</td>
            <td><button class="delete-btn" onclick="removeTransition(${index})">X</button></td>
        `;
        els.transitionsList.appendChild(tr);
    });
}

function loadPreset() {
    els.startState.value = 'q0';
    els.acceptStates.value = 'q1';
    els.initStack.value = 'Z0';
    
    startState = 'q0';
    acceptStates = ['q1'];
    initialStackSymbol = 'Z0';
    
    transitions = [
        { currState: 'q0', input: 'a', pop: 'Z0', nextState: 'q0', push: 'aZ0' },
        { currState: 'q0', input: 'a', pop: 'a', nextState: 'q0', push: 'aa' },
        { currState: 'q0', input: 'b', pop: 'a', nextState: 'q1', push: 'e' },
        { currState: 'q1', input: 'b', pop: 'a', nextState: 'q1', push: 'e' },
        { currState: 'q1', input: 'e', pop: 'Z0', nextState: 'q2', push: 'Z0' } // Optional pop empty to accept by empty stack/final state
    ];
    // update accept states to match preset actually ending in q2 or matching
    els.acceptStates.value = 'q1, q2';
    acceptStates = ['q1', 'q2'];

    renderTransitions();
    log("Loaded a^n b^n preset.", 'normal');
}

// Simulation Logic
function loadInput() {
    resetSimulation();
    simState.inputString = els.inputString.value.trim();
    simState.headPosition = 0;
    simState.currentState = startState;
    simState.stack = [initialStackSymbol];
    simState.status = 'idle';
    updateStatusUI();

    els.btnStep.disabled = false;
    els.btnPlay.disabled = false;
    els.btnPause.disabled = true;

    renderTape();
    renderState();
    renderStack();
    els.eventLog.innerHTML = '';
    log("Input loaded. Ready to simulate.", 'normal');
}

function resetSimulation() {
    pause();
    simState.currentState = '';
    simState.stack = [];
    simState.headPosition = 0;
    simState.status = 'idle';
    updateStatusUI();
    
    els.btnStep.disabled = true;
    els.btnPlay.disabled = true;
    els.btnPause.disabled = true;
    
    els.tapeContainer.innerHTML = '';
    els.currentStateBubble.innerHTML = '-';
    els.stackItems.innerHTML = '';
    els.eventLog.innerHTML = '';
}

function updateStatusUI() {
    els.simStatus.textContent = simState.status.toUpperCase();
    els.simStatus.className = `status-text ${simState.status}`;
}

function log(msg, type = 'normal') {
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    entry.textContent = msg;
    els.eventLog.appendChild(entry);
    els.eventLog.scrollTop = els.eventLog.scrollHeight;
}

function step() {
    if (simState.status === 'accepted' || simState.status === 'rejected') {
        log("Simulation already finished.", 'error');
        return;
    }

    simState.status = 'running';
    updateStatusUI();

    const currentInputChar = simState.headPosition < simState.inputString.length 
        ? simState.inputString[simState.headPosition] 
        : 'e'; // 'e' for epsilon (end of string or epsilon transition)

    const stackTop = simState.stack.length > 0 ? simState.stack[simState.stack.length - 1] : null;

    if (!stackTop) {
        log("Stack is empty. Halting.", 'error');
        checkAcceptance();
        return;
    }

    // Find applicable transition
    let possibleTransitions = transitions.filter(t => 
        t.currState === simState.currentState &&
        t.pop === stackTop &&
        (t.input === currentInputChar || t.input === 'e' || t.input === 'ε')
    );

    if (possibleTransitions.length === 0) {
        log(`No transition defined for State=${simState.currentState}, Input=${currentInputChar}, StackTop=${stackTop}`, 'error');
        checkAcceptance();
        return;
    }

    // For simplicity in visualization, take the first valid transition (DPDA mode)
    // Prioritize non-epsilon transition if both exist
    let t = possibleTransitions.find(pt => pt.input === currentInputChar);
    if (!t) t = possibleTransitions[0]; // Fallback to epsilon

    log(`Applying: δ(${t.currState}, ${t.input}, ${t.pop}) -> (${t.nextState}, ${t.push})`);

    // Animate Pop
    const topElement = els.stackItems.lastElementChild;
    if (topElement) {
        topElement.classList.add('popping');
    }

    // We do state updates after a slight delay to allow pop animation
    setTimeout(() => {
        // Execute transition logic
        simState.currentState = t.nextState;
        simState.stack.pop(); // Pop the top

        if (t.input !== 'e' && t.input !== 'ε') {
            simState.headPosition++;
        }

        // Push new symbols (push string means left-most character becomes new top)
        // e.g. push 'aZ0' -> pop Z0, then push Z0, then push a. That means we iterate backwards.
        if (t.push !== 'e' && t.push !== 'ε') {
            for (let i = t.push.length - 1; i >= 0; i--) {
                simState.stack.push(t.push[i]);
            }
        }

        // Render updates
        renderTape();
        renderState();
        renderStack(t.push !== 'e' && t.push !== 'ε' ? t.push.length : 0);

        // Check if finished
        if (simState.headPosition >= simState.inputString.length) {
            // we are at the end of input, but epsilon transitions might still occur
            // we check acceptance
            // For rigorous DPDA, it should halt. We can check acceptance.
        }
        
    }, 300); // 300ms matches CSS animation
}

function checkAcceptance() {
    pause();
    const isAtEnd = simState.headPosition >= simState.inputString.length;
    const isInAcceptState = acceptStates.includes(simState.currentState);
    const isStackEmpty = simState.stack.length === 0 || (simState.stack.length === 1 && simState.stack[0] === 'Z0'); // some definitions accept by empty stack or Z0

    if (isAtEnd && isInAcceptState) {
        simState.status = 'accepted';
        log("Input string ACCEPTED!", 'success');
    } else {
        simState.status = 'rejected';
        log("Input string REJECTED.", 'error');
    }
    updateStatusUI();
    els.btnStep.disabled = true;
    els.btnPlay.disabled = true;
}

function play() {
    if (simState.status === 'accepted' || simState.status === 'rejected') return;
    els.btnPlay.disabled = true;
    els.btnPause.disabled = false;
    els.btnStep.disabled = true;
    
    simState.playInterval = setInterval(() => {
        // If simulation ended, stop interval
        if (simState.status === 'accepted' || simState.status === 'rejected') {
            pause();
            return;
        }
        
        // If we processed everything and we are in an accept state, stop.
        // Or if no more transitions available.
        // We will call step, if step fails to find transition it will call checkAcceptance.
        const prevStatus = simState.status;
        const prevHead = simState.headPosition;
        const prevState = simState.currentState;
        
        step();
        
        // Safety check to prevent infinite epsilon loops
        setTimeout(() => {
            if (prevStatus === simState.status && prevHead === simState.headPosition && prevState === simState.currentState) {
                // we didn't advance, stop playing to prevent infinite loops visually
                checkAcceptance(); 
            }
        }, 350);

    }, 800);
}

function pause() {
    if (simState.playInterval) {
        clearInterval(simState.playInterval);
        simState.playInterval = null;
    }
    
    if (simState.status !== 'accepted' && simState.status !== 'rejected') {
        els.btnPlay.disabled = false;
        els.btnStep.disabled = false;
    }
    els.btnPause.disabled = true;
}

// Rendering
function renderTape() {
    els.tapeContainer.innerHTML = '';
    for (let i = 0; i < simState.inputString.length; i++) {
        const char = simState.inputString[i];
        const cell = document.createElement('div');
        cell.className = `tape-cell ${i === simState.headPosition ? 'active' : ''}`;
        cell.textContent = char;
        els.tapeContainer.appendChild(cell);
    }
    // Add epsilon cell at end
    const eCell = document.createElement('div');
    eCell.className = `tape-cell ${simState.headPosition === simState.inputString.length ? 'active' : ''}`;
    eCell.textContent = 'ε';
    els.tapeContainer.appendChild(eCell);
}

function renderState() {
    els.currentStateBubble.textContent = simState.currentState;
    els.currentStateBubble.classList.remove('pulse');
    // Trigger reflow
    void els.currentStateBubble.offsetWidth;
    els.currentStateBubble.classList.add('pulse');
}

function renderStack(numPushed = 0) {
    els.stackItems.innerHTML = '';
    // We visualize bottom to top. 
    // In DOM, display: flex column-reverse means the last element appended is at the top visually.
    simState.stack.forEach((symbol, index) => {
        const li = document.createElement('li');
        li.className = 'stack-item';
        // Only animate the newly pushed items
        if (index >= simState.stack.length - numPushed) {
            li.style.animation = 'stackPush 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        } else {
            li.style.animation = 'none'; // already there
        }
        li.textContent = symbol;
        els.stackItems.appendChild(li);
    });
}

// Event handlers context exposing
window.removeTransition = removeTransition;

// Run
window.addEventListener('DOMContentLoaded', init);
