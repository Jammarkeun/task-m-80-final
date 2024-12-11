document.addEventListener('DOMContentLoaded', () => {
    const welcomeMessage = document.getElementById('welcomeMessage');
    const fullname = localStorage.getItem('fullname');

    if (fullname) {
        welcomeMessage.textContent = `Welcome, ${fullname}!`;
    } else {
        welcomeMessage.textContent = 'Welcome!';
    }
});
