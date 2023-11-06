let isFullScreen = false;
let currentPage = 1;
let totalPages = 0;
let pdfDocument = null;
let pdfViewer = document.getElementById('pdfContainer');
let prevPageArrow = document.getElementById('prevPage');
let nextPageArrow = document.getElementById('nextPage');

// Initially, hide the arrows
prevPageArrow.style.display = 'none';
nextPageArrow.style.display = 'none';

function renderPage(pageNumber) {
    pdfDocument.getPage(pageNumber).then(function (page) {
        const scale = 1.13;
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
            canvasContext: context,
            viewport: viewport,
        };

        page.render(renderContext).promise.then(function () {
            // Clear the PDF viewer container
            pdfViewer.innerHTML = '';
            pdfViewer.appendChild(canvas);

            // Add a black border (3px wide) to the pdfDocument container
            pdfViewer.style.border = '3px solid #beab9c'; // 3px solid black border
        });
    });
}

function loadPDF(data) {
    pdfjsLib.getDocument({ data: data }).promise.then(function (pdf) {
        pdfDocument = pdf;
        totalPages = pdf.numPages;
        renderPage(currentPage);
        updatePageNavigation();
    });
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        renderPage(currentPage);
        updatePageNavigation();
    }
}

function nextPage() {
    if (currentPage < totalPages) {
        currentPage++;
        renderPage(currentPage);
        updatePageNavigation();
    }
}

function updatePageNavigation() {
    if (pdfDocument === null) {
        prevPageArrow.style.display = 'none';
        nextPageArrow.style.display = 'none';
    } else {
        prevPageArrow.style.display = 'inline-block';
        nextPageArrow.style.display = 'inline-block';
    }
}

function toggleFullScreen() {
    if (!isFullScreen) {
        pdfViewer.style.maxHeight = 'none';
        isFullScreen = true;
    } else {
        pdfViewer.style.maxHeight = '400px';
        isFullScreen = false;
    }
}

document.getElementById('pdfInput').addEventListener('change', function (event) {
    const file = event.target.files[0];

    if (file) {
        const reader = new FileReader();

        reader.onload = function (e) {
            const pdfData = new Uint8Array(e.target.result);
            loadPDF(pdfData);

            document.getElementById('custom-text').style.display = 'none';
        };

        reader.readAsArrayBuffer(file);
    } else {
        // No file selected, hide arrows
        prevPageArrow.style.display = 'none';
        nextPageArrow.style.display = 'none';

        // Show the "No file chosen, yet" text
        document.getElementById('custom-text').style.display = 'block';
    }
});
