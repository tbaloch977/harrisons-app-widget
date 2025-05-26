// Fee percentage table by range
const brackets = [
  { min: 70000, nsnf: 5.71, part: 4.57, all: 3.66 },
  { min: 80000, nsnf: 5.00, part: 4.00, all: 3.20 },
  { min: 90000, nsnf: 4.44, part: 3.56, all: 2.84 },
  { min: 100000, nsnf: 4.00, part: 3.20, all: 2.56 },
  { min: 110000, nsnf: 3.64, part: 2.91, all: 2.33 },
  { min: 120000, nsnf: 3.33, part: 2.67, all: 2.13 },
  { min: 130000, nsnf: 3.08, part: 2.46, all: 1.94 },
  { min: 140000, nsnf: 2.86, part: 2.29, all: 1.83 },
  { min: 150000, nsnf: 2.67, part: 2.13, all: 1.71 },
  { min: 160000, nsnf: 2.50, part: 2.00, all: 1.60 },
  { min: 170000, nsnf: 2.35, part: 1.88, all: 1.51 },
  { min: 180000, nsnf: 2.22, part: 1.78, all: 1.42 },
  { min: 190000, nsnf: 2.11, part: 1.68, all: 1.35 },
  { min: 200000, nsnf: 2.00, part: 1.60, all: 1.28 },
  { min: 210000, nsnf: 1.90, part: 1.52, all: 1.22 },
  { min: 220000, nsnf: 1.82, part: 1.45, all: 1.16 }
];

function getBracketRate(price, type) {
  if (price < 70000) price = 70000; // lowest bracket
  if (price > 220000) {
    if (type === "nsnf") return 1.8;
    if (type === "part") return 1.44;
    if (type === "all") return 1.15;
  }
  for (let i = brackets.length - 1; i >= 0; i--) {
    if (price >= brackets[i].min) return brackets[i][type];
  }
  return 0;
}

function calculateFees() {
  const price = parseFloat(document.getElementById("price").value);
  const option = document.getElementById("option").value;
  const output = document.getElementById("output");
  const additionalPrepaid = parseFloat(document.getElementById("additional").value) || 0;

  if (isNaN(price) || price <= 0) {
    output.innerHTML = "Please enter a valid listing price.";
    return;
  }

  let prepaid = 0, completion = 0, total = 0, repPercentage = 0;

  let rate_nsnf = getBracketRate(price, "nsnf");
  let rate_part = getBracketRate(price, "part");
  let rate_all = getBracketRate(price, "all");

  if (option === "nsnf") {
    completion = price * (rate_nsnf / 100) * 1.2;
    total = completion;
    repPercentage = rate_nsnf;
  } else if (option === "part") {
    const basePrepaid = 395;
    prepaid = basePrepaid + additionalPrepaid;

    const nsnfFee = price * (rate_nsnf / 100) * 1.2;
    const orangeCompletion = (nsnfFee * 0.8) - basePrepaid;
    const fullPrepaidFee = (orangeCompletion + basePrepaid) * 0.8;

    if (prepaid >= fullPrepaidFee) {
      completion = 0;
    } else {
      completion = orangeCompletion - (additionalPrepaid * (basePrepaid + orangeCompletion) / fullPrepaidFee);
    }

    total = prepaid + completion;
    repPercentage = ((prepaid + completion) / 1.2 / price) * 100;
  } else if (option === "all") {
    prepaid = price * (rate_all / 100) * 1.2;
    completion = 0;
    total = prepaid;
    repPercentage = (prepaid / 1.2 / price) * 100;
  }

  // Use your new output block here:
  const fullPrepaidFeeTotal = price * (rate_all / 100) * 1.2;
  const nsnfFeeTotal = price * (rate_nsnf / 100) * 1.2;
  const partFeeTotal = total;

  const actualSavings = nsnfFeeTotal - partFeeTotal;
  const possibleExtraSavings = partFeeTotal - fullPrepaidFeeTotal;

  output.innerHTML = `
    <div class="fee-table-outer">
      <table class="fee-table-custom">
        <tr>
          <th style="text-align:left;">Fee Type</th>
          <th style="text-align:right;">Amount</th>
        </tr>
        <tr>
          <td>Listing Value</td>
          <td class="fee-right">£${price.toLocaleString()}</td>
        </tr>
        <tr>
          <td>Payment Option</td>
          <td class="fee-right">${option === "nsnf" ? "No Sale No Fee" : option === "part" ? "Part Prepaid" : "All Prepaid"}</td>
        </tr>
        <tr>
          <td>Prepaid Fee</td>
          <td class="fee-right">£${prepaid.toFixed(2)}</td>
        </tr>
        <tr>
          <td>Completion Fee</td>
          <td class="fee-right">£${completion.toFixed(2)}</td>
        </tr>
        <tr class="fee-total-row">
          <td><strong>Total Fee</strong></td>
          <td class="fee-right"><strong>£${total.toLocaleString(undefined, {minimumFractionDigits: 2})}</strong></td>
        </tr>
        <tr class="fee-space-row"><td colspan="2"></td></tr>
        <tr>
          <td>Representative %</td>
          <td class="fee-right">${repPercentage.toFixed(2)}%</td>
        </tr>
        <tr class="fee-full-row">
          <td><strong>Full Prepaid (Lowest Fee)</strong></td>
          <td class="fee-right"><strong>£${fullPrepaidFeeTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</strong></td>
        </tr>
        ${
          option === "part"
            ? `<tr class="fee-savings-row">
                 <td colspan="2">
                   <span class="fee-savings-green">
                     You saved £${actualSavings.toLocaleString(undefined, {minimumFractionDigits: 2})} by choosing Part Prepaid.
                   </span><br>
                   <span style="color:#198c0c; font-weight:600;">
                     But you could have saved an extra £${possibleExtraSavings.toLocaleString(undefined, {minimumFractionDigits: 2})} by paying Full Prepaid.
                   </span>
                 </td>
               </tr>`
            : option === "nsnf"
              ? `<tr class="fee-savings-row">
                   <td colspan="2">
                     <span class="fee-savings-green">
                       You are on the No Sale No Fee option. Paying Part or Full Prepaid can save you money.
                     </span>
                   </td>
                 </tr>`
              : `<tr>
                   <td colspan="2" style="color:#666; text-align:center;">You are already on the lowest fee</td>
                 </tr>`
        }
      </table>
    </div>
  `;
}

// Handles showing/hiding the additional prepaid input for "Part Prepaid"
function toggleAdditionalInput() {
  var option = document.getElementById("option").value;
  var additionalGroup = document.getElementById("additionalGroup");
  if (option === "part") {
    additionalGroup.style.display = "block";
  } else {
    additionalGroup.style.display = "none";
    document.getElementById("additional").value = "";
  }
}

// Calculator Tab Switcher
function showCalculator(which) {
  document.getElementById("main-calculator").classList.toggle("hidden", which !== "main");
  document.getElementById("comparison-calculator").classList.toggle("hidden", which !== "comparison");
  document.getElementById("switch-main").classList.toggle("active", which === "main");
  document.getElementById("switch-comparison").classList.toggle("active", which === "comparison");
}

// PDF download function (unchanged)
function downloadPDF() {
  const element = document.getElementById("quoteResult");
  const opt = {
    margin: 0.5,
    filename: `FeeQuote_${new Date().toISOString().split("T")[0]}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
  };
  html2pdf().set(opt).from(element).save();
}

// Comparison Calculator Logic
function calculateComparison() {
  const asking = parseFloat(document.getElementById("askingPrice").value) || 0;
  const ourPercent = parseFloat(document.getElementById("ourPercentAchieved").value) || 0;
  const otherPercent = parseFloat(document.getElementById("otherPercentAchieved").value) || 0;
  const ourFeeRate = parseFloat(document.getElementById("ourFeePercent").value) || 0;
  const otherFeeRate = parseFloat(document.getElementById("otherFeePercent").value) || 0;

  // Calculate likely sale price
  const ourLikely = (asking * (ourPercent / 100));
  const otherLikely = (asking * (otherPercent / 100));
  document.getElementById("ourLikelyPrice").value = ourLikely ? `£${ourLikely.toLocaleString(undefined,{maximumFractionDigits:2})}` : "";
  document.getElementById("otherLikelyPrice").value = otherLikely ? `£${otherLikely.toLocaleString(undefined,{maximumFractionDigits:2})}` : "";

  // Calculate agent fee
  const ourFeePounds = (ourLikely * (ourFeeRate / 100));
  const otherFeePounds = (otherLikely * (otherFeeRate / 100));
  document.getElementById("ourFeePounds").value = ourFeePounds ? `£${ourFeePounds.toLocaleString(undefined,{maximumFractionDigits:2})}` : "";
  document.getElementById("otherFeePounds").value = otherFeePounds ? `£${otherFeePounds.toLocaleString(undefined,{maximumFractionDigits:2})}` : "";

  // Net to property owner
  const ourNet = ourLikely - ourFeePounds;
  const otherNet = otherLikely - otherFeePounds;
  document.getElementById("ourNetFigure").value = (ourLikely && ourFeePounds) ? `£${ourNet.toLocaleString(undefined,{maximumFractionDigits:2})}` : "";
  document.getElementById("otherNetFigure").value = (otherLikely && otherFeePounds) ? `£${otherNet.toLocaleString(undefined,{maximumFractionDigits:2})}` : "";

  // Extra in your pocket
  const extra = ourNet - otherNet;
  document.getElementById("extraPocket").textContent =
    (!isNaN(extra) && extra !== 0)
      ? `£${extra.toLocaleString(undefined,{maximumFractionDigits:2})}`
      : `£0.00`;
  document.getElementById("extraPocketCaption").textContent = "Extra in YOUR Pocket";
}

function resetComparison() {
  document.getElementById("propertyName").value = "";
  document.getElementById("askingPrice").value = "";
  document.getElementById("ourPercentAchieved").value = "";
  document.getElementById("otherPercentAchieved").value = "";
  document.getElementById("ourLikelyPrice").value = "";
  document.getElementById("otherLikelyPrice").value = "";
  document.getElementById("ourFeePercent").value = "";
  document.getElementById("otherFeePercent").value = "";
  document.getElementById("ourFeePounds").value = "";
  document.getElementById("otherFeePounds").value = "";
  document.getElementById("ourNetFigure").value = "";
  document.getElementById("otherNetFigure").value = "";
  document.getElementById("extraPocket").textContent = "£0.00";
  document.getElementById("extraPocketCaption").textContent = "Extra in YOUR Pocket";
}

// Set up events after DOM loads
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('option').addEventListener('change', toggleAdditionalInput);
  toggleAdditionalInput();
  // Enable tab switching
  document.getElementById('switch-main').addEventListener('click', function() { showCalculator('main'); });
  document.getElementById('switch-comparison').addEventListener('click', function() { showCalculator('comparison'); });
});
