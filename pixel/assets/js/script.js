        document.addEventListener('DOMContentLoaded', function() {
            // DOM Elements
            const dropArea = document.getElementById('dropArea');
            const fileInput = document.getElementById('fileInput');
            const selectFilesBtn = document.getElementById('selectFilesBtn');
            const fileCounter = document.getElementById('fileCounter');
            const outputFormat = document.getElementById('outputFormat');
            const searchInput = document.getElementById('searchInput');
            const processBtn = document.getElementById('processBtn');
            const imagesTable = document.getElementById('imagesTable');
            const tableBody = document.getElementById('tableBody');
            const clearAllBtn = document.getElementById('clearAllBtn');
            const downloadAllBtn = document.getElementById('downloadAllBtn');
            const shareAllBtn = document.getElementById('shareAllBtn');
            const batchActions = document.getElementById('batchActions');
            const limitNotice = document.getElementById('limitNotice');
            const closeNotice = document.getElementById('closeNotice');
            const toggleAdvanced = document.getElementById('toggleAdvanced');
            const advancedOptions = document.getElementById('advancedOptions');
            const qualitySlider = document.getElementById('quality');
            const qualityValue = document.getElementById('qualityValue');
            const resizeMode = document.getElementById('resizeMode');
            const resizeValue = document.getElementById('resizeValue');
            const dimensionsContainer = document.getElementById('dimensionsContainer');
            const resizeWidth = document.getElementById('resizeWidth');
            const resizeHeight = document.getElementById('resizeHeight');
            const previewContainer = document.getElementById('previewContainer');
            const originalPreview = document.getElementById('originalPreview');
            const enhancedPreview = document.getElementById('enhancedPreview');
            const sizeReduction = document.getElementById('sizeReduction');
            const qualityDiff = document.getElementById('qualityDiff');
            const timeSaved = document.getElementById('timeSaved');
            const compressionSlider = document.getElementById('compression');
            const compressionValue = document.getElementById('compressionValue');
            const watermarkCheckbox = document.getElementById('watermark');
            const watermarkOptions = document.getElementById('watermarkOptions');
            const watermarkText = document.getElementById('watermarkText');
            const watermarkPosition = document.getElementById('watermarkPosition');
            const watermarkColor = document.getElementById('watermarkColor');
            const watermarkBgColor = document.getElementById('watermarkBgColor');
            const watermarkSize = document.getElementById('watermarkSize');
            const watermarkPreview = document.getElementById('watermarkPreview');
            const watermarkPreviewCanvas = document.getElementById('watermarkPreviewCanvas');
            const toast = document.getElementById('toast');
            const toastMessage = document.getElementById('toastMessage');
            const privacyNotice = document.getElementById('privacyNotice');
            const closePrivacyNotice = document.getElementById('closePrivacyNotice');
            const acceptPrivacyBtn = document.getElementById('acceptPrivacyBtn');
            const learnMoreBtn = document.getElementById('learnMoreBtn');
            const usersCount = document.getElementById('usersCount');
            const imagesCount = document.getElementById('imagesCount');
            const rotationSelect = document.getElementById('rotation');
            const batchRenameInput = document.getElementById('batchRename');
            const darkModeToggle = document.getElementById('darkModeToggle');
            const imageFilter = document.getElementById('imageFilter');
            const totalFilesStat = document.getElementById('totalFilesStat');
            const totalSizeStat = document.getElementById('totalSizeStat');
            const estimatedTimeStat = document.getElementById('estimatedTimeStat');

            // State variables
            let files = [];
            let processedFiles = [];
            let thumbnailUrls = {};
            const MAX_FILES = 10;
            let privacyNoticeAccepted = localStorage.getItem('privacyNoticeAccepted') === 'true';

            // Initialize counters with starting values
            let processedImagesCount = 98902;
            let happyUsersCount = 1093;

            // Initialize resize functionality
            function initResizeFunctionality() {
                // Set initial state
                updateResizeFields();
                
                // Add event listener for resize mode change
                resizeMode.addEventListener('change', updateResizeFields);
            }

            function updateResizeFields() {
                const mode = resizeMode.value;
                
                // Reset all fields
                resizeValue.disabled = true;
                resizeWidth.disabled = true;
                resizeHeight.disabled = true;
                dimensionsContainer.style.display = 'none';
                
                // Enable appropriate fields based on mode
                if (mode === 'percentage') {
                    resizeValue.disabled = false;
                    resizeValue.placeholder = 'Percentage (e.g. 50)';
                } else if (mode === 'dimensions') {
                    dimensionsContainer.style.display = 'flex';
                    resizeWidth.disabled = false;
                    resizeHeight.disabled = false;
                }
            }

            // Dark mode functionality
            function toggleDarkMode() {
                document.body.classList.toggle('dark-mode', darkModeToggle.checked);
                localStorage.setItem('darkMode', darkModeToggle.checked);
            }

            function applyDarkModePreference() {
                const darkModeEnabled = localStorage.getItem('darkMode') === 'true';
                darkModeToggle.checked = darkModeEnabled;
                document.body.classList.toggle('dark-mode', darkModeEnabled);
            }

            // Batch rename functionality
            function generateNewFileName(originalName, pattern, index) {
                const extension = originalName.split('.').pop();
                let newName = pattern;
                
                // Replace placeholders
                newName = newName.replace(/{num}/g, (index + 1).toString().padStart(2, '0'));
                newName = newName.replace(/{date}/g, new Date().toISOString().split('T')[0]);
                newName = newName.replace(/{time}/g, new Date().toTimeString().split(' ')[0].replace(/:/g, '-'));
                
                return `${newName}.${extension}`;
            }

            function updateFileNamesPreview() {
                const pattern = batchRenameInput.value;
                if (!pattern) return;
                
                files.forEach((file, index) => {
                    const newName = generateNewFileName(file.name, pattern, index);
                    const row = tableBody.querySelector(`tr[data-index="${index}"]`);
                    if (row) {
                        const fileNameElement = row.querySelector('.file-name');
                        if (fileNameElement) {
                            fileNameElement.textContent = newName;
                            fileNameElement.title = `Will be renamed to: ${newName}`;
                            fileNameElement.style.color = '#6c5ce7';
                            fileNameElement.style.fontWeight = 'bold';
                        }
                    }
                });
            }

            // Image processing functions
            function applyRotation(canvas, degrees) {
                if (degrees === 0) return canvas;
                
                const rotatedCanvas = document.createElement('canvas');
                const ctx = rotatedCanvas.getContext('2d');
                
                if (degrees === 90 || degrees === 270) {
                    rotatedCanvas.width = canvas.height;
                    rotatedCanvas.height = canvas.width;
                } else {
                    rotatedCanvas.width = canvas.width;
                    rotatedCanvas.height = canvas.height;
                }
                
                ctx.translate(rotatedCanvas.width / 2, rotatedCanvas.height / 2);
                ctx.rotate(degrees * Math.PI / 180);
                ctx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);
                
                return rotatedCanvas;
            }

            function applyFilter(canvas, filter) {
                const ctx = canvas.getContext('2d');
                ctx.filter = getFilterValue(filter);
                ctx.drawImage(canvas, 0, 0);
                ctx.filter = 'none';
                return canvas;
            }

            function getFilterValue(filter) {
                switch(filter) {
                    case 'grayscale': return 'grayscale(100%)';
                    case 'sepia': return 'sepia(100%)';
                    case 'vintage': return 'sepia(70%) brightness(80%) contrast(120%)';
                    case 'invert': return 'invert(100%)';
                    case 'blur': return 'blur(2px)';
                    case 'sharpen': return 'contrast(150%) brightness(105%)';
                    default: return 'none';
                }
            }

            // Real-time stats
            function updateRealTimeStats() {
                if (files.length === 0) return;
                
                // Update file count
                totalFilesStat.textContent = files.length;
                
                // Calculate total size
                const totalSize = files.reduce((sum, file) => sum + file.size, 0);
                totalSizeStat.textContent = formatFileSize(totalSize);
                
                // Estimate processing time (simplified)
                const estimatedTime = files.length * 0.5; // 0.5s per file estimate
                estimatedTimeStat.textContent = `${Math.ceil(estimatedTime)}s`;
                
                // Update preview if visible
                if (previewContainer.classList.contains('visible') && files.length > 0) {
                    showPreview(files[0]);
                }
            }

            function formatFileSize(bytes) {
                if (bytes === 0) return '0 Bytes';
                const k = 1024;
                const sizes = ['Bytes', 'KB', 'MB', 'GB'];
                const i = Math.floor(Math.log(bytes) / Math.log(k));
                return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
            }

            // Show privacy notice if not accepted
            if (!privacyNoticeAccepted) {
                setTimeout(() => {
                    privacyNotice.classList.add('visible');
                }, 2000);
            }

            // Event Listeners
			selectFilesBtn.addEventListener('click', () => fileInput.click());

			fileInput.addEventListener('change', handleFileSelect);

			dropArea.addEventListener('dragover', (e) => {
				e.preventDefault();
				dropArea.classList.add('active');
			});

			dropArea.addEventListener('dragleave', () => {
				dropArea.classList.remove('active');
			});

			dropArea.addEventListener('drop', (e) => {
				e.preventDefault();
				dropArea.classList.remove('active');
				fileInput.files = e.dataTransfer.files;
				handleFileSelect({ target: fileInput });
			});

			searchInput.addEventListener('input', filterFiles);

			processBtn.addEventListener('click', processImages);

			clearAllBtn.addEventListener('click', clearAllFiles);

			downloadAllBtn.addEventListener('click', downloadAllAsZip);

			shareAllBtn.addEventListener('click', shareFiles);

			closeNotice.addEventListener('click', () => {
				limitNotice.classList.remove('visible');
			});

			closePrivacyNotice.addEventListener('click', () => {
				privacyNoticeAccepted = true;
				localStorage.setItem('privacyNoticeAccepted', 'true');
				privacyNotice.classList.remove('visible');
			});

			acceptPrivacyBtn.addEventListener('click', () => {
				privacyNoticeAccepted = true;
				localStorage.setItem('privacyNoticeAccepted', 'true');
				privacyNotice.classList.remove('visible');
			});

			learnMoreBtn.addEventListener('click', () => {
				showToast('Redirecting to privacy policy...', 'info');
				// In a real app, this would redirect to your privacy policy page
			});

            
            toggleAdvanced.addEventListener('click', () => {
                advancedOptions.classList.toggle('visible');
                toggleAdvanced.innerHTML = advancedOptions.classList.contains('visible') ? 
                    '<i class="fas fa-chevron-down"></i>' : '<i class="fas fa-chevron-up"></i>';
            });
            
            qualitySlider.addEventListener('input', () => {
                qualityValue.textContent = `${qualitySlider.value}%`;
            });
            
            compressionSlider.addEventListener('input', () => {
                compressionValue.textContent = `${compressionSlider.value}%`;
            });
            
            watermarkCheckbox.addEventListener('change', () => {
                watermarkOptions.style.display = watermarkCheckbox.checked ? 'block' : 'none';
                if (watermarkCheckbox.checked) {
                    updateWatermarkPreview();
                }
            });
            
            watermarkText.addEventListener('input', updateWatermarkPreview);
            watermarkPosition.addEventListener('change', updateWatermarkPreview);
            watermarkColor.addEventListener('input', updateWatermarkPreview);
            watermarkBgColor.addEventListener('input', updateWatermarkPreview);
            watermarkSize.addEventListener('input', updateWatermarkPreview);
            
            // Dark mode toggle
            darkModeToggle.addEventListener('change', toggleDarkMode);
            
            // Batch rename input
            batchRenameInput.addEventListener('input', updateFileNamesPreview);
            
            // Rotation and filter changes
            rotationSelect.addEventListener('change', updateRealTimeStats);
            imageFilter.addEventListener('change', updateRealTimeStats);
            
            // Initialize resize functionality
            initResizeFunctionality();
            
            // Initialize dark mode
            applyDarkModePreference();
            
            // Animate stats counters
            animateStats();
            
            // Functions
            function animateStats() {
                // Set initial values
                usersCount.textContent = happyUsersCount.toLocaleString();
                imagesCount.textContent = processedImagesCount.toLocaleString();
                
                // Animate time saved and formats count
                animateValue(document.getElementById('timeSavedCount'), 0, 5000, 2000);
                animateValue(document.getElementById('formatsCount'), 0, 10, 100);
                
                // Start auto-incrementing counters
                startAutoIncrement();
            }
            
            function startAutoIncrement() {
                // Processed images counter - increments every minute (4-5 randomly)
                setInterval(() => {
                    const increment = Math.floor(Math.random() * 2) + 4; // Random between 4-5
                    processedImagesCount += increment;
                    imagesCount.textContent = processedImagesCount.toLocaleString();
                }, 60000); // Every minute
                
                // Happy users counter - increments by 1 every minute
                setInterval(() => {
                    happyUsersCount += 1;
                    usersCount.textContent = happyUsersCount.toLocaleString();
                }, 60000); // Every minute
            }
            
            function animateValue(element, start, end, duration) {
                let startTimestamp = null;
                const step = (timestamp) => {
                    if (!startTimestamp) startTimestamp = timestamp;
                    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
                    const value = Math.floor(progress * (end - start) + start);
                    element.textContent = value.toLocaleString() + (element.id === 'usersCount' ? '+' : 
                                        element.id === 'imagesCount' ? '+' : 
                                        element.id === 'timeSavedCount' ? '+' : '+');
                    if (progress < 1) {
                        window.requestAnimationFrame(step);
                    }
                };
                window.requestAnimationFrame(step);
            }
            
            function showToast(message, type = 'success') {
                toastMessage.textContent = message;
                toast.className = 'toast ' + type;
                toast.classList.add('visible');
                
                setTimeout(() => {
                    toast.classList.remove('visible');
                }, 3000);
            }
            
            function updateWatermarkPreview() {
                const ctx = watermarkPreviewCanvas.getContext('2d');
                const width = watermarkPreviewCanvas.width;
                const height = watermarkPreviewCanvas.height;
                
                // Clear canvas
                ctx.clearRect(0, 0, width, height);
                
                // Draw sample image
                ctx.fillStyle = '#f0f0f0';
                ctx.fillRect(0, 0, width, height);
                ctx.fillStyle = '#ddd';
                ctx.fillRect(10, 10, width-20, height-20);
                
                // Draw watermark
                const text = watermarkText.value || 'SAMPLE';
                const fontSize = parseInt(watermarkSize.value);
                const color = watermarkColor.value;
                const bgColor = watermarkBgColor.value;
                
                ctx.font = `bold ${fontSize}px Arial`;
                const textWidth = ctx.measureText(text).width;
                const textHeight = fontSize;
                
                let x, y;
                
                switch(watermarkPosition.value) {
                    case 'top-left':
                        x = 20;
                        y = 20 + fontSize;
                        break;
                    case 'top-right':
                        x = width - 20 - textWidth;
                        y = 20 + fontSize;
                        break;
                    case 'bottom-left':
                        x = 20;
                        y = height - 20;
                        break;
                    case 'bottom-right':
                        x = width - 20 - textWidth;
                        y = height - 20;
                        break;
                    case 'center':
                        x = (width - textWidth) / 2;
                        y = (height + fontSize) / 2;
                        break;
                }
                
                // Draw background
                ctx.fillStyle = bgColor;
                ctx.fillRect(x - 10, y - fontSize - 5, textWidth + 20, textHeight + 10);
                
                // Draw text
                ctx.fillStyle = color;
                ctx.fillText(text, x, y);
                
                watermarkPreview.classList.add('visible');
            }
            
            function handleFileSelect(e) {
                const newFiles = Array.from(e.target.files);
                
                // Check if adding these files would exceed the limit
                if (files.length + newFiles.length > MAX_FILES) {
                    showLimitNotice();
                    showToast('Maximum 10 images allowed at once', 'error');
                    return;
                }
                
                // Filter only image files
                const imageFiles = newFiles.filter(file => file.type.startsWith('image/') || 
                    ['tif', 'tiff', 'bmp', 'ico', 'heic', 'raw'].some(ext => file.name.toLowerCase().endsWith(ext)));
                
                if (imageFiles.length === 0) {
                    showToast('Please select only image files', 'error');
                    return;
                }
                
                // Add new files to our state
                files = [...files, ...imageFiles];
                
                // Update file counter
                updateFileCounter();
                
                // Create and store thumbnail URLs
                imageFiles.forEach(file => {
                    if (!thumbnailUrls[file.name]) {
                        thumbnailUrls[file.name] = URL.createObjectURL(file);
                    }
                });
                
                // Update UI
                updateFileTable();
                updateRealTimeStats();
                
                // Show table and batch actions if we have files
                if (files.length > 0) {
                    imagesTable.classList.add('visible');
                    batchActions.classList.add('visible');
                    processBtn.disabled = false;
                    advancedOptions.classList.add('visible');
                    showToast(`${imageFiles.length} image(s) added successfully`, 'success');
                }
                
                // Reset file input to allow selecting same files again
                fileInput.value = '';
            }
            
            function showLimitNotice() {
                limitNotice.classList.add('visible');
                setTimeout(() => {
                    limitNotice.classList.remove('visible');
                }, 5000);
            }
            
            function updateFileCounter() {
                if (files.length > 0) {
                    fileCounter.textContent = files.length;
                    fileCounter.style.display = 'flex';
                    
                    if (files.length >= MAX_FILES) {
                        fileCounter.style.backgroundColor = 'var(--danger-color)';
                    } else {
                        fileCounter.style.backgroundColor = 'var(--primary-color)';
                    }
                } else {
                    fileCounter.style.display = 'none';
                }
            }
            
            function updateFileTable(filteredFiles = null) {
			const filesToDisplay = filteredFiles || files;
			const searchContainer = document.getElementById('searchContainer');
			
			if (filesToDisplay.length === 0) {
				tableBody.innerHTML = '<tr class="no-files"><td colspan="5">No images selected yet</td></tr>';
				imagesTable.classList.remove('visible');
				batchActions.classList.remove('visible');
				advancedOptions.classList.remove('visible');
				previewContainer.classList.remove('visible');
				searchContainer.style.display = 'none'; // Hide search when no files
				return;
			}
    
    // Show search container when files are present
    searchContainer.style.display = 'block';
                
                tableBody.innerHTML = '';
                
                filesToDisplay.forEach((file, index) => {
                    const row = document.createElement('tr');
                    row.dataset.index = index;
                    
                    // Create thumbnail cell
                    const thumbnailCell = document.createElement('td');
                    thumbnailCell.setAttribute('data-label', 'Preview');
                    const thumbnail = document.createElement('img');
                    thumbnail.src = thumbnailUrls[file.name] || URL.createObjectURL(file);
                    thumbnail.className = 'thumbnail';
                    if (file.processing) {
                        thumbnail.classList.add('processing');
                    }
                    thumbnail.alt = file.name;
                    thumbnail.title = 'Click to preview';
                    thumbnail.style.cursor = 'pointer';
                    thumbnail.addEventListener('click', () => showPreview(file));
                    thumbnailCell.appendChild(thumbnail);
                    
                    // Create file info cell
                    const fileInfoCell = document.createElement('td');
                    fileInfoCell.setAttribute('data-label', 'File Info');
                    const fileInfoDiv = document.createElement('div');
                    fileInfoDiv.className = 'file-info';
                    
                    const fileNameSpan = document.createElement('span');
                    fileNameSpan.className = 'file-name';
                    fileNameSpan.textContent = file.name;
                    
                    const fileSizeSpan = document.createElement('span');
                    fileSizeSpan.className = 'file-size';
                    fileSizeSpan.textContent = formatFileSize(file.size);
                    
                    fileInfoDiv.appendChild(fileNameSpan);
                    fileInfoDiv.appendChild(document.createElement('br'));
                    fileInfoDiv.appendChild(fileSizeSpan);
                    fileInfoCell.appendChild(fileInfoDiv);
                    
                    // Create original format cell
                    const formatCell = document.createElement('td');
                    formatCell.setAttribute('data-label', 'Original Format');
                    const fileExtension = getFileExtension(file.name);
                    formatCell.textContent = fileExtension.toUpperCase();
                    
                    // Create status cell
                    const statusCell = document.createElement('td');
                    statusCell.setAttribute('data-label', 'Status');
                    const statusDiv = document.createElement('div');
                    
                    if (file.processed) {
                        const progressContainer = document.createElement('div');
                        progressContainer.className = 'progress-container';
                        
                        const progressBar = document.createElement('div');
                        progressBar.className = 'progress-bar';
                        progressBar.style.width = '100%';
                        
                        progressContainer.appendChild(progressBar);
                        statusDiv.appendChild(progressContainer);
                        
                        const statusSpan = document.createElement('span');
                        statusSpan.className = 'status completed';
                        statusSpan.innerHTML = '<i class="fas fa-check-circle"></i> Completed';
                        statusDiv.appendChild(statusSpan);
                    } else if (file.processing) {
                        const progressContainer = document.createElement('div');
                        progressContainer.className = 'progress-container';
                        
                        const progressBar = document.createElement('div');
                        progressBar.className = 'progress-bar';
                        progressBar.style.width = `${file.progress || 0}%`;
                        
                        progressContainer.appendChild(progressBar);
                        statusDiv.appendChild(progressContainer);
                        
                        const statusSpan = document.createElement('span');
                        statusSpan.className = 'status processing';
                        statusSpan.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
                        statusDiv.appendChild(statusSpan);
                    } else if (file.error) {
                        const statusSpan = document.createElement('span');
                        statusSpan.className = 'status error';
                        statusSpan.innerHTML = '<i class="fas fa-exclamation-circle"></i> Error';
                        statusDiv.appendChild(statusSpan);
                    } else {
                        const statusSpan = document.createElement('span');
                        statusSpan.className = 'status';
                        statusSpan.innerHTML = '<i class="fas fa-clock"></i> Pending';
                        statusDiv.appendChild(statusSpan);
                    }
                    
                    statusCell.appendChild(statusDiv);
                    
                    // Create actions cell
                    const actionsCell = document.createElement('td');
                    actionsCell.setAttribute('data-label', 'Actions');
                    actionsCell.style.display = 'flex';
                    actionsCell.style.gap = '8px';
                    
                    if (file.processed && file.downloadUrl) {
                        const downloadBtn = document.createElement('button');
                        downloadBtn.className = 'action-btn download-btn';
                        downloadBtn.innerHTML = '<i class="fas fa-download"></i>';
                        downloadBtn.title = 'Download';
                        downloadBtn.addEventListener('click', () => downloadFile(file));
                        actionsCell.appendChild(downloadBtn);
                        
                        const enhanceBtn = document.createElement('button');
                        enhanceBtn.className = 'action-btn enhance-btn';
                        enhanceBtn.innerHTML = '<i class="fas fa-magic"></i>';
                        enhanceBtn.title = 'Enhance';
                        enhanceBtn.addEventListener('click', () => enhanceFile(file));
                        actionsCell.appendChild(enhanceBtn);
                    }
                    
                    const deleteBtn = document.createElement('button');
                    deleteBtn.className = 'action-btn delete-btn';
                    deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
                    deleteBtn.title = 'Remove';
                    deleteBtn.addEventListener('click', () => removeFile(index));
                    actionsCell.appendChild(deleteBtn);
                    
                    // Append all cells to row
                    row.appendChild(thumbnailCell);
                    row.appendChild(fileInfoCell);
                    row.appendChild(formatCell);
                    row.appendChild(statusCell);
                    row.appendChild(actionsCell);
                    
                    // Append row to table
                    tableBody.appendChild(row);
                });
            }
            
            function showPreview(file) {
                originalPreview.src = thumbnailUrls[file.name];
                
                // Create enhanced version with all modifications
                const img = new Image();
                img.onload = function() {
                    let canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    // Original dimensions
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);
                    
                    // Apply filter first
                    if (imageFilter.value !== 'none') {
                        canvas = applyFilter(canvas, imageFilter.value);
                    }
                    
                    // Apply rotation
                    const rotation = parseInt(rotationSelect.value);
                    if (rotation !== 0) {
                        canvas = applyRotation(canvas, rotation);
                    }
                    
                    // Apply resizing to the rotated/filtered image
                    let newWidth = canvas.width;
                    let newHeight = canvas.height;
                    
                    if (resizeMode.value === 'percentage' && resizeValue.value) {
                        const scale = resizeValue.value / 100;
                        newWidth = canvas.width * scale;
                        newHeight = canvas.height * scale;
                    } else if (resizeMode.value === 'dimensions') {
                        if (resizeWidth.value) newWidth = parseInt(resizeWidth.value);
                        if (resizeHeight.value) newHeight = parseInt(resizeHeight.value);
                    }
                    
                    // Create final canvas with correct dimensions
                    const finalCanvas = document.createElement('canvas');
                    finalCanvas.width = newWidth;
                    finalCanvas.height = newHeight;
                    const finalCtx = finalCanvas.getContext('2d');
                    
                    // Apply color space
                    finalCtx.filter = getColorFilter();
                    finalCtx.drawImage(canvas, 0, 0, newWidth, newHeight);
                    
                    // Apply watermark if enabled
                    if (watermarkCheckbox.checked) {
                        applyWatermark(finalCanvas);
                    }
                    
                    enhancedPreview.src = finalCanvas.toDataURL();
                    
                    // Calculate stats
                    const originalSize = file.size;
                    const enhancedSize = Math.floor(originalSize * (100 - qualitySlider.value) / 100);
                    const sizeReductionValue = Math.floor((originalSize - enhancedSize) / originalSize * 100);
                    const qualityImprovement = Math.floor(Math.random() * 30) + 10; // Simulated
                    
                    sizeReduction.textContent = `${sizeReductionValue}%`;
                    qualityDiff.textContent = `+${qualityImprovement}%`;
                    timeSaved.textContent = `${Math.floor(Math.random() * 10) + 5}s`;
                    
                    previewContainer.classList.add('visible');
                };
                img.src = thumbnailUrls[file.name];
            }
            
            function getColorFilter() {
                const colorSpace = document.getElementById('colorSpace').value;
                switch(colorSpace) {
                    case 'grayscale':
                        return 'grayscale(100%)';
                    case 'cmyk':
                        return 'sepia(100%) hue-rotate(180deg)';
                    default:
                        return 'none';
                }
            }
            
            function applyWatermark(canvas) {
                const ctx = canvas.getContext('2d');
                const text = watermarkText.value || 'SAMPLE';
                const fontSize = parseInt(watermarkSize.value);
                const color = watermarkColor.value;
                const bgColor = watermarkBgColor.value;
                
                ctx.font = `bold ${fontSize}px Arial`;
                const textWidth = ctx.measureText(text).width;
                const textHeight = fontSize;
                
                let x, y;
                
                switch(watermarkPosition.value) {
                    case 'top-left':
                        x = 20;
                        y = 20 + fontSize;
                        break;
                    case 'top-right':
                        x = canvas.width - 20 - textWidth;
                        y = 20 + fontSize;
                        break;
                    case 'bottom-left':
                        x = 20;
                        y = canvas.height - 20;
                        break;
                    case 'bottom-right':
                        x = canvas.width - 20 - textWidth;
                        y = canvas.height - 20;
                        break;
                    case 'center':
                        x = (canvas.width - textWidth) / 2;
                        y = (canvas.height + fontSize) / 2;
                        break;
                }
                
                // Draw background
                ctx.fillStyle = bgColor;
                ctx.fillRect(x - 10, y - fontSize - 5, textWidth + 20, textHeight + 10);
                
                // Draw text
                ctx.fillStyle = color;
                ctx.fillText(text, x, y);
            }
            
            function enhanceFile(file) {
                showToast(`Enhancing ${file.name} with AI...`, 'info');
                // In a real app, this would call an AI enhancement API
            }
            
            function getFileExtension(filename) {
                return filename.split('.').pop().toLowerCase();
            }
            
            function filterFiles() {
                const searchTerm = searchInput.value.toLowerCase();
                if (!searchTerm) {
                    updateFileTable();
                    return;
                }
                
                const filtered = files.filter(file => 
                    file.name.toLowerCase().includes(searchTerm)
                );
                
                updateFileTable(filtered);
            }
            
            function removeFile(index) {
                // Revoke the thumbnail URL to free memory
                if (thumbnailUrls[files[index].name]) {
                    URL.revokeObjectURL(thumbnailUrls[files[index].name]);
                    delete thumbnailUrls[files[index].name];
                }
                
                const fileName = files[index].name;
                files.splice(index, 1);
                updateFileTable();
                updateFileCounter();
                updateRealTimeStats();
                
                if (files.length === 0) {
                    processBtn.disabled = true;
                }
                
                showToast(`Removed ${fileName}`, 'success');
            }
            
            function clearAllFiles() {
                if (files.length === 0) return;
                
                if (confirm('Are you sure you want to remove all files?')) {
                    // Revoke all thumbnail URLs
                    files.forEach(file => {
                        if (thumbnailUrls[file.name]) {
                            URL.revokeObjectURL(thumbnailUrls[file.name]);
                        }
                    });
                    
                    files = [];
                    processedFiles = [];
                    thumbnailUrls = {};
                    updateFileTable();
                    updateFileCounter();
                    updateRealTimeStats();
                    processBtn.disabled = true;
                    previewContainer.classList.remove('visible');
                    showToast('All files cleared', 'success');
                }
            }
            
            async function processImages() {
                if (files.length === 0) return;
                
                const format = outputFormat.value;
                const quality = qualitySlider.value;
                const resizeModeValue = resizeMode.value;
                const resizeValueValue = resizeValue.value;
                const width = resizeWidth.value;
                const height = resizeHeight.value;
                const compression = compressionSlider.value;
                const colorSpace = document.getElementById('colorSpace').value;
                const dpi = document.getElementById('dpi').value;
                const optimize = document.getElementById('optimize').checked;
                const preserveExif = document.getElementById('preserveExif').checked;
                const watermark = document.getElementById('watermark').checked;
                
                processBtn.disabled = true;
                processBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing Images...';
                showToast('Starting image processing...', 'info');
                
                // Show processing status for all files
                files.forEach(file => {
                    file.processing = true;
                    file.progress = 0;
                });
                updateFileTable();
                
                // Process files one by one
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    
                    // Skip already processed files
                    if (file.processed) continue;
                    
                    try {
                        // Simulate processing with actual conversion
                        await convertImage(file, format, quality, resizeModeValue, resizeValueValue, width, height, colorSpace, watermark);
                        
                        // Mark as processed
                        file.processing = false;
                        file.processed = true;
                        file.progress = 100;
                        
                        // Add to processed files array
                        processedFiles.push(file);
                        
                        updateFileTable();
                        showToast(`Processed ${file.name}`, 'success');
                    } catch (error) {
                        console.error('Error processing file:', file.name, error);
                        file.processing = false;
                        file.error = true;
                        
                        updateFileTable();
                        showToast(`Error processing ${file.name}`, 'error');
                    }
                }
                
                processBtn.disabled = false;
                processBtn.innerHTML = '<i class="fas fa-magic"></i> Process Images';
                showToast('All images processed successfully!', 'success');
                
                // Show preview of first processed file
                if (processedFiles.length > 0) {
                    showPreview(processedFiles[0]);
                }
            }
            
            function convertImage(file, format, quality, resizeMode, resizeValue, width, height, colorSpace, addWatermark) {
                return new Promise((resolve) => {
                    // Simulate progress updates
                    const interval = setInterval(() => {
                        file.progress += Math.floor(Math.random() * 10) + 5;
                        if (file.progress >= 100) {
                            file.progress = 100;
                            clearInterval(interval);
                            
                            // Create canvas for final image
                            const img = new Image();
                            img.onload = function() {
                                let canvas = document.createElement('canvas');
                                const ctx = canvas.getContext('2d');
                                
                                // Original dimensions
                                canvas.width = img.width;
                                canvas.height = img.height;
                                ctx.drawImage(img, 0, 0);
                                
                                // Apply filter first
                                if (imageFilter.value !== 'none') {
                                    canvas = applyFilter(canvas, imageFilter.value);
                                }
                                
                                // Apply rotation
                                const rotation = parseInt(rotationSelect.value);
                                if (rotation !== 0) {
                                    canvas = applyRotation(canvas, rotation);
                                }
                                
                                // Apply resizing to the rotated/filtered image
                                let newWidth = canvas.width;
                                let newHeight = canvas.height;
                                
                                if (resizeMode === 'percentage' && resizeValue) {
                                    const scale = resizeValue / 100;
                                    newWidth = canvas.width * scale;
                                    newHeight = canvas.height * scale;
                                } else if (resizeMode === 'dimensions') {
                                    if (width) newWidth = parseInt(width);
                                    if (height) newHeight = parseInt(height);
                                }
                                
                                // Create final canvas with correct dimensions
                                const finalCanvas = document.createElement('canvas');
                                finalCanvas.width = newWidth;
                                finalCanvas.height = newHeight;
                                const finalCtx = finalCanvas.getContext('2d');
                                
                                // Apply color space
                                finalCtx.filter = getColorFilter();
                                finalCtx.drawImage(canvas, 0, 0, newWidth, newHeight);
                                
                                // Apply watermark if enabled
                                if (addWatermark) {
                                    applyWatermark(finalCanvas);
                                }
                                
                                // Create download URL
                                let mimeType = 'image/jpeg';
                                if (format === 'png') mimeType = 'image/png';
                                else if (format === 'webp') mimeType = 'image/webp';
                                else if (format === 'gif') mimeType = 'image/gif';
                                else if (format === 'bmp') mimeType = 'image/bmp';
                                
                                finalCanvas.toBlob(blob => {
                                    file.downloadUrl = URL.createObjectURL(blob);
                                    file.convertedFormat = format;
                                    file.convertedSize = blob.size;
                                    
                                    // Apply batch rename if specified
                                    if (batchRenameInput.value) {
                                        file.finalName = generateNewFileName(file.name, batchRenameInput.value, files.indexOf(file));
                                    } else {
                                        file.finalName = `${file.name.split('.')[0]}.${file.convertedFormat || outputFormat.value}`;
                                    }
                                    
                                    resolve();
                                }, mimeType, quality/100);
                            };
                            img.src = thumbnailUrls[file.name];
                        }
                        updateFileTable();
                    }, 200);
                });
            }
            
            function downloadFile(file) {
                if (!file.downloadUrl) return;
                
                const a = document.createElement('a');
                a.href = file.downloadUrl;
                a.download = file.finalName || `${file.name.split('.')[0]}.${file.convertedFormat || outputFormat.value}`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                showToast(`Downloading ${file.finalName || file.name}`, 'success');
            }
            
            async function downloadAllAsZip() {
                if (processedFiles.length === 0) {
                    showToast('No processed files available for download', 'error');
                    return;
                }
                
                try {
                    // Show loading state on button
                    const originalText = downloadAllBtn.innerHTML;
                    downloadAllBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating ZIP...';
                    downloadAllBtn.disabled = true;
                    showToast('Creating ZIP archive...', 'info');
                    
                    // Create a new JSZip instance
                    const zip = new JSZip();
                    const folder = zip.folder("converted_images");
                    
                    // Add each processed file to the ZIP
                    for (const file of processedFiles) {
                        if (file.downloadUrl) {
                            // Fetch the file
                            const response = await fetch(file.downloadUrl);
                            const blob = await response.blob();
                            
                            // Add to ZIP with proper extension
                            const fileName = file.finalName || `${file.name.split('.')[0]}.${file.convertedFormat || outputFormat.value}`;
                            folder.file(fileName, blob);
                        }
                    }
                    
                    // Generate the ZIP file
                    const content = await zip.generateAsync({ type: "blob" });
                    
                    // Download the ZIP file
                    saveAs(content, "converted_images.zip");
                    showToast('ZIP download started!', 'success');
                    
                } catch (error) {
                    console.error('Error creating ZIP file:', error);
                    showToast('Error creating ZIP file', 'error');
                } finally {
                    // Restore button state
                    downloadAllBtn.innerHTML = '<i class="fas fa-download"></i> Download All (ZIP)';
                    downloadAllBtn.disabled = false;
                }
            }
            
			
            function shareFiles() {
                if (processedFiles.length === 0) {
                    showToast('No processed files available to share', 'error');
                    return;
                }
                
                if (navigator.share) {
                    navigator.share({
                        title: 'Converted Images',
                        text: `I just converted ${processedFiles.length} images using BatchPixel  Image Converter!`,
                        url: window.location.href
                    }).then(() => {
                        showToast('Shared successfully!', 'success');
                    }).catch(err => {
                        console.log('Error sharing:', err);
                        showToast('Sharing failed', 'error');
                    });
                } else {
                    showToast('Web Share API not supported in your browser', 'error');
                }
            }
            
            // Initialize watermark preview
            updateWatermarkPreview();
        });