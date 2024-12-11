document.addEventListener('DOMContentLoaded', () => {
    const dashboardProfileImage = document.getElementById('dashboardProfileImage').querySelector('img');
    
    // Load profile image from localStorage
    const storedImageUrl = localStorage.getItem('userProfileImage');
    if (storedImageUrl) {
        dashboardProfileImage.src = storedImageUrl;
    }

    // Add CSS styles for the profile image
    dashboardProfileImage.style.width = '40px';
    dashboardProfileImage.style.height = '40px';
    dashboardProfileImage.style.borderRadius = '50%';
    dashboardProfileImage.style.objectFit = 'cover';
});
