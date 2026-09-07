/* ==========================================================
   UNIFIED FRONTEND SCRIPT FOR MUSTAFA ELEVATE & AMIR CHAP CHAP
   ========================================================== */

const BACKEND_URL = "https://amir-chap-chap-backend.onrender.com";

// 1. SUBMIT CV REQUEST (Client Form Submission)
async function submitCVRequest(event) {
  if (event) event.preventDefault();

  // Get user email from localStorage or fall back to the account being tested
  const userEmail = localStorage.getItem("userEmail") || "moha@gmail.com"; 
  const noteInput = document.getElementById("user-note");
  const fileInput = document.getElementById("cv-file-input");

  if (!fileInput || fileInput.files.length === 0) {
    alert("Please select a file first.");
    return;
  }

  const file = fileInput.files[0];
  const reader = new FileReader();

  reader.onload = async function() {
    try {
      const response = await fetch(`${BACKEND_URL}/api/upload-cv`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail: userEmail,
          fileName: file.name,
          fileData: reader.result,
          note: noteInput ? noteInput.value : ""
        })
      });

      const result = await response.json();
      if (result.success) {
        alert("CV request submitted successfully!");
        location.reload();
      } else {
        alert("Error: " + result.message);
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to submit request.");
    }
  };
  reader.readAsDataURL(file);
}

// 2. LOAD USER DASHBOARD (Fetches requests and shows download buttons when ready)
async function loadUserDashboard() {
  const userEmail = localStorage.getItem("userEmail") || "moha@gmail.com";
  const container = document.getElementById("received-files-container");
  
  if (!container) return; // Exit if container isn't present on this page

  try {
    const response = await fetch(`${BACKEND_URL}/api/user/requests/${encodeURIComponent(userEmail)}`);
    const data = await response.json();

    if (data.success && data.requests && data.requests.length > 0) {
      container.innerHTML = ""; // Clear the default "not submitted" message

      data.requests.forEach(req => {
        const card = document.createElement("div");
        card.className = "cv-request-card";
        
        let actionHtml = `<p>Status: <strong>${req.status}</strong></p>`;
        
        // If staff uploaded the finished CV, display the direct download link
        if (req.completedFileData) {
          actionHtml += `
            <a href="${req.completedFileData}" download="${req.fileName || 'Completed_CV.pdf'}" class="btn-download" style="display:inline-block; margin-top:10px; padding:8px 15px; background:#28a745; color:white; text-decoration:none; border-radius:4px;">
              📥 Download Completed CV
            </a>
          `;
        } else {
          actionHtml += `<p class="text-muted" style="color: #666; font-style: italic;">Your CV Expert is currently working on your document.</p>`;
        }

        card.innerHTML = `
          <h4>File: ${req.fileName}</h4>
          <p>Note: ${req.note || "No message provided."}</p>
          ${actionHtml}
          <hr style="margin: 15px 0; border: 0; border-top: 1px solid #eee;">
        `;
        container.appendChild(card);
      });
    } else {
      container.innerHTML = `<p>You have not submitted any Human CV requests yet.</p>`;
    }
  } catch (error) {
    console.error("Error fetching user requests:", error);
    container.innerHTML = `<p>Error loading your files. Please check your network connection.</p>`;
  }
}

// 3. STAFF PORTAL: SEND COMPLETED FILE BACK TO USER
async function sendCompletedFileToUser(requestId) {
  const fileInput = document.getElementById(`completed-file-${requestId}`);
  
  if (!fileInput || fileInput.files.length === 0) {
    alert("Please choose the completed file to send.");
    return;
  }

  const file = fileInput.files[0];
  const reader = new FileReader();

  reader.onload = async function() {
    try {
      const response = await fetch(`${BACKEND_URL}/api/mustafa/admin/requests/${requestId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completedFileData: reader.result })
      });

      const result = await response.json();
      if (result.success) {
        alert("Completed CV sent successfully to the user!");
        location.reload();
      } else {
        alert("Error: " + result.message);
      }
    } catch (err) {
      console.error("Staff completion error:", err);
      alert("Failed to send file.");
    }
  };
  reader.readAsDataURL(file);
}

// Automatically trigger dashboard loading when the user dashboard page loads
window.addEventListener("DOMContentLoaded", () => {
  loadUserDashboard();
});
