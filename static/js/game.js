function setPlayIcon() {
    startPauseButton.innerHTML = '&#9658;'; // Play icon
}

function setPauseIcon() {
    startPauseButton.innerHTML = '&#10074;&#10074;'; // Pause icon
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

let packages = [];
let isGameRunning = false;
let filteredMaliciousScore = 0;
let filteredBenignScore = 0;
let firewallCode = '';
let startTime = 0;
let elapsedTime = 0;
let timerInterval;

const packagesContainer = document.getElementById('packages-container');
const startPauseButton = document.getElementById('start-pause');
const scoreElement = document.getElementById('score-value');
const firewallCodeElement = document.getElementById('firewall-code');
const modal = document.getElementById('package-modal');
const modalContent = document.getElementById('package-details');
const closeModal = document.getElementsByClassName('close')[0];
const errorMessageElement = document.createElement('div');
errorMessageElement.id = 'error-message';
document.body.appendChild(errorMessageElement);
const timerElement = document.getElementById('timer');
const snippetList = document.getElementById('snippet-list');
const helpButton = document.getElementById('help-button');
const helpModal = document.getElementById('help-modal');
const helpContent = document.getElementById('help-content');
const closeHelpModal = helpModal.getElementsByClassName('close')[0];

function populateSnippetLibrary() {
    const snippetFiles = ['sql_injection_filter.js', 'xss_filter.js', 'path_traversal_filter.js'];
    snippetFiles.forEach((file, index) => {
        const snippetElement = document.createElement('div');
        snippetElement.className = 'snippet';
        snippetElement.textContent = file.replace('_', ' ').replace('.js', '');
        snippetElement.addEventListener('click', () => insertSnippet(file));
        snippetList.appendChild(snippetElement);
    });
}

function insertSnippet(file) {
    fetch(`/api/snippets/${file}`)
        .then(response => response.text())
        .then(code => {
            editor.setValue(code);
            editor.focus();
        })
        .catch(error => console.error('Error loading snippet:', error));
}

function startTimer() {
    startTime = Date.now() - elapsedTime;
    timerInterval = setInterval(updateTimer, 1000);
}

function pauseTimer() {
    clearInterval(timerInterval);
}

function updateTimer() {
    const currentTime = Date.now();
    elapsedTime = currentTime - startTime;
    const minutes = Math.floor(elapsedTime / 60000);
    const seconds = Math.floor((elapsedTime % 60000) / 1000);
    timerElement.textContent = `Time: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function startGame() {
    isGameRunning = true;
    setPauseIcon();
    movePackages();
    startTimer();
    updateScoreDisplay();
}

function pauseGame() {
    isGameRunning = false;
    setPlayIcon();
    pauseTimer();
}

function movePackages() {
    if (!isGameRunning) return;

    const firewallPosition = packagesContainer.clientWidth * 0.5; // Middle of the screen

    packages.forEach(pkg => {
        if (pkg.blocked) return;

        const packageLeft = parseFloat(pkg.element.style.left);
        if (packageLeft < firewallPosition) {
            pkg.element.style.left = `${packageLeft + 1}px`;
        } else if (packageLeft >= firewallPosition && !pkg.applied) {
            const allowed = checkPackage(pkg);
            if (!allowed) {
                // Package is blocked, keep it at the firewall
                pkg.element.style.left = `${firewallPosition}px`;
                pkg.blocked = true;
            } else {
                pkg.element.style.left = `${packageLeft + 1}px`;
            }
            updateScore(pkg, allowed);
        } else if (packageLeft > packagesContainer.clientWidth) {
            removePackage(pkg);
        } else {
            pkg.element.style.left = `${packageLeft + 1}px`;
        }
    });

    if (Math.random() < 0.01) {
        createPackage();
    }

    requestAnimationFrame(movePackages);
}

function createPackage() {
    fetch('/api/packages')
        .then(response => response.json())
        .then(data => {
            const packageData = data[Math.floor(Math.random() * data.length)];
            const packageElement = document.createElement('div');
            const isMalicious = 'vulnerability' in packageData;
            packageElement.className = `package ${isMalicious ? 'malicious' : ''}`;
            packageElement.style.left = '0px';
            packageElement.style.top = `${Math.random() * (packagesContainer.clientHeight - 40)}px`;
            packageElement.innerHTML = `${packageData.method} ${packageData.url}`;
            packageElement.addEventListener('click', () => showPackageDetails(packageData));
            packagesContainer.appendChild(packageElement);

            packages.push({
                element: packageElement,
                data: packageData,
                applied: false,
                blocked: false
            });
        });
}

function removePackage(pkg) {
    packages = packages.filter(p => p !== pkg);
    pkg.element.remove();
}

function updateScore(pkg, allowed) {
    if (!pkg.applied) {
        if (pkg.data.vulnerability && !allowed) {
            filteredMaliciousScore += 1;
        } else if (!pkg.data.vulnerability && !allowed) {
            filteredBenignScore += 1;
        }
        pkg.applied = true;
        updateScoreDisplay();
    }
}

function updateScoreDisplay() {
    scoreElement.textContent = `Filtered Malicious: ${filteredMaliciousScore} | Filtered Benign: ${filteredBenignScore}`;
}

function checkPackage(pkg) {
    try {
        const checkPackageFunction = new Function('package', `
            ${firewallCode}
            return check_package(package);
        `);
        return checkPackageFunction(pkg.data);
    } catch (error) {
        console.error('Error in firewall code:', error);
        showErrorMessage('Error in firewall code: ' + error.message);
        return true; // Allow package by default in case of error
    }
}

function clearErrorMessage() {
    errorMessageElement.style.display = 'none';
    errorMessageElement.textContent = '';
}

function showErrorMessage(message) {
    errorMessageElement.textContent = message;
    errorMessageElement.style.display = 'block';
    errorMessageElement.style.backgroundColor = message.includes('successfully') ? '#d4edda' : '#f8d7da';
    errorMessageElement.style.color = message.includes('successfully') ? '#155724' : '#721c24';
    errorMessageElement.style.padding = '10px';
    errorMessageElement.style.marginTop = '10px';
    errorMessageElement.style.borderRadius = '4px';
}

function showPackageDetails(packageData) {
    const { vulnerability, explanation, mitigate, ...otherData } = packageData;
    let content = `<h3>Package Details:</h3><pre id="package-body">${JSON.stringify(otherData, null, 2)}</pre>`;
    if (vulnerability) {
        content += `
            <p><strong>Vulnerability:</strong> ${vulnerability}</p>
            <p><strong>Explanation:</strong> ${explanation}</p>
            <p><strong>Mitigation:</strong> ${mitigate}</p>
        `;
    }
    modalContent.innerHTML = content;
    modal.style.display = 'block';
}

startPauseButton.addEventListener('click', () => {
    if (isGameRunning) {
        pauseGame();
    } else {
        startGame();
    }
});

closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

helpButton.addEventListener('click', () => {
    helpContent.innerHTML = `
        <h2>How to Write Firewall Code</h2>
        <p>Your firewall code should be a function named <code>check_package</code> that takes a single argument <code>package</code>. This function should return <code>true</code> to allow the package or <code>false</code> to block it.</p>
        <h3>Available Package Properties</h3>
        <ul>
            <li><code>package.method</code>: The HTTP method (e.g., GET, POST)</li>
            <li><code>package.url</code>: The URL of the request</li>
            <li><code>package.headers</code>: An object containing request headers</li>
            <li><code>package.body</code>: The body of the request (for POST requests)</li>
        </ul>
        <h3>Sample Code</h3>
        <pre>
function check_package(package) {
    // Block all POST requests
    if (package.method === 'POST') {
        return false;
    }

    // Block requests to /admin
    if (package.url.includes('/admin')) {
        return false;
    }

    // Block requests with suspicious query parameters
    if (package.url.includes("' OR '1'='1")) {
        return false;
    }

    // Allow all other requests
    return true;
}
        </pre>
    `;
    helpModal.style.display = 'block';
});

closeHelpModal.addEventListener('click', () => {
    helpModal.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target === helpModal) {
        helpModal.style.display = 'none';
    }
});

// Initialize the game
fetch('/api/firewall')
    .then(response => response.json())
    .then(data => {
        console.log('Received default firewall code:', data);
        firewallCode = data.code;
        console.log('Set firewallCode:', firewallCode);
        editor.setValue(firewallCode);
        editor.refresh();
        updateScoreDisplay(); // Initialize score display
        setPauseIcon(); // Set initial button state
    })
    .catch(error => {
        console.error('Error fetching default firewall code:', error);
    });

// Set up CodeMirror
const editor = CodeMirror.fromTextArea(firewallCodeElement, {
    mode: 'javascript',
    theme: 'monokai',
    lineNumbers: true,
    autofocus: true
});

editor.on('change', debounce(() => {
    firewallCode = editor.getValue();
    try {
        // Test the firewall code
        new Function('package', `
            ${firewallCode}
            check_package({});
        `)();
        clearErrorMessage();
        showErrorMessage('Firewall code updated successfully!');
    } catch (error) {
        console.error('Error updating firewall code:', error);
        showErrorMessage('Error updating firewall code: ' + error.message);
    }
}, 1000)); // 1000ms debounce time

// Start the game automatically after loading
window.addEventListener('load', () => {
    startGame();
    populateSnippetLibrary();
});