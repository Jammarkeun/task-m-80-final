class AttachmentHandler {
    constructor() {
        this.maxFileSize = 5 * 1024 * 1024; // 5MB
        this.allowedTypes = {
            'image/jpeg': '.jpg,.jpeg',
            'image/png': '.png',
            'application/pdf': '.pdf',
            'application/msword': '.doc,.docx',
            'application/vnd.ms-excel': '.xls,.xlsx'
        };
        this.uploadQueue = [];
        this.setupDropZone();
    }

    setupDropZone() {
        const dropZone = document.getElementById('dropZone');
        if (!dropZone) return;

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        dropZone.addEventListener('drop', (e) => {
            const files = Array.from(e.dataTransfer.files);
            this.processFiles(files);
        });
    }

    async uploadFile(taskId, file, progressCallback) {
        if (!this.validateFile(file)) return false;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('task_id', taskId);

        try {
            const xhr = new XMLHttpRequest();
            
            // Setup progress tracking
            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                    const percentComplete = (e.loaded / e.total) * 100;
                    progressCallback(percentComplete);
                }
            });

            // Return promise for upload completion
            return new Promise((resolve, reject) => {
                xhr.onload = () => {
                    if (xhr.status === 200) {
                        resolve(JSON.parse(xhr.response));
                    } else {
                        reject(new Error('Upload failed'));
                    }
                };
                xhr.onerror = () => reject(new Error('Upload failed'));
                xhr.open('POST', '/api/upload_attachment.php');
                xhr.send(formData);
            });
        } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
        }
    }

    validateFile(file) {
        if (file.size > this.maxFileSize) {
            Utils.showNotification('File size exceeds 5MB limit', 'error');
            return false;
        }

        if (!this.allowedTypes[file.type]) {
            Utils.showNotification('Invalid file type', 'error');
            return false;
        }

        return true;
    }

    async processFiles(files) {
        const validFiles = files.filter(file => this.validateFile(file));
        
        for (const file of validFiles) {
            this.uploadQueue.push(file);
        }

        this.processQueue();
    }

    async processQueue() {
        if (this.uploadQueue.length === 0) return;

        const file = this.uploadQueue[0];
        const progressBar = this.createProgressBar(file.name);

        try {
            await this.uploadFile(
                document.getElementById('taskId').value,
                file,
                (progress) => this.updateProgress(progressBar, progress)
            );
            
            Utils.showNotification(`${file.name} uploaded successfully`, 'success');
        } catch (error) {
            Utils.showNotification(`Failed to upload ${file.name}`, 'error');
        } finally {
            this.uploadQueue.shift();
            progressBar.remove();
            this.processQueue();
        }
    }

    createProgressBar(fileName) {
        const progressContainer = document.createElement('div');
        progressContainer.className = 'upload-progress';
        progressContainer.innerHTML = `
            <span>${fileName}</span>
            <div class="progress">
                <div class="progress-bar" style="width: 0%"></div>
            </div>
        `;
        document.getElementById('progressArea').appendChild(progressContainer);
        return progressContainer;
    }

    updateProgress(progressBar, percent) {
        progressBar.querySelector('.progress-bar').style.width = `${percent}%`;
    }
}
