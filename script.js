const themeToggleBtn = document.getElementById('themeToggle');
        const themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
        const themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');
        const html = document.documentElement;
        const body = document.body;

        const savedTheme = localStorage.getItem('theme') || 'dark';

        if (savedTheme === 'light') {
            enableLightMode();
        }

        themeToggleBtn.addEventListener('click', toggleTheme);

        function toggleTheme() {
            if (html.classList.contains('dark')) {
                enableLightMode();
                localStorage.setItem('theme', 'light');
            } else {
                enableDarkMode();
                localStorage.setItem('theme', 'dark');
            }
        }

        function enableLightMode() {
            html.classList.remove('dark');
            body.classList.add('light-mode');
            body.classList.remove('bg-black', 'text-white');
            body.classList.add('bg-whitish', 'text-blackish');
            
            document.querySelectorAll('.border-white').forEach(element => {
                element.classList.remove('border-white');
                element.classList.add('border-blackish');
            });
            
            document.querySelectorAll('button.border-white, a.border-white').forEach(element => {
                element.classList.remove('border-white', 'hover:bg-white', 'hover:text-black');
                element.classList.add('border-blackish', 'hover:bg-blackish', 'hover:text-white');
            });
            
            const urlInput = document.getElementById('urlInput');
            if (urlInput) {
                urlInput.style.color = '#333';
                urlInput.classList.remove('text-white');
                urlInput.classList.add('text-blackish');
            }
            
            document.getElementById('notification').classList.remove('border-white', 'bg-black', 'text-white');
            document.getElementById('notification').classList.add('border-blackish', 'bg-whitish', 'text-blackish');
            
            themeToggleBtn.classList.remove('bg-black', 'border-white');
            themeToggleBtn.classList.add('bg-white', 'border-blackish');
            
            themeToggleDarkIcon.classList.add('hidden');
            themeToggleLightIcon.classList.remove('hidden');
        }

        function enableDarkMode() {
            html.classList.add('dark');
            body.classList.remove('light-mode');
            body.classList.remove('bg-whitish', 'text-blackish');
            body.classList.add('bg-black', 'text-white');
            
            document.querySelectorAll('.border-blackish').forEach(element => {
                element.classList.remove('border-blackish');
                element.classList.add('border-white');
            });
            
            document.querySelectorAll('button.border-blackish, a.border-blackish').forEach(element => {
                element.classList.remove('border-blackish', 'hover:bg-blackish', 'hover:text-white');
                element.classList.add('border-white', 'hover:bg-white', 'hover:text-black');
            });
            
            const urlInput = document.getElementById('urlInput');
            if (urlInput) {
                urlInput.style.color = '';
                urlInput.classList.remove('text-blackish');
                urlInput.classList.add('text-white');
            }
            
            document.getElementById('notification').classList.remove('border-blackish', 'bg-whitish', 'text-blackish');
            document.getElementById('notification').classList.add('border-white', 'bg-black', 'text-white');
            
            themeToggleBtn.classList.remove('bg-white', 'border-blackish');
            themeToggleBtn.classList.add('bg-black', 'border-white');
            
            themeToggleDarkIcon.classList.remove('hidden');
            themeToggleLightIcon.classList.add('hidden');
        }

        let currentThumbUrl = '';
        let currentVideoId = '';

        function getYouTubeID(url) {
            const patterns = [
                /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
                /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
                /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
                /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
                /youtu\.be\/([a-zA-Z0-9_-]{11})/
            ];
            
            for (let pattern of patterns) {
                let match = url.match(pattern);
                if (match) return match[1];
            }
            return null;
        }

        function getThumbnail() {
            const url = document.getElementById('urlInput').value.trim();
            const resultDiv = document.getElementById('result');
            const errorDiv = document.getElementById('error');
            const thumbnailImg = document.getElementById('thumbnail');
            const thumbnailUrlSpan = document.getElementById('thumbnailUrl');

            if (!url) {
                showError('Please enter a YouTube link!');
                return;
            }

            const videoId = getYouTubeID(url);
            
            if (!videoId) {
                showError('Invalid YouTube link!');
                return;
            }

            currentVideoId = videoId;
            currentThumbUrl = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
            
            thumbnailImg.src = currentThumbUrl;
            thumbnailUrlSpan.textContent = currentThumbUrl;
            
            resultDiv.classList.remove('hidden');
            errorDiv.classList.add('hidden');
        }

        function downloadThumbnail() {
            if (!currentThumbUrl) return;
            
            fetch(currentThumbUrl)
                .then(response => response.blob())
                .then(blob => {
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `youtube-thumbnail-${currentVideoId}.jpg`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                    
                    showNotification('Download started!');
                })
                .catch(() => {
                    alert('Failed to download image');
                });
        }

        function copyUrl() {
            if (!currentThumbUrl) return;
            
            navigator.clipboard.writeText(currentThumbUrl).then(() => {
                showNotification('URL copied successfully!');
            }).catch(() => {
                alert('Failed to copy URL');
            });
        }

        function showError(message) {
            const errorDiv = document.getElementById('error');
            errorDiv.textContent = message;
            errorDiv.classList.remove('hidden');
            document.getElementById('result').classList.add('hidden');
        }

        function showNotification(message) {
            const notification = document.getElementById('notification');
            notification.textContent = '✅ ' + message;
            notification.classList.remove('hidden');
            
            setTimeout(() => {
                notification.classList.add('hidden');
            }, 2000);
        }

        document.getElementById('urlInput').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                getThumbnail();
            }
        });

        document.getElementById('thumbnail').onerror = function() {
            if (currentVideoId) {
                this.src = `https://i.ytimg.com/vi/${currentVideoId}/hqdefault.jpg`;
                currentThumbUrl = this.src;
                document.getElementById('thumbnailUrl').textContent = this.src;
            }
        };
