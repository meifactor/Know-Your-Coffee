let clicked = new Set();

function showComponent(idx) {
    const lesson = lessons[idx];
    document.getElementById('componentTitle').innerText = lesson.title;
    document.getElementById('componentDesc').innerHTML = lesson.content;
    // Use a GIF/image per lesson if you want, or set a placeholder:
    document.getElementById('componentGif').src = lesson.gif || "";
    document.getElementById('learnPanel').style.display = 'flex';
    clicked.add(idx);
    document.getElementById('btn-' + idx).classList.add('clicked');
    checkAllClicked();
}

function closePanel() {
    document.getElementById('learnPanel').style.display = 'none';
}

function checkAllClicked() {
    if (clicked.size === lessons.length) {
        document.getElementById('continueBtn').disabled = false;
        document.getElementById('continueBtn').innerText = "Continue";
    }
}

// Optionally, handle continue button click:
document.addEventListener('DOMContentLoaded', function() {
    // Show the first component (espresso) automatically
    showComponent(0);
    // Disable continue button initially
    document.getElementById('continueBtn').disabled = true;
    document.getElementById('continueBtn').innerText = "View all components to continue";
    document.getElementById('continueBtn').addEventListener('click', function(e) {
        if (clicked.size !== lessons.length) {
            e.preventDefault();
        }
        // If all clicked, allow navigation (handled by href)
    });
});