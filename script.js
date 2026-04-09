let currentSection = 0;

const sections = document.querySelectorAll(".form-section");
const steps = document.querySelectorAll(".step");
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");

// SECTION NAVIGATION
function showSection(index) {
    sections.forEach((section, i) => {
        section.classList.toggle("active", i === index);
        steps[i].classList.toggle("active", i === index);
    });

    prevBtn.disabled = index === 0;
    nextBtn.textContent = index === sections.length - 1 ? "Finish" : "Next";
}

nextBtn.addEventListener("click", () => {
    if (currentSection < sections.length - 1) {
        currentSection++;
        showSection(currentSection);
    } else {
        alert("Resume completed successfully!");
    }
});

prevBtn.addEventListener("click", () => {
    if (currentSection > 0) {
        currentSection--;
        showSection(currentSection);
    }
});

showSection(currentSection);

// PHOTO PREVIEW (safe: only wire if elements exist)
const photoInput = document.getElementById("photoInput");
const photoPreview = document.getElementById("photoPreview");
if (photoInput && photoPreview) {
    photoInput.addEventListener("change", () => {
        const file = photoInput.files[0];
        if (file) {
            photoPreview.src = URL.createObjectURL(file);
            photoPreview.style.display = "block";
        } else {
            photoPreview.src = '';
            photoPreview.style.display = 'none';
        }
    });
}

// PDF / Preview: save form data to localStorage and open preview page
const downloadBtn = document.getElementById('downloadBtn');
if (downloadBtn) {
    downloadBtn.addEventListener('click', async () => {
        try {
            const data = await collectFormData();
            localStorage.setItem('resume_preview_data', JSON.stringify(data));
            // open preview.html in Resume Manya folder — choose path relative to current page
            const pathContainsFolder = decodeURIComponent(window.location.pathname).includes('Resume Manya');
            const previewPath = pathContainsFolder ? 'preview.html' : 'Resume Manya/preview.html';
            window.open(previewPath, '_blank');
        } catch (e) {
            console.error(e);
            alert('Failed to prepare preview: '+e.message);
        }
    });
}

function collectFormData(){
    return new Promise((resolve, reject) => {
        try {
            const data = {};
            // collect inputs and textareas by id or name
            document.querySelectorAll('input, textarea, select').forEach(el => {
                if (el.type === 'file') return; // handled separately
                let key = el.id || el.name;
                if (!key) {
                    const ph = (el.placeholder || '').toLowerCase();
                    if (ph.includes('name')) key = 'name';
                    else if (ph.includes('email')) key = 'email';
                    else if (ph.includes('phone') || ph.includes('tel')) key = 'phone';
                    else if (ph.includes('city') || ph.includes('location') || ph.includes('country')) key = 'location';
                    else if (ph.includes('summary')) key = 'summary';
                    else if (ph.includes('skill')) key = 'skills';
                    else if (ph.includes('education')) key = 'education';
                    else if (ph.includes('experience')) key = 'experience';
                    else if (ph.includes('project')) key = 'projects';
                }
                if (!key) return;
                data[key] = el.value;
            });

            // handle file input (photo) if present
            const fileInput = document.querySelector('input[type="file"][id="photo"], input[type="file"][id="photoInput"]');
            if (!fileInput || !fileInput.files || !fileInput.files[0]) {
                resolve(data);
                return;
            }
            const file = fileInput.files[0];
            const reader = new FileReader();
            reader.onload = () => {
                data.photo = reader.result; // data URL
                resolve(data);
            };
            reader.onerror = () => { resolve(data); };
            reader.readAsDataURL(file);
        } catch (err) { reject(err); }
    });
}