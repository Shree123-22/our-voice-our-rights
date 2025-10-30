document.addEventListener("DOMContentLoaded", async () => {
  const langSelect = document.getElementById("lang");
  const districtSelect = document.getElementById("districtSelect");
  const fetchBtn = document.getElementById("fetchData");
  const resultDiv = document.getElementById("result");
  const langLabel = document.getElementById("langLabel");
  const districtLabel = document.getElementById("districtLabel");

  let districts = [];
  let data = [];

  // ✅ Step 1: Load CSV
  async function loadCSV() {
    try {
      const response = await fetch("./mgnrega-data.csv");
      if (!response.ok) throw new Error("Could not load CSV file.");
      const csvText = await response.text();

      const rows = csvText.trim().split("\n").slice(1);
      data = rows.map(row => {
        const cols = row.split(",");
        return {
          district: cols[5].trim(),
          wage: parseFloat(cols[9] || 0),
          days: parseInt(cols[11] || 0),
          workers: parseInt(cols[13] || 0),
          works: parseInt(cols[14] || 0),
          totalWages: parseFloat(cols[15] || 0)
        };
      });

      // Unique district names
      districts = [...new Set(data.map(d => d.district))];
      populateDistricts();
    } catch (error) {
      console.error("❌ CSV Load Error:", error);
      resultDiv.innerHTML = "<p style='color:red;'>⚠️ Could not load data file.</p>";
    }
  }

  // ✅ Step 2: English → Kannada district names
  const translations = {
    "BAGALKOTE": "ಬಾಗಲಕೋಟೆ",
    "BALLARI": "ಬಳ್ಳಾರಿ",
    "BELAGAVI": "ಬೆಳಗಾವಿ",
    "BENGALURU": "ಬೆಂಗಳೂರು",
    "BENGALURU RURAL": "ಬೆಂಗಳೂರು ಗ್ರಾಮಾಂತರ",
    "BIDAR": "ಬೀದರ್",
    "CHAMARAJANAGARA": "ಚಾಮರಾಜನಗರ",
    "CHIKKABALLAPURA": "ಚಿಕ್ಕಬಳ್ಳಾಪುರ",
    "CHIKKAMAGALURU": "ಚಿಕ್ಕಮಗಳೂರು",
    "CHITRADURGA": "ಚಿತ್ರದುರ್ಗ",
    "DAKSHINA KANNADA": "ದಕ್ಷಿಣ ಕನ್ನಡ",
    "DAVANAGERE": "ದಾವಣಗೆರೆ",
    "DHARWAD": "ಧಾರವಾಡ",
    "GADAG": "ಗದಗ",
    "HASSAN": "ಹಾಸನ",
    "HAVERI": "ಹಾವೇರಿ",
    "KALABURAGI": "ಕಲಬುರಗಿ",
    "KODAGU": "ಕೊಡಗು",
    "KOLAR": "ಕೋಲಾರ",
    "KOPPAL": "ಕೋಪ್ಪಳ",
    "MANDYA": "ಮಂಡ್ಯ",
    "MYSURU": "ಮೈಸೂರು",
    "RAICHUR": "ರಾಯಚೂರು",
    "RAMANAGARA": "ರಾಮನಗರ",
    "SHIVAMOGGA": "ಶಿವಮೊಗ್ಗ",
    "TUMAKURU": "ತುಮಕೂರು",
    "UDUPI": "ಉಡುಪಿ",
    "UTTARA KANNADA": "ಉತ್ತರ ಕನ್ನಡ",
    "VIJAYAPURA": "ವಿಜಯಪುರ",
    "VIJAYANAGARA": "ವಿಜಯನಗರ",
    "YADGIR": "ಯಾದಗಿರಿ"
  };

  // Translate to Kannada if available
  function translateToKannada(name) {
    return translations[name.toUpperCase()] || null;
  }

  // ✅ Step 3: Populate district dropdown
  function populateDistricts() {
    districtSelect.innerHTML = "";
    const defaultText = langSelect.value === "kn" ? "ಜಿಲ್ಲೆ ಆಯ್ಕೆಮಾಡಿ" : "Select District";
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = defaultText;
    districtSelect.appendChild(defaultOption);

    districts.forEach(dist => {
      const kannadaName = translateToKannada(dist);
      // Only add if Kannada name exists
      if (kannadaName) {
        const option = document.createElement("option");
        option.value = dist;
        option.textContent = langSelect.value === "kn" ? kannadaName : dist;
        districtSelect.appendChild(option);
      }
    });

    updateLabels();
  }

  // ✅ Step 4: Update UI labels
  function updateLabels() {
    if (langSelect.value === "kn") {
      langLabel.textContent = "ಭಾಷೆ:";
      districtLabel.textContent = "ಜಿಲ್ಲೆ:";
      fetchBtn.textContent = "ಮಾಹಿತಿ ತೋರಿಸಿ";
    } else {
      langLabel.textContent = "Language:";
      districtLabel.textContent = "District:";
      fetchBtn.textContent = "Show Data";
    }
  }

  // ✅ Step 5: Show district data
  function showData() {
    const selected = districtSelect.value;
    if (!selected) {
      resultDiv.innerHTML =
        langSelect.value === "kn"
          ? "<p>ದಯವಿಟ್ಟು ಜಿಲ್ಲೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ.</p>"
          : "<p>Please select a district.</p>";
      return;
    }

    const districtData = data.find(d => d.district === selected);
    if (!districtData) {
      resultDiv.innerHTML =
        langSelect.value === "kn"
          ? "<p>ಈ ಜಿಲ್ಲೆಗೆ ಮಾಹಿತಿಯಿಲ್ಲ.</p>"
          : "<p>No data found for this district.</p>";
      return;
    }

    const isKannada = langSelect.value === "kn";
    const distName = isKannada ? translateToKannada(selected) : selected;

    const table = `
      <table border="1" style="border-collapse:collapse; width:80%; margin:auto;">
        <tr><th>${isKannada ? "ಜಿಲ್ಲೆ" : "District"}</th><td>${distName}</td></tr>
        <tr><th>${isKannada ? "ಸರಾಸರಿ ವೇತನ (₹/ದಿನ)" : "Average Wage (₹/day)"}</th><td>${districtData.wage}</td></tr>
        <tr><th>${isKannada ? "ಸರಾಸರಿ ಕೆಲಸದ ದಿನಗಳು" : "Average Work Days"}</th><td>${districtData.days}</td></tr>
        <tr><th>${isKannada ? "ಒಟ್ಟು ಕಾರ್ಮಿಕರು" : "Total Workers"}</th><td>${districtData.workers}</td></tr>
        <tr><th>${isKannada ? "ಒಟ್ಟು ಕೆಲಸಗಳು" : "Total Works"}</th><td>${districtData.works}</td></tr>
        <tr><th>${isKannada ? "ಒಟ್ಟು ವೇತನ (ಲಕ್ಷಗಳಲ್ಲಿ)" : "Total Wages (in Lakhs)"}</th><td>${districtData.totalWages}</td></tr>
      </table>
    `;
    resultDiv.innerHTML = table;
  }

  // ✅ Step 6: Events
  fetchBtn.addEventListener("click", showData);
  langSelect.addEventListener("change", () => {
    populateDistricts();
    updateLabels();
  });

  // Load CSV initially
  loadCSV();
});
