document.addEventListener('DOMContentLoaded', () => {
    const profileForm = document.getElementById('profileForm');
    const userId = localStorage.getItem('userId');

    loadUserProfile();

    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = {
            user_id: userId,
            fullname: document.getElementById('usernameInput').value,
            email: document.getElementById('emailInput').value,
            timezone: document.getElementById('timezoneSelect').value
        };

        try {
            const response = await fetch('../api/profile.php', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            if (response.ok) {
                alert('Profile updated successfully!');
                loadUserProfile();
            } else {
                alert(data.message || 'Failed to update profile. Please try again.');
            }
        } catch (error) {
            console.error('Profile update error:', error);
            alert('Failed to update profile. Please check your connection and try again.');
        }
    });

    async function loadUserProfile() {
        try {
            const response = await fetch(`../api/get_profile.php?user_id=${userId}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            if (data) {
                document.getElementById('usernameInput').value = data.fullname;
                document.getElementById('emailInput').value = data.email;
                document.getElementById('timezoneSelect').value = data.timezone || 'UTC';

                if (data.profile_image) {
                    const imageUrl = data.profile_image;
                    document.getElementById('profileImage').src = imageUrl;
                    localStorage.setItem('userProfileImage', imageUrl);
                }
            }
        } catch (error) {
            console.error('Profile load error:', error);
        }
    }

    // Handle profile image upload
    const imageUploadButton = document.querySelector('.upload-image');
    const imageInput = document.createElement('input');
    imageInput.type = 'file';
    imageInput.accept = 'image/*';

    imageUploadButton.addEventListener('click', () => {
        imageInput.click();
    });

    imageInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('profile_image', file);
            formData.append('user_id', userId);

            try {
                const response = await fetch('../api/profile.php', {
                    method: 'POST',
                    body: formData,
                });

                const data = await response.json();
                if (response.ok) {
                    const imageUrl = data.image_url;
                    document.getElementById('profileImage').src = imageUrl;
                    localStorage.setItem('userProfileImage', imageUrl);
                    alert('Profile image updated successfully!');
                } else {
                    alert(data.message || 'Failed to upload profile image. Please try again.');
                }
            } catch (error) {
                console.error('Profile image upload error:', error);
                alert('Failed to upload profile image. Please check your connection and try again.');
            }
        }
    });

    // Populate timezone options
    const timezoneSelect = document.getElementById('timezoneSelect');
    const timezones = moment.tz.names();
    timezones.forEach(timezone => {
        const option = document.createElement('option');
        option.value = timezone;
        option.textContent = timezone;
        timezoneSelect.appendChild(option);
    });
});
