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
    document.getElementById('continueBtn').addEventListener('click', function() {
        if (clicked.size === lessons.length) {
            window.location.href = "/learn/beverages"; // or whatever is next
        }
    });
});