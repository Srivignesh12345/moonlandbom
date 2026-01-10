// Initialize Firebase
firebase.initializeApp(window.FIREBASE_CONFIG);

// Initialize Firestore
const db = firebase.firestore();
// Track currently loaded BOM (edit mode)
let currentBOMId = null;


console.log("Firebase connected successfully");

// ✅ SAFE helper to get last dynamic block
function getLastBlock(selector) {
    const blocks = document.querySelectorAll(selector);
    if (!blocks.length) return null;
    return blocks[blocks.length - 1];
}




// ================================
// SAVE BOM TO FIREBASE
// ================================
async function saveBOMToFirebase() {
    try {
        const data = collectFormData();
        data.updatedAt = firebase.firestore.FieldValue.serverTimestamp();

        // 🟢 EDIT MODE → overwrite same BOM
        if (currentBOMId) {
            await db.collection("boms").doc(currentBOMId).update(data);
            alert("✅ Entry updated successfully");
        }
        // 🟢 NEW MODE → create new BOM
        else {
            data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            await db.collection("boms").add(data);
            alert("✅ New entry saved successfully");
        }

        // Reset edit mode after save
        currentBOMId = null;

    } catch (err) {
        console.error(err);
        alert("❌ Save failed");
    }
}



// ================================
// LOAD SAVED ENTRIES FROM FIREBASE
// ================================
// ================================
// LOAD SAVED ENTRIES FROM FIREBASE
// ================================
async function loadSavedEntriesFromFirebase() {
    const savedList = document.getElementById('savedList');
    if (!savedList) return;

    savedList.innerHTML = 'Loading...';

    try {
        const snapshot = await db
            .collection('boms')
            .orderBy('createdAt', 'desc') // 🔽 latest first
            .get();

        savedList.innerHTML = '';

        if (snapshot.empty) {
            savedList.innerHTML = '<p>No saved entries</p>';
            return;
        }

        snapshot.forEach(doc => {
    const data = doc.data();
    data._id = doc.id; // 🔥 store Firestore document ID


            const div = document.createElement('div');
            div.style.borderBottom = '1px solid #ddd';
            div.style.padding = '8px 4px';
            div.style.cursor = 'pointer';

            div.innerHTML = `
                <strong>Order:</strong> ${data.orderNumber || '-'}<br>
                <strong>Buyer:</strong> ${data.buyerName || '-'}<br>
                <strong>Total:</strong> ${data.grandTotal || 0}<br>
                <small style="color:#666;">
                    ${data.createdAt ? data.createdAt.toDate().toLocaleString() : ''}
                </small>
            `;

            // 👉 Click to load this BOM back into the form
            div.addEventListener('click', () => {
                loadBOMIntoForm(data);
            });

            savedList.appendChild(div);
        });

    } catch (error) {
        console.error('Error loading saved entries:', error);
        savedList.innerHTML = '<p style="color:red;">Failed to load entries</p>';
    }
}
function resetContainer(containerId, blockClass) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const template = container.querySelector(blockClass);
    container.innerHTML = '';
    if (template) {
        container.appendChild(template);
    }
}



// ================================
// LOAD BOM DATA INTO FORM
// ================================
// ================================
// LOAD BOM DATA INTO FORM (FULL)
// ================================
function loadBOMIntoForm(data) {

    // 🔥 ENABLE EDIT MODE
    currentBOMId = data._id || null;

    /* =========================
       1️⃣ RESET FORM & BLOCKS
    ========================= */
    document.getElementById('bomForm').reset();

    resetContainer('fabricBlocks', '.fabric-block');
resetContainer('collarBlocks', '.collar-block');
resetContainer('cuffBlocks', '.cuff-block');
resetContainer('buttonBlocks', '.button-block');
resetContainer('velvetBlocks', '.velvet-block');
resetContainer('washCareBlocks', '.washcare-block');
resetContainer('wovenBlocks', '.woven-block');


    /* =========================
       2️⃣ ORDER INFORMATION
    ========================= */
    const oi = data.orderInfo || {};
    document.getElementById('orderDate').value = oi.orderDate || '';
    document.getElementById('expectedDeliveryDate').value = oi.expectedDeliveryDate || '';
    document.getElementById('orderNumber').value = oi.orderNumber || '';
    document.getElementById('orderType').value = oi.orderType || '';
    document.getElementById('buyerName').value = oi.buyerName || '';

    /* =========================
       3️⃣ FABRICS
    ========================= */
  (data.fabrics || []).forEach((fab, idx) => {
    // For first row, use existing block; for others, add new
    if (idx > 0) {
      document.querySelector('.add-fabric-btn')?.click();
    }

    const block = idx === 0 ? document.querySelector('.fabric-block') : getLastBlock('.fabric-block');
    if (!block) return;

    block.querySelector('.fabricType').value = fab.type || '';
    block.querySelector('.fabricColor').value = fab.color || '';
    block.querySelector('.fabricAmount').value = fab.amount || '';
    block.querySelector('.fabricUnit').value = fab.unit || '';
    block.querySelector('.fabricPerGarment').value = fab.perGarment || '';
    block.querySelector('.fabricSupplier').value = fab.supplier || '';
    block.querySelector('.fabricQty').value = fab.qty || '';
    block.querySelector('.fabricTotal').value = fab.total || '';
});


    /* =========================
       4️⃣ COLLARS
    ========================= */
    (data.collars || []).forEach((col, idx) => {
        if (idx > 0) {
            document.querySelector('.add-collar-btn').click();
        }
        const block = idx === 0 ? document.querySelector('.collar-block') : getLastBlock('.collar-block');
        if (!block) return;

        block.querySelector('.collarSize').value = col.size || '';
        block.querySelector('.collarDimensions').value = col.dimensions || '';
        block.querySelector('.collarUnit').value = col.unit || '';
        block.querySelector('.collarPerGarment').value = col.perGarment || '';
        block.querySelector('.collarSupplier').value = col.supplier || '';
        block.querySelector('.collarQty').value = col.qty || '';
        block.querySelector('.collarTotal').value = col.total || '';
    });

    /* =========================
       5️⃣ CUFFS
    ========================= */
    (data.cuffs || []).forEach((cuf, idx) => {
        if (idx > 0) {
            document.querySelector('.add-cuff-btn').click();
        }
        const block = idx === 0 ? document.querySelector('.cuff-block') : getLastBlock('.cuff-block');
        if (!block) return;

        block.querySelector('.cuffSize').value = cuf.size || '';
        block.querySelector('.cuffDimensions').value = cuf.dimensions || '';
        block.querySelector('.cuffUnit').value = cuf.unit || '';
        block.querySelector('.cuffPerGarment').value = cuf.perGarment || '';
        block.querySelector('.cuffSupplier').value = cuf.supplier || '';
        block.querySelector('.cuffQty').value = cuf.qty || '';
        block.querySelector('.cuffTotal').value = cuf.total || '';
    });

    /* =========================
       6️⃣ BUTTONS
    ========================= */
    (data.buttons || []).forEach((btn, idx) => {
        if (idx > 0) {
            document.querySelector('.add-button-btn').click();
        }
        const block = idx === 0 ? document.querySelector('.button-block') : getLastBlock('.button-block');
        if (!block) return;

        block.querySelector('.buttonMaterial').value = btn.material || '';
        block.querySelector('.buttonAmount').value = btn.amount || '';
        block.querySelector('.buttonUnit').value = btn.unit || '';
        block.querySelector('.buttonPerGarment').value = btn.perGarment || '';
        block.querySelector('.buttonSupplier').value = btn.supplier || '';
        block.querySelector('.buttonQty').value = btn.qty || '';
        block.querySelector('.buttonTotal').value = btn.total || '';
    });

    /* =========================
       7️⃣ VELVET TAPES
    ========================= */
    (data.velvetTapes || []).forEach((v, idx) => {
        if (idx > 0) {
            document.querySelector('.add-velvet-btn').click();
        }
        const block = idx === 0 ? document.querySelector('.velvet-block') : getLastBlock('.velvet-block');
        if (!block) return;

        block.querySelector('.velvetTapeQuality').value = v.quality || '';
        block.querySelector('.velvetTapeMeter').value = v.meter || '';
        block.querySelector('.velvetTapeUnit').value = v.unit || '';
        block.querySelector('.velvetTapePerGarment').value = v.perGarment || '';
        block.querySelector('.velvetTapeSupplier').value = v.supplier || '';
        block.querySelector('.velvetTapeQty').value = v.qty || '';
        block.querySelector('.velvetTapeTotal').value = v.total || '';
    });

    /* =========================
       8️⃣ WASH CARE LABELS
    ========================= */
    (data.washCareLabels || []).forEach((w, idx) => {
        if (idx > 0) {
            document.querySelector('.add-washcare-btn').click();
        }
        const block = idx === 0 ? document.querySelector('.washcare-block') : getLastBlock('.washcare-block');
        if (!block) return;

        block.querySelector('.washCareQuality').value = w.quality || '';
        block.querySelector('.washCareAmount').value = w.amount || '';
        block.querySelector('.washCareUnit').value = w.unit || '';
        block.querySelector('.washCarePerGarment').value = w.perGarment || '';
        block.querySelector('.washCareSupplier').value = w.supplier || '';
        block.querySelector('.washCareQty').value = w.qty || '';
        block.querySelector('.washCareTotal').value = w.total || '';
    });

    /* =========================
       9️⃣ WOVEN SIZE LABELS
    ========================= */
    (data.wovenSizes || []).forEach((ws, idx) => {
        if (idx > 0) {
            document.querySelector('.add-woven-btn').click();
        }
        const block = idx === 0 ? document.querySelector('.woven-block') : getLastBlock('.woven-block');
        if (!block) return;

        block.querySelector('.wovenSizeLabel').value = ws.size || '';
        block.querySelector('.wovenSizeAmount').value = ws.amount || '';
        block.querySelector('.wovenSizeUnit').value = ws.unit || '';
        block.querySelector('.wovenSizePerGarment').value = ws.perGarment || '';
        block.querySelector('.wovenSizeSupplier').value = ws.supplier || '';
        block.querySelector('.wovenSizeQty').value = ws.qty || '';
        block.querySelector('.wovenSizeTotal').value = ws.total || '';
    });

    /* =========================
       COLLAR YARN (Static Fields)
    ========================= */
    document.getElementById('collarYarnType').value = data.collarYarnType || '';
    document.getElementById('collarYarnAmount').value = data.collarYarnAmount || '';
    document.getElementById('collarYarnUnit').value = data.collarYarnUnit || '';
    document.getElementById('collarYarnPerGarment').value = data.collarYarnPerGarment || '';
    document.getElementById('collarYarnSupplier').value = data.collarYarnSupplier || '';
    document.getElementById('collarYarnQty').value = data.collarYarnQty || '';

    /* =========================
       TIPPING YARN (Static Fields)
    ========================= */
    document.getElementById('tippingYarnType').value = data.tippingYarnType || '';
    document.getElementById('tippingYarnAmount').value = data.tippingYarnAmount || '';
    document.getElementById('tippingYarnUnit').value = data.tippingYarnUnit || '';
    document.getElementById('tippingYarnPerGarment').value = data.tippingYarnPerGarment || '';
    document.getElementById('tippingYarnSupplier').value = data.tippingYarnSupplier || '';
    document.getElementById('tippingYarnQty').value = data.tippingYarnQty || '';

    /* =========================
       POLYBAGS (Static Fields)
    ========================= */
    document.getElementById('polybagQuality').value = data.polybagQuality || '';
    document.getElementById('polybagSize').value = data.polybagSize || '';
    document.getElementById('polybagUnit').value = data.polybagUnit || '';
    document.getElementById('polybagPerGarment').value = data.polybagPerGarment || '';
    document.getElementById('polybagSupplier').value = data.polybagSupplier || '';
    document.getElementById('polybagQty').value = data.polybagQty || '';

    /* =========================
       PRINTING & PACKAGING (Static Fields)
    ========================= */
    document.getElementById('printing').value = data.printing || '';
    document.getElementById('embroidery').value = data.embroidery || '';
    if (document.getElementById('printFront')) document.getElementById('printFront').value = data.printFront || '';
    if (document.getElementById('printBack')) document.getElementById('printBack').value = data.printBack || '';
    if (document.getElementById('printSleeve')) document.getElementById('printSleeve').value = data.printSleeve || '';
    if (document.getElementById('packing')) document.getElementById('packing').value = data.packing || '';
    if (document.getElementById('packingDetails')) document.getElementById('packingDetails').value = data.packing || '';
    if (document.getElementById('tagRequired')) document.getElementById('tagRequired').value = data.tagRequired || '';

    /* =========================
       🔟 TOTAL
    ========================= */
    document.getElementById('grandTotal').textContent = data.grandTotal || 0;

    alert("✅ Entry loaded into form successfully");
}





    // Global variables
    let formData = {};

    // Quantity formatting helper
function formatQuantity(value) {
    const num = parseFloat(String(value).replace(/[^0-9.]/g, '')) || 0;
    // Show up to 6 decimals and trim trailing zeros
    let s = Number(num.toFixed(6)).toString();
    if (s.indexOf('.') >= 0) s = s.replace(/\.0+$|0+$/,'').replace(/\.$/, '');
    return s;
}

function safeNumber(value) {
    const num = parseFloat(String(value).replace(/[^0-9.]/g, ''));
    return isNaN(num) ? 0 : num;
}

    // DOM Content Loaded
    document.addEventListener('DOMContentLoaded', function() {
        initializeForm();
        setupEventListeners();
        setupCalculationListeners();
        setupTheme();
        setupScrollAnimations();
        // setupProgressBar(); // Disabled to avoid visual issues
        setupScrollIndicator();
        setupScrollToTop();
    });

    // Initialize form
    function initializeForm() {
        // No default values set - let users enter their own data
        // All form fields will start empty
    }

    // Setup event listeners
    function setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Export and action buttons
        const excelBtn = document.getElementById('exportExcelBtn');
        const clearBtn = document.getElementById('clearBtn');

            // Currency change → recalculate totals


        
        if (excelBtn) {
            excelBtn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('Excel button clicked!');
                exportToExcel();
            });
            console.log('Excel button listener added');
        } else {
            console.error('Excel button not found!');
        }
        
        
        
        if (clearBtn) {
            currentBOMId = null;

            console.log('Clear button listener added');
        }

        // Save / Saved Entries UI
        const saveBtn = document.getElementById('saveBtn');
        const showSavedBtn = document.getElementById('showSavedBtn');
        const savedPanel = document.getElementById('savedEntriesPanel');
        const savedList = document.getElementById('savedList');
        const closeSavedBtn = document.getElementById('closeSavedBtn');
        const clearSavedBtn = document.getElementById('clearSavedBtn');

        if (saveBtn) {
            saveBtn.addEventListener('click', function(e) {
    e.preventDefault();

         // existing localStorage save
    saveBOMToFirebase();     // NEW Firebase save
});

        }

      if (showSavedBtn) {
    showSavedBtn.addEventListener('click', function(e) {
        e.preventDefault();
        if (!savedPanel) return;

        if (savedPanel.style.display === 'none' || !savedPanel.style.display) {
            loadSavedEntriesFromFirebase(); // 🔥 Firebase ONLY
            savedPanel.style.display = 'block';
        } else {
            savedPanel.style.display = 'none';
        }
    });
}

        if (closeSavedBtn) {
            closeSavedBtn.addEventListener('click', function() {
                if (savedPanel) savedPanel.style.display = 'none';
            });
        }

        if (clearSavedBtn) {
            clearSavedBtn.addEventListener('click', function() {
                if (!confirm('Clear all saved entries?')) return;
                localStorage.removeItem('bom_entries');
                renderSavedEntries();
            });
        }

        // Export / Import JSON
        const exportJsonBtn = document.getElementById('exportJsonBtn');
        const importJsonBtn = document.getElementById('importJsonBtn');
        const importFileInput = document.getElementById('importFileInput');

        if (exportJsonBtn) {
            exportJsonBtn.addEventListener('click', function() {
                exportSavedEntries();
            });
        }

        if (importJsonBtn && importFileInput) {
            importJsonBtn.addEventListener('click', function() {
                importFileInput.value = null;
                importFileInput.click();
            });

            importFileInput.addEventListener('change', function(e) {
                const f = e.target.files && e.target.files[0];
                if (!f) return;
                const reader = new FileReader();
                reader.onload = function(evt) {
                    try {
                        const parsed = JSON.parse(String(evt.target.result || '[]'));
                        if (!Array.isArray(parsed)) throw new Error('Invalid format');
                        importSavedEntries(parsed);
                    } catch (err) {
                        alert('Invalid JSON file.');
                        console.error(err);
                    }
                };
                reader.readAsText(f);
            });
        }
        
        // Attach Add-Item button listeners and create counters
        const addBtnMapping = [
            ['.add-fabric-btn', addFabricBlock, 'fabricBlocks'],
            ['.add-button-btn', addButtonBlock, 'buttonBlocks'],
            ['.add-velvet-btn', addVelvetBlock, 'velvetBlocks'],
            ['.add-washcare-btn', addWashCareBlock, 'washCareBlocks'],
            ['.add-woven-btn', addWovenBlock, 'wovenBlocks'],
            ['.add-collar-btn', addCollarBlock, 'collarBlocks'],
            ['.add-cuff-btn', addCuffBlock, 'cuffBlocks']
        ];

        addBtnMapping.forEach(([selector, fn, containerId]) => {
            document.querySelectorAll(selector).forEach(btn => {
                // avoid attaching multiple listeners if setupEventListeners runs more than once
                if (!btn.dataset.listenerBound) {
                    btn.addEventListener('click', function(e) {
                        e.preventDefault();
                        if (btn.disabled) return; // debounce double clicks
                        btn.disabled = true;
                        try {
                            console.log(`Add button clicked for ${selector}`);
                            fn();
                            // after adding, update counters
                            updateSectionCounts(containerId, btn);
                        } finally {
                            // re-enable after a short delay
                            setTimeout(() => { btn.disabled = false; }, 300);
                        }
                    });
                    btn.dataset.listenerBound = 'true';
                }

                // Ensure button is visible and clickable - add a focus outline
                btn.style.cursor = 'pointer';
                btn.style.pointerEvents = 'auto';
            });
        });



        // Utility: update a section counter (called after add)
        function updateSectionCounts(containerId, btn) {
            // Removed persistent section-count display per user request
            return;
        }

        // Form submission
        const form = document.getElementById('bomForm');
        if (form) {
            form.addEventListener('submit', function(e) {
            e.preventDefault();
            calculateAllTotals();
        });
        }
    }

    // Setup calculation listeners for real-time updates
    function setupCalculationListeners() {
        const calculationFields = [
            'fabricAmount', 'fabricPerGarment', 'fabricQty',
            'collarYarnAmount', 'collarYarnPerGarment', 'collarYarnQty',
            'tippingYarnAmount', 'tippingYarnPerGarment', 'tippingYarnQty',
            'collarPerGarment', 'collarQty',
            'cuffPerGarment', 'cuffQty',
            'buttonAmount', 'buttonPerGarment', 'buttonQty',
            'velvetTapeMeter', 'velvetTapePerGarment', 'velvetTapeQty',
            'washCareAmount', 'washCarePerGarment', 'washCareQty',
            'wovenSizeAmount', 'wovenSizePerGarment', 'wovenSizeQty',
            'polybagPerGarment', 'polybagQty'
        ];
        
        calculationFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('input', calculateAllTotals);
                field.addEventListener('change', calculateAllTotals);
            }
        });
    }

    // Theme setup and utilities
    function setupTheme() {
        try {
            const savedTheme = localStorage.getItem('moonland_theme');
            const osPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            const initialTheme = savedTheme || (osPrefersDark ? 'dark' : 'light');
            applyTheme(initialTheme);

            // Toggle button support if present
            const toggleButton = document.getElementById('themeToggle');
            if (toggleButton) {
                toggleButton.addEventListener('click', function() {
                    const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
                    applyTheme(current);
                });
            }

            // React to OS theme changes dynamically
            if (window.matchMedia) {
                const mql = window.matchMedia('(prefers-color-scheme: dark)');
                if (typeof mql.addEventListener === 'function') {
                    mql.addEventListener('change', function(e) {
                        const userSet = localStorage.getItem('moonland_theme');
                        if (!userSet) {
                            applyTheme(e.matches ? 'dark' : 'light');
                        }
                    });
                } else if (typeof mql.addListener === 'function') {
                    // Older browsers
                    mql.addListener(function(e) {
                        const userSet = localStorage.getItem('moonland_theme');
                        if (!userSet) {
                            applyTheme(e.matches ? 'dark' : 'light');
                        }
                    });
                }
            }
        } catch (err) {
            console.error('Error setting up theme:', err);
        }

        document.addEventListener('input', function (e) {
    calculateAllTotals();
});

    }

    function applyTheme(theme) {
        if (theme !== 'light' && theme !== 'dark') return;
        document.documentElement.setAttribute('data-theme', theme);
        try {
            localStorage.setItem('moonland_theme', theme);
        } catch (_) {
            // ignore storage errors
        }
    }

    // Calculate individual section totals
    function calculateSectionTotal(amountId, perGarmentId, qtyId, totalId) {
        const amountField = amountId ? document.getElementById(amountId) : null;
        const amount = amountField ? parseFloat(amountField.value || 0) : 0;
        const perGarment = parseFloat(document.getElementById(perGarmentId)?.value || 0);
        const qty = parseFloat(document.getElementById(qtyId)?.value || 0);
        
        const hasAmount = Boolean(amountField);
        const total = hasAmount ? (amount * perGarment * qty) : (perGarment * qty);
        
        const totalField = document.getElementById(totalId);
        if (totalField) {
            // store raw numeric quantity for exports and calculations
            totalField.dataset.inr = String(Number((total || 0).toFixed(6)));
            // display numeric quantity
            totalField.value = formatQuantity(total);
        }
        return total;
    }

    function calculateMultipleCollars() {
        let total = 0;

        document.querySelectorAll('.collar-block').forEach(block => {
            const perGarment = parseFloat(block.querySelector('.collarPerGarment')?.value || 0);
            const qty = parseFloat(block.querySelector('.collarQty')?.value || 0);

            const amount = perGarment * qty;

            const totalField = block.querySelector('.collarTotal');
            if (totalField) {
                totalField.dataset.inr = String(Number((amount || 0).toFixed(6)));
                totalField.value = formatQuantity(amount);
            }

            total += amount;
        });

        return total;
    }

    function calculateMultipleCuffs() {
        let total = 0;

        document.querySelectorAll('.cuff-block').forEach(block => {
            const perGarment = parseFloat(block.querySelector('.cuffPerGarment')?.value || 0);
            const qty = parseFloat(block.querySelector('.cuffQty')?.value || 0);

            const amount = perGarment * qty;

            const totalField = block.querySelector('.cuffTotal');
            if (totalField) {
                totalField.dataset.inr = String(Number((amount || 0).toFixed(6)));
                totalField.value = formatQuantity(amount);
            }

            total += amount;
        });

        return total;
    }

    function calculateMultipleButtons() {
        let total = 0;
        document.querySelectorAll('.button-block').forEach(block => {
            const perGarment = parseFloat(block.querySelector('.buttonPerGarment')?.value || 0);
            const qty = parseFloat(block.querySelector('.buttonQty')?.value || 0);
            const amount = perGarment * qty;
            const totalField = block.querySelector('.buttonTotal');
            if (totalField) {
                totalField.dataset.inr = String(Number((amount || 0).toFixed(6)));
                totalField.value = formatQuantity(amount);
            }
            total += amount;
        });
        return total;
    }

    function calculateMultipleVelvet() {
        let total = 0;
        document.querySelectorAll('.velvet-block').forEach(block => {
            const perGarment = parseFloat(block.querySelector('.velvetTapePerGarment')?.value || 0);
            const qty = parseFloat(block.querySelector('.velvetTapeQty')?.value || 0);
            const amount = perGarment * qty;
            const totalField = block.querySelector('.velvetTapeTotal');
            if (totalField) {
                totalField.dataset.inr = String(Number((amount || 0).toFixed(6)));
                totalField.value = formatQuantity(amount);
            }
            total += amount;
        });
        return total;
    }

    function calculateMultipleWashCare() {
        let total = 0;
        document.querySelectorAll('.washcare-block').forEach(block => {
            const perGarment = parseFloat(block.querySelector('.washCarePerGarment')?.value || 0);
            const qty = parseFloat(block.querySelector('.washCareQty')?.value || 0);
            const amount = perGarment * qty;
            const totalField = block.querySelector('.washCareTotal');
            if (totalField) {
                totalField.dataset.inr = String(Number((amount || 0).toFixed(6)));
                totalField.value = formatQuantity(amount);
            }
            total += amount;
        });
        return total;
    }

    function calculateMultipleWoven() {
        let total = 0;
        document.querySelectorAll('.woven-block').forEach(block => {
            const perGarment = parseFloat(block.querySelector('.wovenSizePerGarment')?.value || 0);
            const qty = parseFloat(block.querySelector('.wovenSizeQty')?.value || 0);
            const amount = perGarment * qty;
            const totalField = block.querySelector('.wovenSizeTotal');
            if (totalField) {
                totalField.dataset.inr = String(Number((amount || 0).toFixed(6)));
                totalField.value = formatQuantity(amount);
            }
            total += amount;
        });
        return total;
    }

    // Calculate all totals
    function calculateAllTotals() {
        let grandTotal = 0;
        
        // Fabrics (multiple blocks)
        grandTotal += calculateMultipleFabrics();
        
        // Fabric 2 removed (no second fabric section in input)
        
        // Collar Yarn
        grandTotal += calculateSectionTotal('collarYarnAmount', 'collarYarnPerGarment', 'collarYarnQty', 'collarYarnTotal');
        
        // Tipping Yarn
        grandTotal += calculateSectionTotal('tippingYarnAmount', 'tippingYarnPerGarment', 'tippingYarnQty', 'tippingYarnTotal');
        
        // Collar (only per garment * qty)
        // Multiple Collar Measurements
            grandTotal += calculateMultipleCollars();


        
        // Multiple Cuff Measurements
        grandTotal += calculateMultipleCuffs();
        
        // Buttons (multiple blocks handled)
        grandTotal += calculateMultipleButtons();
        
        // Velvet Tapes (multiple blocks)
        grandTotal += calculateMultipleVelvet();
        
        // Wash Care Labels (multiple blocks)
        grandTotal += calculateMultipleWashCare();
        
        // Woven Size Labels (multiple blocks)
        grandTotal += calculateMultipleWoven();
        
        // Polybags (only per garment * qty)
        grandTotal += calculateSectionTotal('', 'polybagPerGarment', 'polybagQty', 'polybagTotal');
        
        // Update grand total display (quantity-based)
        document.getElementById('grandTotal').textContent = formatQuantity(grandTotal);
    
        return grandTotal;
    }
    // Generic helper to add a new repeatable block
function addBlock({containerId, blockSelector, feedbackText = 'Added', focus = true}) {
    const container = document.getElementById(containerId);
    if (!container) { console.warn(`addBlock: container ${containerId} not found`); return null; }

    const template = container.querySelector(blockSelector);
    if (!template) { console.warn(`addBlock: template ${blockSelector} not found in ${containerId}`); return null; }

    const clone = template.cloneNode(true);

    clone.querySelectorAll('input, select, textarea').forEach(el => {
        if (el.id) el.removeAttribute('id');
        if (el.tagName === 'SELECT') el.selectedIndex = 0;
        else if (el.type === 'checkbox' || el.type === 'radio') el.checked = false;
        else el.value = '';
        // attach listeners so cloned inputs recalc
        el.addEventListener('input', calculateAllTotals);
        el.addEventListener('change', calculateAllTotals);
    });

    container.appendChild(clone);

    const count = container.querySelectorAll(blockSelector).length;

    clone.scrollIntoView({behavior:'smooth', block:'center'});
    const firstInput = clone.querySelector('input, select, textarea');
    if (firstInput && focus) firstInput.focus();

    clone.classList.add('newly-added');
    setTimeout(() => clone.classList.remove('newly-added'), 1800);

    // transient feedback and update counter
    const addBtnWrap = container.parentElement ? container.parentElement.querySelector('.add-btn-container') : null;
    if (addBtnWrap) {
        const fb = document.createElement('div'); fb.className = 'add-feedback'; fb.textContent = `${feedbackText}`;
        addBtnWrap.appendChild(fb);
        setTimeout(() => { fb.classList.add('fade-out'); setTimeout(()=>fb.remove(),300); }, 900);
    }

    calculateAllTotals();
    return clone;
}

// Section-specific wrappers (use the generic helper)
function addCollarBlock() { addBlock({containerId: 'collarBlocks', blockSelector: '.collar-block', feedbackText: 'Added collar size'}); } 

function addCuffBlock() { addBlock({containerId: 'cuffBlocks', blockSelector: '.cuff-block', feedbackText: 'Added cuff size'}); } 

function addButtonBlock() { addBlock({containerId: 'buttonBlocks', blockSelector: '.button-block', feedbackText: 'Added button item'}); } 

function addVelvetBlock() { addBlock({containerId: 'velvetBlocks', blockSelector: '.velvet-block', feedbackText: 'Added velvet tape'}); } 

function addWashCareBlock() { addBlock({containerId: 'washCareBlocks', blockSelector: '.washcare-block', feedbackText: 'Added wash care label'}); } 

function addWovenBlock() { addBlock({containerId: 'wovenBlocks', blockSelector: '.woven-block', feedbackText: 'Added woven label'}); } 

function addFabricBlock() { addBlock({containerId: 'fabricBlocks', blockSelector: '.fabric-block', feedbackText: 'Added fabric'}); } 

// removeBlock handler removed per user request

function calculateMultipleFabrics() {
    let total = 0;
    document.querySelectorAll('.fabric-block').forEach(block => {
        const amount = parseFloat(block.querySelector('.fabricAmount')?.value || 0);
        const perGarment = parseFloat(block.querySelector('.fabricPerGarment')?.value || 0);
        const qty = parseFloat(block.querySelector('.fabricQty')?.value || 0);
        const hasAmount = Boolean(block.querySelector('.fabricAmount'));
        const val = hasAmount ? (amount * perGarment * qty) : (perGarment * qty);
        const totalField = block.querySelector('.fabricTotal');
        if (totalField) {
            totalField.dataset.inr = String(Number((val || 0).toFixed(6)));
            totalField.value = formatQuantity(val);
        }
        total += val;
    });
    return total;
}

    // Collect form data
    function collectFormData() {
        const form = document.getElementById('bomForm');
        const formData = new FormData(form);
        const data = {};
        
        // Safe getter for optional inputs - define early so fallbacks can use it
        const getVal = (id) => {
            const el = document.getElementById(id);
            return el ? el.value : '';
        };
        
        // ===== COLLECT MULTIPLE COLLARS =====
        data.collars = [];

    document.querySelectorAll('.collar-block').forEach(block => {
        const totalEl = block.querySelector('.collarTotal');
        const collar = {
            size: block.querySelector('.collarSize')?.value || '',
            dimensions: block.querySelector('.collarDimensions')?.value || '',
            unit: block.querySelector('.collarUnit')?.value || '',
            perGarment: block.querySelector('.collarPerGarment')?.value || '',
            supplier: block.querySelector('.collarSupplier')?.value || '',
            qty: block.querySelector('.collarQty')?.value || '',
            // raw INR value
            total: totalEl && totalEl.dataset && totalEl.dataset.inr ? parseFloat(totalEl.dataset.inr) : 0
        };

        const anyFilled = [collar.size, collar.dimensions, collar.unit, collar.perGarment, collar.supplier, collar.qty, collar.total].some(v => String(v).trim() !== '');
        if (anyFilled) data.collars.push(collar);
    });

        // ===== COLLECT MULTIPLE CUFFS =====
data.cuffs = [];

document.querySelectorAll('.cuff-block').forEach(block => {
    const totalEl = block.querySelector('.cuffTotal');
    const cuff = {
        size: block.querySelector('.cuffSize')?.value || '',
        dimensions: block.querySelector('.cuffDimensions')?.value || '',
        unit: block.querySelector('.cuffUnit')?.value || '',
        perGarment: block.querySelector('.cuffPerGarment')?.value || '',
        supplier: block.querySelector('.cuffSupplier')?.value || '',
        qty: block.querySelector('.cuffQty')?.value || '',
        total: totalEl && totalEl.dataset && totalEl.dataset.inr ? parseFloat(totalEl.dataset.inr) : 0
    };

    const anyFilled = [cuff.size, cuff.dimensions, cuff.unit, cuff.perGarment, cuff.supplier, cuff.qty, cuff.total].some(v => String(v).trim() !== '');
    if (anyFilled) data.cuffs.push(cuff);
});

// If there are no dynamic cuff-blocks, fall back to single cuff fields (existing HTML)
if (data.cuffs.length === 0) {
    const cuffTotalEl = document.getElementById('cuffTotal');
    const singleCuff = {
        size: getVal('cuffSize'),
        dimensions: getVal('cuffDimensions'),
        unit: getVal('cuffUnit'),
        perGarment: getVal('cuffPerGarment'),
        supplier: getVal('cuffSupplier'),
        qty: getVal('cuffQty'),
        total: cuffTotalEl && cuffTotalEl.dataset && cuffTotalEl.dataset.inr ? parseFloat(cuffTotalEl.dataset.inr) : (parseFloat(String(getVal('cuffTotal')||'').replace(/[^0-9.]/g,'')) || 0)
    };
    const anyFilled = [singleCuff.size, singleCuff.dimensions, singleCuff.unit, singleCuff.perGarment, singleCuff.supplier, singleCuff.qty, singleCuff.total].some(v => String(v).trim() !== '');
    if (anyFilled) data.cuffs.push(singleCuff);
}

        // ===== COLLECT BUTTONS =====
        data.buttons = [];
        document.querySelectorAll('.button-block').forEach(block => {
            const totalEl = block.querySelector('.buttonTotal');
            const b = {
                material: block.querySelector('.buttonMaterial')?.value || '',
                amount: block.querySelector('.buttonAmount')?.value || '',
                unit: block.querySelector('.buttonUnit')?.value || '',
                perGarment: block.querySelector('.buttonPerGarment')?.value || '',
                supplier: block.querySelector('.buttonSupplier')?.value || '',
                qty: block.querySelector('.buttonQty')?.value || '',
                total: totalEl && totalEl.dataset && totalEl.dataset.inr ? parseFloat(totalEl.dataset.inr) : 0
            };
            const anyFilledBtn = [b.material, b.amount, b.unit, b.perGarment, b.supplier, b.qty, b.total].some(v => String(v).trim() !== '');
            if (anyFilledBtn) data.buttons.push(b);
        });

        // ===== COLLECT VELVET TAPES =====
        data.velvetTapes = [];
        document.querySelectorAll('.velvet-block').forEach(block => {
            const totalEl = block.querySelector('.velvetTapeTotal');
            const v = {
                quality: block.querySelector('.velvetTapeQuality')?.value || '',
                meter: block.querySelector('.velvetTapeMeter')?.value || '',
                unit: block.querySelector('.velvetTapeUnit')?.value || '',
                perGarment: block.querySelector('.velvetTapePerGarment')?.value || '',
                supplier: block.querySelector('.velvetTapeSupplier')?.value || '',
                qty: block.querySelector('.velvetTapeQty')?.value || '',
                total: totalEl && totalEl.dataset && totalEl.dataset.inr ? parseFloat(totalEl.dataset.inr) : 0
            };
            const anyFilledVel = [v.quality, v.meter, v.unit, v.perGarment, v.supplier, v.qty, v.total].some(vv => String(vv).trim() !== '');
            if (anyFilledVel) data.velvetTapes.push(v);
        });

        // ===== COLLECT WASH CARE LABELS =====
        data.washCareLabels = [];
        document.querySelectorAll('.washcare-block').forEach(block => {
            const totalEl = block.querySelector('.washCareTotal');
            const w = {
                quality: block.querySelector('.washCareQuality')?.value || '',
                amount: block.querySelector('.washCareAmount')?.value || '',
                unit: block.querySelector('.washCareUnit')?.value || '',
                perGarment: block.querySelector('.washCarePerGarment')?.value || '',
                supplier: block.querySelector('.washCareSupplier')?.value || '',
                qty: block.querySelector('.washCareQty')?.value || '',
                total: totalEl && totalEl.dataset && totalEl.dataset.inr ? parseFloat(totalEl.dataset.inr) : 0
            };
            const anyFilledWash = [w.quality, w.amount, w.unit, w.perGarment, w.supplier, w.qty, w.total].some(vv => String(vv).trim() !== '');
            if (anyFilledWash) data.washCareLabels.push(w);
        });

        // ===== COLLECT WOVEN SIZE LABELS =====
        data.wovenSizes = [];
        document.querySelectorAll('.woven-block').forEach(block => {
            const totalEl = block.querySelector('.wovenSizeTotal');
            const s = {
                size: block.querySelector('.wovenSizeLabel')?.value || '',
                amount: block.querySelector('.wovenSizeAmount')?.value || '',
                unit: block.querySelector('.wovenSizeUnit')?.value || '',
                perGarment: block.querySelector('.wovenSizePerGarment')?.value || '',
                supplier: block.querySelector('.wovenSizeSupplier')?.value || '',
                qty: block.querySelector('.wovenSizeQty')?.value || '',
                total: totalEl && totalEl.dataset && totalEl.dataset.inr ? parseFloat(totalEl.dataset.inr) : 0
            };
            const anyFilledWoven = [s.size, s.amount, s.unit, s.perGarment, s.supplier, s.qty, s.total].some(vv => String(vv).trim() !== '');
            if (anyFilledWoven) data.wovenSizes.push(s);
        });

        // ===== COLLECT FABRICS =====
        data.fabrics = [];
        document.querySelectorAll('.fabric-block').forEach(block => {
            const totalEl = block.querySelector('.fabricTotal');
            const f = {
                type: block.querySelector('.fabricType')?.value || '',
                color: block.querySelector('.fabricColor')?.value || '',
                amount: block.querySelector('.fabricAmount')?.value || '',
                unit: block.querySelector('.fabricUnit')?.value || '',
                perGarment: block.querySelector('.fabricPerGarment')?.value || '',
                supplier: block.querySelector('.fabricSupplier')?.value || '',
                qty: block.querySelector('.fabricQty')?.value || '',
                total: totalEl && totalEl.dataset && totalEl.dataset.inr ? parseFloat(totalEl.dataset.inr) : 0
            };
            const anyFilledFabric = [f.type, f.color, f.amount, f.unit, f.perGarment, f.supplier, f.qty, f.total].some(vv => String(vv).trim() !== '');
            if (anyFilledFabric) data.fabrics.push(f);
        });

        // If there are no dynamic fabric-blocks, fall back to single fabric fields (existing HTML)
        if (data.fabrics.length === 0) {
            const fabricTotalEl = document.getElementById('fabricTotal');
            const singleFabric = {
                type: getVal('fabricType'),
                color: getVal('fabricColor'),
                amount: getVal('fabricAmount'),
                unit: getVal('fabricUnit'),
                perGarment: getVal('fabricPerGarment'),
                supplier: getVal('fabricSupplier'),
                qty: getVal('fabricQty'),
                total: fabricTotalEl && fabricTotalEl.dataset && fabricTotalEl.dataset.inr ? parseFloat(fabricTotalEl.dataset.inr) : (parseFloat(String(getVal('fabricTotal')||'').replace(/[^0-9.]/g,'')) || 0)
            };
            const anyFilledFabric = [singleFabric.type, singleFabric.color, singleFabric.amount, singleFabric.unit, singleFabric.perGarment, singleFabric.supplier, singleFabric.qty, singleFabric.total].some(v => String(v).trim() !== '');
            if (anyFilledFabric) data.fabrics.push(singleFabric);
        }

        
        // Order Information
        data.orderDate = getVal('orderDate');
        data.expectedDeliveryDate = getVal('expectedDeliveryDate');
        data.orderNumber = getVal('orderNumber');
        data.orderType = getVal('orderType');
        data.buyerName = getVal('buyerName') || '';

        // Fabric Section - REMOVED (now handled in data.fabrics array above)

        // Collar Yarn Section
        data.collarYarnType = getVal('collarYarnType');
        data.collarYarnAmount = getVal('collarYarnAmount');
        data.collarYarnUnit = getVal('collarYarnUnit');
        data.collarYarnPerGarment = getVal('collarYarnPerGarment');
        data.collarYarnSupplier = getVal('collarYarnSupplier');
        data.collarYarnQty = getVal('collarYarnQty');

        // Tipping Yarn Section
        data.tippingYarnType = getVal('tippingYarnType');
        data.tippingYarnAmount = getVal('tippingYarnAmount');
        data.tippingYarnUnit = getVal('tippingYarnUnit');
        data.tippingYarnPerGarment = getVal('tippingYarnPerGarment');
        data.tippingYarnSupplier = getVal('tippingYarnSupplier');
        data.tippingYarnQty = getVal('tippingYarnQty');

        // Buttons Section
        data.buttonMaterial = getVal('buttonMaterial');
        data.buttonAmount = getVal('buttonAmount');
        data.buttonUnit = getVal('buttonUnit');
        data.buttonPerGarment = getVal('buttonPerGarment');
        data.buttonSupplier = getVal('buttonSupplier');
        data.buttonQty = getVal('buttonQty');

        // Velvet Tapes Section
        data.velvetTapeQuality = getVal('velvetTapeQuality');
        data.velvetTapeMeter = getVal('velvetTapeMeter');
        data.velvetTapeUnit = getVal('velvetTapeUnit');
        data.velvetTapePerGarment = getVal('velvetTapePerGarment');
        data.velvetTapeSupplier = getVal('velvetTapeSupplier');
        data.velvetTapeQty = getVal('velvetTapeQty');

        // Wash Care Labels Section
        data.washCareQuality = getVal('washCareQuality');
        data.washCareAmount = getVal('washCareAmount');
        data.washCareUnit = getVal('washCareUnit');
        data.washCarePerGarment = getVal('washCarePerGarment');
        data.washCareSupplier = getVal('washCareSupplier');
        data.washCareQty = getVal('washCareQty');

        // Woven Size Labels Section
        data.wovenSizeLabel = getVal('wovenSizeLabel');
        data.wovenSizeAmount = getVal('wovenSizeAmount');
        data.wovenSizeUnit = getVal('wovenSizeUnit');
        data.wovenSizePerGarment = getVal('wovenSizePerGarment');
        data.wovenSizeSupplier = getVal('wovenSizeSupplier');
        data.wovenSizeQty = getVal('wovenSizeQty');

        // Polybags Section
        data.polybagQuality = getVal('polybagQuality');
        data.polybagSize = getVal('polybagSize');
        data.polybagUnit = getVal('polybagUnit');
        data.polybagPerGarment = getVal('polybagPerGarment');
        data.polybagSupplier = getVal('polybagSupplier');
        data.polybagQty = getVal('polybagQty');
        
        // Printing & Packaging fields
        data.printing = getVal('printing');
        data.embroidery = getVal('embroidery');
        data.printFront = getVal('printFront') || '';
        data.printBack = getVal('printBack') || '';
        data.printSleeve = getVal('printSleeve') || '';
        data.packing = getVal('packing') || getVal('packingDetails') || '';
        data.tagRequired = getVal('tagRequired') || '';
        
        // Add calculated totals (raw INR values read from data-inr when available)
        const getNumericTotal = (id) => {
            const el = document.getElementById(id);
            if (!el) return 0;
            if (el.dataset && el.dataset.inr) return parseFloat(el.dataset.inr) || 0;
            const raw = parseFloat(String(el.value || el.textContent || '').replace(/[^0-9.]/g,''));
            return isNaN(raw) ? 0 : raw;
        };

        data.fabricTotal = Array.isArray(data.fabrics) && data.fabrics.length > 0 ? data.fabrics.reduce((s,f)=>s + (parseFloat(f.total)||0), 0) : getNumericTotal('fabricTotal');
        data.collarYarnTotal = getNumericTotal('collarYarnTotal');
        data.tippingYarnTotal = getNumericTotal('tippingYarnTotal');
        data.collarTotal = getNumericTotal('collarTotal');
        data.cuffTotal = getNumericTotal('cuffTotal');
        data.buttonTotal = Array.isArray(data.buttons) && data.buttons.length > 0 ? data.buttons.reduce((s,b)=>s + (parseFloat(b.total)||0), 0) : getNumericTotal('buttonTotal');
        data.velvetTapeTotal = Array.isArray(data.velvetTapes) && data.velvetTapes.length > 0 ? data.velvetTapes.reduce((s,v)=>s + (parseFloat(v.total)||0), 0) : getNumericTotal('velvetTapeTotal');
        data.washCareTotal = Array.isArray(data.washCareLabels) && data.washCareLabels.length > 0 ? data.washCareLabels.reduce((s,w)=>s + (parseFloat(w.total)||0), 0) : getNumericTotal('washCareTotal');
        data.wovenSizeTotal = Array.isArray(data.wovenSizes) && data.wovenSizes.length > 0 ? data.wovenSizes.reduce((s,siz)=>s + (parseFloat(siz.total)||0), 0) : getNumericTotal('wovenSizeTotal');
        data.polybagTotal = getNumericTotal('polybagTotal');
        data.grandTotal = calculateAllTotals();
        
        return data;
    }


    // Show export card with specific file type
    function showExportCard(fileType, message, details) {
        const card = document.createElement('div');
        card.className = 'export-card';
        card.id = 'exportCard';
        
        const icons = {
            excel: 'fas fa-file-excel',
            pdf: 'fas fa-file-pdf', 
            word: 'fas fa-file-alt'
        };
        
        const titles = {
            excel: 'Excel Export',
            pdf: 'PDF Export',
            word: 'Word Export'
        };
        
        card.innerHTML = `
            <div class="export-card-header">
                <div class="export-card-icon ${fileType}">
                    <i class="${icons[fileType]}"></i>
                </div>
                <div>
                    <h3 class="export-card-title">${titles[fileType]}</h3>
                    <p class="export-card-subtitle">${fileType.toUpperCase()} Document</p>
                </div>
            </div>
            <div class="export-card-spinner ${fileType}"></div>
            <div class="export-card-message">${message}</div>
            <div class="export-card-details">${details}</div>
        `;
        
        document.body.appendChild(card);
        
        // Trigger animation
        setTimeout(() => {
            card.classList.add('show');
        }, 100);
    }

    // Hide export card
    function hideExportCard() {
        const card = document.getElementById('exportCard');
        if (card) {
            card.classList.remove('show');
            setTimeout(() => {
                if (card.parentNode) {
                    card.remove();
                }
            }, 300);
        }
    }

    // Show loading overlay (fallback)
    function showLoadingOverlay(message = 'Processing...', subtext = 'Please wait while we prepare your export') {
        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.id = 'loadingOverlay';
        
        overlay.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <div class="loading-text">${message}</div>
                <div class="loading-subtext">${subtext}</div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // Trigger animation
        setTimeout(() => {
            overlay.classList.add('show');
        }, 100);
    }

    // Hide loading overlay
    function hideLoadingOverlay() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.remove('show');
            setTimeout(() => {
                if (overlay.parentNode) {
                    overlay.remove();
                }
            }, 300);
        }
    }

    // Create CSV content
    function createCSVContent(data) {
                const rows = [];
                rows.push(['Moonland Bill Of materials']);
                rows.push(['']);
        rows.push(['Order Number:', data.orderNumber || '']);
        rows.push(['Order Type:', data.orderType || '']);
        rows.push(['Buyer Name:', data.buyerName || '']);
                rows.push(['']);
        rows.push(['Printing:', data.printing || '']);
        rows.push(['Embroidery:', data.embroidery || '']);
        rows.push(['Printing Locations:', `Front:${data.printFront}, Back:${data.printBack}, Sleeve:${data.printSleeve}`]);
        rows.push(['Packing:', data.packing || '']);
        rows.push(['Tag Required:', data.tagRequired || '']);
        rows.push(['']);
        rows.push(['Section', 'Details', 'Quantity', 'Unit', 'Per Garment', 'Supplier', 'Q.QTY', 'Total Qty']);
        if (Array.isArray(data.fabrics) && data.fabrics.length > 0) {
            data.fabrics.forEach((f, idx) => {
                const details = `${f.type || ''}${f.color ? ' | Color: ' + f.color : ''}`;
                rows.push([`Fabric-${idx + 1}`, details, f.amount || '', f.unit || '', f.perGarment || '', f.supplier || '', f.qty || '', formatQuantity(f.total || 0)]);
            });
        } else {
            const details = `${data.fabricType || ''}${data.fabricColor ? ' | Color: ' + data.fabricColor : ''}`;
            rows.push(['Fabric 1', details, data.fabricAmount || '', data.fabricUnit || '', data.fabricPerGarment || '', data.fabricSupplier || '', data.fabricQty || '', formatQuantity(data.fabricTotal || 0)]);
        }
        rows.push(['Collar Yarn', data.collarYarnType || '', data.collarYarnAmount || '', data.collarYarnUnit || '', data.collarYarnPerGarment || '', data.collarYarnSupplier || '', data.collarYarnQty || '', formatQuantity(data.collarYarnTotal || 0)]);
        rows.push(['Tipping Yarn', data.tippingYarnType || '', data.tippingYarnAmount || '', data.tippingYarnUnit || '', data.tippingYarnPerGarment || '', data.tippingYarnSupplier || '', data.tippingYarnQty || '', formatQuantity(data.tippingYarnTotal || 0)]);

        // Add collar measurements (multiple) with numbering
        if (Array.isArray(data.collars) && data.collars.length > 0) {
            data.collars.forEach((c, idx) => {
                const details = `${c.size || ''}${c.dimensions ? ' - ' + c.dimensions : ''}`;
                rows.push([`Collar Measurements-${idx + 1}`, details, '', c.unit || '', c.perGarment || '', c.supplier || '', c.qty || '', formatQuantity(c.total || 0)]);
            });
        }

        // Add cuff measurements (multiple) with numbering
        if (Array.isArray(data.cuffs) && data.cuffs.length > 0) {
            data.cuffs.forEach((c, idx) => {
                const details = `${c.size || ''}${c.dimensions ? ' - ' + c.dimensions : ''}`;
                rows.push([`Cuff Measurements-${idx + 1}`, details, '', c.unit || '', c.perGarment || '', c.supplier || '', c.qty || '', formatQuantity(c.total || 0)]);
            });
        }
        
        // Buttons (multiple)
        if (Array.isArray(data.buttons) && data.buttons.length > 0) {
            data.buttons.forEach((b, idx) => {
                rows.push([`Buttons-${idx + 1}`, b.material || '', b.amount || '', b.unit || '', b.perGarment || '', b.supplier || '', b.qty || '', formatQuantity(b.total || 0)]);
            });
        } else {
            rows.push(['Buttons', data.buttonMaterial || '', data.buttonAmount || '', data.buttonUnit || '', data.buttonPerGarment || '', data.buttonSupplier || '', data.buttonQty || '', formatQuantity(data.buttonTotal || 0)]);
        }

        // Velvet Tapes (multiple)
        if (Array.isArray(data.velvetTapes) && data.velvetTapes.length > 0) {
            data.velvetTapes.forEach((v, idx) => {
                rows.push([`Velvet Tape-${idx + 1}`, v.quality || '', v.meter || '', v.unit || '', v.perGarment || '', v.supplier || '', v.qty || '', formatQuantity(v.total || 0)]);
            });
        } else {
            rows.push(['Velvet Tapes', data.velvetTapeQuality || '', data.velvetTapeMeter || '', data.velvetTapeUnit || '', data.velvetTapePerGarment || '', data.velvetTapeSupplier || '', data.velvetTapeQty || '', formatQuantity(data.velvetTapeTotal || 0)]);
        }

        // Wash Care Labels (multiple)
        if (Array.isArray(data.washCareLabels) && data.washCareLabels.length > 0) {
            data.washCareLabels.forEach((w, idx) => {
                rows.push([`Wash Care-${idx + 1}`, w.quality || '', w.amount || '', w.unit || '', w.perGarment || '', w.supplier || '', w.qty || '', formatQuantity(w.total || 0)]);
            });
        } else {
            rows.push(['Wash Care Labels', data.washCareQuality || '', data.washCareAmount || '', data.washCareUnit || '', data.washCarePerGarment || '', data.washCareSupplier || '', data.washCareQty || '', formatQuantity(data.washCareTotal || 0)]);
        }

        // Polybags
        rows.push(['Polybags', data.polybagQuality || '', data.polybagSize || '', data.polybagUnit || '', data.polybagPerGarment || '', data.polybagSupplier || '', data.polybagQty || '', formatQuantity(data.polybagTotal || 0)]);
        rows.push(['']);
        // Ensure grand total shows total quantity
        rows.push(['GRAND TOTAL (Qty):', formatQuantity(parseFloat(String(data.grandTotal).replace(/[^0-9.]/g, '')) || calculateAllTotals())]);
        
        return rows.map(r => r.map(v => '"' + String(v).replace(/"/g, '""') + '"').join(',')).join('\n');
    }

    // Download file helper
    function downloadFile(content, type, filename) {
        try {
            const blob = new Blob([content], { type: type === 'csv' ? 'text/csv;charset=utf-8;' : 'text/plain' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = filename;
            document.body.appendChild(link);
                link.click();
            document.body.removeChild(link);
                URL.revokeObjectURL(link.href);
            console.log('File downloaded:', filename);
        } catch (error) {
            console.error('Error downloading file:', error);
        }
    }

    // Create text content
    function createTextContent(data) {
        return `
    MOONLAND BOM - BILL OF MATERIALS
    ================================

    Order Information:
    ------------------
    Order Number: ${data.orderNumber || ''}
    Order Type: ${data.orderType || ''}
    Buyer Name: ${data.buyerName || ''}
    Printing: ${data.printing || ''}
    Embroidery: ${data.embroidery || ''}
    Printing Locations: Front:${data.printFront}, Back:${data.printBack}, Sleeve:${data.printSleeve}
    Packing: ${data.packing || ''}
    Tag Required: ${data.tagRequired || ''}

    BOM Data:
    ---------
    ${Array.isArray(data.fabrics) && data.fabrics.length > 0 ? data.fabrics.map((f,i) => `Fabric-${i+1}: ${f.type || ''}${f.color ? ' | Color: ' + f.color : ''}\n    Quantity: ${f.amount || ''} ${f.unit || ''}\n    Per Garment: ${f.perGarment || ''}\n    Supplier: ${f.supplier || ''}\n    Q.QTY: ${f.qty || ''}\n    Total Qty: ${formatQuantity(f.total || 0)}`).join('\n\n    ') : `Fabric 1: ${data.fabricType || ''}${data.fabricColor ? ' | Color: ' + data.fabricColor : ''}\n    Quantity: ${data.fabricAmount || ''} ${data.fabricUnit || ''}\n    Per Garment: ${data.fabricPerGarment || ''}\n    Supplier: ${data.fabricSupplier || ''}\n    Q.QTY: ${data.fabricQty || ''}\n    Total Qty: ${formatQuantity(data.fabricTotal || 0)}` }

    Collar Yarn: ${data.collarYarnType || ''}
    Quantity: ${data.collarYarnAmount || ''} ${data.collarYarnUnit || ''}
    Per Garment: ${data.collarYarnPerGarment || ''}
    Supplier: ${data.collarYarnSupplier || ''}
    Q.QTY: ${data.collarYarnQty || ''}
    Total Qty: ${formatQuantity(data.collarYarnTotal || 0)}

    Tipping Yarn: ${data.tippingYarnType || ''}
    Quantity: ${data.tippingYarnAmount || ''} ${data.tippingYarnUnit || ''}
    Per Garment: ${data.tippingYarnPerGarment || ''}
    Supplier: ${data.tippingYarnSupplier || ''}
    Q.QTY: ${data.tippingYarnQty || ''}
    Total Qty: ${formatQuantity(data.tippingYarnTotal || 0)}

    Buttons:
    ${Array.isArray(data.buttons) && data.buttons.length > 0 ? data.buttons.map((b,i) => `Buttons-${i+1}: Material: ${b.material || ''} | Quantity: ${b.amount || ''} ${b.unit || ''} | Per Garment: ${b.perGarment || ''} | Supplier: ${b.supplier || ''} | Q.QTY: ${b.qty || ''} | Total Qty: ${formatQuantity(b.total || 0)}`).join('\n    ') : `Buttons: ${data.buttonMaterial || ''}\n    Quantity: ${data.buttonAmount || ''} ${data.buttonUnit || ''}\n    Per Garment: ${data.buttonPerGarment || ''}\n    Supplier: ${data.buttonSupplier || ''}\n    Q.QTY: ${data.buttonQty || ''}\n    Total Qty: ${formatQuantity(data.buttonTotal || 0)}` }

    Velvet Tapes:
    ${Array.isArray(data.velvetTapes) && data.velvetTapes.length > 0 ? data.velvetTapes.map((v,i) => `Velvet Tape-${i+1}: ${v.quality || ''} | Quantity: ${v.meter || ''} ${v.unit || ''} | Per Garment: ${v.perGarment || ''} | Supplier: ${v.supplier || ''} | Q.QTY: ${v.qty || ''} | Total Qty: ${formatQuantity(v.total || 0)}`).join('\n    ') : `Velvet Tapes: ${data.velvetTapeQuality || ''}\n    Quantity: ${data.velvetTapeMeter || ''} ${data.velvetTapeUnit || ''}\n    Per Garment: ${data.velvetTapePerGarment || ''}\n    Supplier: ${data.velvetTapeSupplier || ''}\n    Q.QTY: ${data.velvetTapeQty || ''}\n    Total Qty: ${formatQuantity(data.velvetTapeTotal || 0)}` }

    Wash Care:
    ${Array.isArray(data.washCareLabels) && data.washCareLabels.length > 0 ? data.washCareLabels.map((w,i) => `Wash Care-${i+1}: ${w.quality || ''} | Quantity: ${w.amount || ''} ${w.unit || ''} | Per Garment: ${w.perGarment || ''} | Supplier: ${w.supplier || ''} | Q.QTY: ${w.qty || ''} | Total Qty: ${formatQuantity(w.total || 0)}`).join('\n    ') : `Wash Care Labels: ${data.washCareQuality || ''}\n    Quantity: ${data.washCareAmount || ''} ${data.washCareUnit || ''}\n    Per Garment: ${data.washCarePerGarment || ''}\n    Supplier: ${data.washCareSupplier || ''}\n    Q.QTY: ${data.washCareQty || ''}\n    Total Qty: ${formatQuantity(data.washCareTotal || 0)}` }

    Woven Size Labels:
    ${Array.isArray(data.wovenSizes) && data.wovenSizes.length > 0 ? data.wovenSizes.map((s,i) => `Woven-${i+1}: Size: ${s.size || ''} | Quantity: ${s.amount || ''} ${s.unit || ''} | Per Garment: ${s.perGarment || ''} | Supplier: ${s.supplier || ''} | Q.QTY: ${s.qty || ''} | Total Qty: ${formatQuantity(s.total || 0)}`).join('\n    ') : `Woven Size Labels: ${data.wovenSizeLabel || ''}\n    Quantity: ${data.wovenSizeAmount || ''} ${data.wovenSizeUnit || ''}\n    Per Garment: ${data.wovenSizePerGarment || ''}\n    Supplier: ${data.wovenSizeSupplier || ''}\n    Q.QTY: ${data.wovenSizeQty || ''}\n    Total Qty: ${formatQuantity(data.wovenSizeTotal || 0)}` }

    Polybags: ${data.polybagQuality || ''}
    Size: ${data.polybagSize || ''} ${data.polybagUnit || ''}
    Per Garment: ${data.polybagPerGarment || ''}
    Supplier: ${data.polybagSupplier || ''}
    Q.QTY: ${data.polybagQty || ''}
    Total Qty: ${formatQuantity(data.polybagTotal || 0)}

    ================================
    COLLAR MEASUREMENTS:
    ---------------------
    ${Array.isArray(data.collars) && data.collars.length > 0 ? data.collars.map((c, i) => `Collar MSMTS-${i + 1}: Size: ${c.size || ''} | Dim: ${c.dimensions || ''} | Unit: ${c.unit || ''} | Per Garment: ${c.perGarment || ''} | Supplier: ${c.supplier || ''} | Q.QTY: ${c.qty || ''} | Total Qty: ${formatQuantity(c.total || 0)}`).join('\n    ') : 'None'}

    CUFF MEASUREMENTS:
    -------------------
    ${Array.isArray(data.cuffs) && data.cuffs.length > 0 ? data.cuffs.map((c, i) => `Cuff MSMTS-${i + 1}: Size: ${c.size || ''} | Dim: ${c.dimensions || ''} | Unit: ${c.unit || ''} | Per Garment: ${c.perGarment || ''} | Supplier: ${c.supplier || ''} | Q.QTY: ${c.qty || ''} | Total Qty: ${formatQuantity(c.total || 0)}`).join('\n    ') : 'None'}

    ================================
    GRAND TOTAL (Qty): ${formatQuantity(parseFloat(String(data.grandTotal).replace(/[^0-9.]/g, '')) || calculateAllTotals())}
    ================================
        `;
    }

    // Export to Excel
    function exportToExcel() {
        console.log('Excel export function called!');
        try {
            // Show loading overlay
            showLoadingOverlay('Exporting to Excel...', 'Generating spreadsheet with your BOM data');
            
            // Ensure totals are up to date
            calculateAllTotals();

            const data = collectFormData();
            // Log counts for duplicated sections to help debug exports
            console.log('Form data collected:', data);
            console.log('Duplicate counts:', {
                fabrics: Array.isArray(data.fabrics) ? data.fabrics.length : 0,
                buttons: Array.isArray(data.buttons) ? data.buttons.length : 0,
                velvetTapes: Array.isArray(data.velvetTapes) ? data.velvetTapes.length : 0,
                washCare: Array.isArray(data.washCareLabels) ? data.washCareLabels.length : 0,
                wovenSizes: Array.isArray(data.wovenSizes) ? data.wovenSizes.length : 0,
                collars: Array.isArray(data.collars) ? data.collars.length : 0,
                cuffs: Array.isArray(data.cuffs) ? data.cuffs.length : 0
            });
            
            // Check if XLSX is available
            if (typeof XLSX === 'undefined' || !XLSX.utils || !XLSX.writeFile) {
                console.warn('XLSX not available, using CSV fallback');
                // Create simple CSV export
                const csvContent = createCSVContent(data);
                downloadFile(csvContent, 'csv', 'Moonland_BOM_Export.csv');
                hideLoadingOverlay();
                showAnimatedPopup('CSV file exported successfully!', 'success');
                return;
            }

            const workbook = XLSX.utils.book_new();
            
            // Create worksheet data. Only include selected sizes when corresponding QTY > 0.
            const worksheetData = [
                ['Moonland Bill Of materials'],
                [''],
                ['Garment Type:', data.orderType || ''],
                ['Order Number:', data.orderNumber || ''],
                ['Order Date:', data.orderDate || ''],
                ['Expected Delivery Date:', data.expectedDeliveryDate || ''],
                ['Buyer Name:', data.buyerName || ''],
                ['Printing:', data.printing || ''],
                ['Embroidery:', data.embroidery || ''],
                ['Printing Locations:', `Front:${data.printFront}, Back:${data.printBack}, Sleeve:${data.printSleeve}`],
                ['Packing:', data.packing || ''],
                ['Tag Required:', data.tagRequired || ''],

                [''],
                ['QUALITY', 'DETAILS', 'UNIT OF MSMTS', 'PER GARMENT', 'SUPPLIER', 'O.QTY', 'QTY'],
                [''],
                // Each row below must have exactly 7 columns to match the header
                ...(data.fabrics || []).flatMap((f, index) => [
                    [
                        `FABRIC-${index + 1}`,
                        `${f.type || ''}${f.color ? ' | Color: ' + f.color : ''}`,
                        f.unit || '',
                        f.perGarment || '',
                        f.supplier || '',
                        f.qty || '',
                        formatQuantity(f.total)
                    ],
                    ['']
                ]),
                ...((() => {
                    if (!Array.isArray(data.fabrics) || data.fabrics.length === 0) {
                        const q = parseFloat(data.fabricQty || '');
                        if (!isNaN(q) && q > 0) {
                            return [['FABRIC', `${data.fabricType || ''}${data.fabricColor ? ' | Color: ' + data.fabricColor : ''}`, data.fabricUnit || '', data.fabricPerGarment || '', data.fabricSupplier || '', data.fabricQty || '', formatQuantity(data.fabricTotal || 0)], ['']];
                        }
                    }
                    return [];
                })()),
                ['COLLAR YARN', data.collarYarnType || '', data.collarYarnUnit || '', data.collarYarnPerGarment || '', data.collarYarnSupplier || '', data.collarYarnQty || '', formatQuantity(data.collarYarnTotal || 0)],
                [''],
                ['TIPPING YARN', data.tippingYarnType || '', data.tippingYarnUnit || '', data.tippingYarnPerGarment || '', data.tippingYarnSupplier || '', data.tippingYarnQty || '', formatQuantity(data.tippingYarnTotal || 0)],
                [''],
                // Collar measurements - only show if quantity > 0
                // ===== MULTIPLE COLLAR ROWS =====
...(data.collars || []).flatMap((c, index) => [
    [
        `COLLAR MSMTS-${index + 1}`,
        `${c.size} - ${c.dimensions}`,
        c.unit,
        c.perGarment,
        c.supplier,
        c.qty,
        formatQuantity(c.total)
    ],
    ['']
]),

                // ===== MULTIPLE CUFF ROWS =====
...(data.cuffs || []).flatMap((c, index) => [
    [
        `CUFF MSMTS-${index + 1}`,
        `${c.size} - ${c.dimensions}`,
        c.unit,
        c.perGarment,
        c.supplier,
        c.qty,
        formatQuantity(c.total)
    ],
    ['']
]),
...(data.buttons || []).flatMap((b, index) => [
    [
        `BUTTONS-${index + 1}`,
        b.material || '',
        b.unit || '',
        b.perGarment || '',
        b.supplier || '',
        b.qty || '',
        formatQuantity(b.total)
    ],
    ['']
]),
// fallback single button row if no dynamic buttons
...((() => {
    if (!Array.isArray(data.buttons) || data.buttons.length === 0) {
        return [['BUTTONS', data.buttonMaterial || '', data.buttonUnit || '', data.buttonPerGarment || '', data.buttonSupplier || '', data.buttonQty || '', formatQuantity(data.buttonTotal || 0)], ['']];
    }
    return [];
})()),

...(data.velvetTapes || []).flatMap((v, index) => [
    [
        `VELVET TAPE-${index + 1}`,
        v.quality || '',
        v.unit || '',
        v.perGarment || '',
        v.supplier || '',
        v.qty || '',
        formatQuantity(v.total)
    ],
    ['']
]),
...((() => {
    if (!Array.isArray(data.velvetTapes) || data.velvetTapes.length === 0) {
        return [['VELVET TAPES', data.velvetTapeQuality || '', data.velvetTapeUnit || '', data.velvetTapePerGarment || '', data.velvetTapeSupplier || '', data.velvetTapeQty || '', formatQuantity(data.velvetTapeTotal || 0)], ['']];
    }
    return [];
})()),

...(data.washCareLabels || []).flatMap((w, index) => [
    [
        `WASH CARE-${index + 1}`,
        w.quality || '',
        w.unit || '',
        w.perGarment || '',
        w.supplier || '',
        w.qty || '',
        formatQuantity(w.total)
    ],
    ['']
]),
...((() => {
    if (!Array.isArray(data.washCareLabels) || data.washCareLabels.length === 0) {
        return [['WASH CARE LABELS', data.washCareQuality || '', data.washCareUnit || '', data.washCarePerGarment || '', data.washCareSupplier || '', data.washCareQty || '', formatQuantity(data.washCareTotal || 0)], ['']];
    }
    return [];
})()),
                // Woven size labels (multiple)
                ...(data.wovenSizes || []).flatMap((s, index) => [
                    [
                        `SIZE LABELS-${index + 1}`,
                        `WVN SIZE LBL - ${s.size || ''}`,
                        s.unit || '',
                        s.perGarment || '',
                        s.supplier || '',
                        s.qty || '',
                        formatQuantity(s.total)
                    ],
                    ['']
                ]),
                ...((() => {
                    if (!Array.isArray(data.wovenSizes) || data.wovenSizes.length === 0) {
                        const q = parseFloat(data.wovenSizeQty || '');
                        if (!isNaN(q) && q > 0) {
                            return [['SIZE LABELS (WVN SIZE LBL)', `WVN SIZE LBL - ${data.wovenSizeLabel || ''}`, data.wovenSizeUnit || '', data.wovenSizePerGarment || '', data.wovenSizeSupplier || '', data.wovenSizeQty || '', formatQuantity(data.wovenSizeTotal || 0)], ['']];
                        }
                    }
                    return [];
                })()),
                ['POLYBAGS', (data.polybagQuality || '') + (data.polybagSize ? ` - ${data.polybagSize}` : ''), data.polybagUnit || '', data.polybagPerGarment || '', data.polybagSupplier || '', data.polybagQty || '', formatQuantity(data.polybagTotal || 0)],
                [''],
               ['GRAND TOTAL (Qty):', formatQuantity(calculateAllTotals())]

            ];
            
            const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
            
            // Set column widths
            worksheet['!cols'] = [
                { width: 20 },
                { width: 30 }
            ];
            
            XLSX.utils.book_append_sheet(workbook, worksheet, 'BOM Data');
            
            // Generate filename
            const orderNumber = data.orderNumber || 'BOM';
            const filename = `Moonland_BOM_${orderNumber}_${new Date().toISOString().split('T')[0]}.xlsx`; 
            
            // Simulate processing time for better UX
            setTimeout(() => {
            XLSX.writeFile(workbook, filename);
                hideLoadingOverlay();
                removeButtonLoadingState('exportExcelBtn');
            showAnimatedPopup('Excel file exported successfully!', 'success');
            }, 1500);
            
        } catch (error) {
            console.error('Error exporting to Excel:', error);
            hideLoadingOverlay();
            removeButtonLoadingState('exportExcelBtn');
            showAnimatedPopup('Error exporting to Excel. Please try again.', 'error');
        }
    }
    // Clear form
    function clearForm() {
        if (confirm('Are you sure you want to clear all form data?')) {
            document.getElementById('bomForm').reset();
            
            // Reset calculated fields
            const totalFields = [
                'fabricTotal', 'collarYarnTotal', 'tippingYarnTotal', 'collarTotal',
                'cuffTotal', 'buttonTotal', 'velvetTapeTotal', 'washCareTotal',
                'wovenSizeTotal', 'polybagTotal'
            ];
            
            totalFields.forEach(fieldId => {
                const field = document.getElementById(fieldId);
                if (field) field.value = '';
            });
            // clear stored INR values as well
            totalFields.forEach(fieldId => {
                const field = document.getElementById(fieldId);
                if (field && field.dataset) field.dataset.inr = '';
            });

            // Clear dynamic totals for duplicated blocks
            document.querySelectorAll('.buttonTotal, .velvetTapeTotal, .washCareTotal, .wovenSizeTotal, .fabricTotal, .collarTotal, .cuffTotal, .polybagTotal').forEach(el => {
                if (el) el.value = '';
                if (el && el.dataset) el.dataset.inr = '';
            });

            // Clear printing checkboxes and buyer
            const checkIds = ['printFront','printBack','printSleeve'];
            checkIds.forEach(id => {
                const el = document.getElementById(id);
                if (el && el.type === 'checkbox') el.checked = false;
            });
            const buyerEl = document.getElementById('buyerName');
            if (buyerEl) buyerEl.value = '';

            document.getElementById('grandTotal').textContent = formatQuantity(0);

            
            // No default values to reset - form will be completely empty
            
            showAnimatedPopup('Form cleared successfully!', 'success');
        }
    }

    // Show message
    function showMessage(message, type = 'success') {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.message');
        existingMessages.forEach(msg => msg.remove());
        
        // Create new message
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;
        
        // Insert at the top of the form
        const form = document.getElementById('bomForm');
        form.insertBefore(messageDiv, form.firstChild);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }

    // Show animated popup notification
    function showAnimatedPopup(message, type = 'success') {
        // Remove existing popups
        const existingPopups = document.querySelectorAll('.animated-popup');
        existingPopups.forEach(popup => popup.remove());
        
        // Create popup container
        const popup = document.createElement('div');
        popup.className = `animated-popup ${type}`;
        
        // Create popup content
        const popupContent = document.createElement('div');
        popupContent.className = 'popup-content';
        
        // Create icon
        const icon = document.createElement('i');
        icon.className = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
        
        // Create message text
        const messageText = document.createElement('span');
        messageText.textContent = message;
        
        // Assemble popup
        popupContent.appendChild(icon);
        popupContent.appendChild(messageText);
        popup.appendChild(popupContent);
        
        // Add to body
        document.body.appendChild(popup);
        
        // Trigger animation
        setTimeout(() => {
            popup.classList.add('show');
        }, 100);
        
        // Auto remove after 2 seconds
        setTimeout(() => {
            popup.classList.remove('show');
            setTimeout(() => {
                if (popup.parentNode) {
                    popup.remove();
                }
            }, 300);
        }, 2000);
    }

    // Auto-calculate on page load
    window.addEventListener('load', function() {
        calculateAllTotals();
    }); 

    // Test function to verify form data collection
    function testFormDataCollection() {
        try {
            console.log('Testing form data collection...');
            const data = collectFormData();
            if (data) {
                console.log('Form data collected successfully:', data);
                showAnimatedPopup('Form data collection test passed!', 'success');
                return true;
            } else {
                console.error('Form data collection returned null');
                showAnimatedPopup('Form data collection test failed!', 'error');
                return false;
            }
        } catch (error) {
            console.error('Error in form data collection:', error);
            showAnimatedPopup('Form data collection test failed with error!', 'error');
            return false;
        }
    }

    // Add test button to the page for debugging
    function addTestButton() {
        // Intentionally disabled in production UI
    }

    // Initialize test button when page loads
    // Test button injection disabled

    // Scroll-triggered animations
    function setupScrollAnimations() {
        const sections = document.querySelectorAll('.section');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        sections.forEach(section => {
            observer.observe(section);
        });
    }

    // Progress bar for form completion
    function setupProgressBar() {
        // Create progress bar
        const progressContainer = document.createElement('div');
        progressContainer.className = 'progress-container';
        progressContainer.innerHTML = '<div class="progress-bar" id="progressBar"></div>';
        document.body.appendChild(progressContainer);
        
        // Update progress on form changes
        function updateProgress() {
            const form = document.getElementById('bomForm');
            const inputs = form.querySelectorAll('input, select');
            const filledInputs = Array.from(inputs).filter(input => 
                input.value && input.value.trim() !== '' && !input.hasAttribute('readonly')
            );
            
            const progress = (filledInputs.length / inputs.length) * 100;
            const progressBar = document.getElementById('progressBar');
            if (progressBar) {
                progressBar.style.width = `${Math.min(progress, 100)}%`;
            }
        }
        
        // Update progress on input changes
        const form = document.getElementById('bomForm');
        form.addEventListener('input', updateProgress);
        form.addEventListener('change', updateProgress);
        
        // Initial progress update
        updateProgress();
    }

    // Scroll indicator
    function setupScrollIndicator() {
        const sections = document.querySelectorAll('.section');
        if (sections.length === 0) return;
        
        // Create scroll indicator
        const indicator = document.createElement('div');
        indicator.className = 'scroll-indicator';
        
        sections.forEach((section, index) => {
            const dot = document.createElement('div');
            dot.className = 'scroll-dot';
            dot.dataset.section = index;
            dot.addEventListener('click', () => {
                section.scrollIntoView({ behavior: 'smooth' });
            });
            indicator.appendChild(dot);
        });
        
        document.body.appendChild(indicator);
        
        // Update active dot based on scroll position
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sectionIndex = Array.from(sections).indexOf(entry.target);
                    const dots = indicator.querySelectorAll('.scroll-dot');
                    dots.forEach((dot, index) => {
                        dot.classList.toggle('active', index === sectionIndex);
                    });
                }
            });
        }, {
            threshold: 0.5
        });
        
        sections.forEach(section => {
            observer.observe(section);
        });
    }

    // Scroll to top button
    function setupScrollToTop() {
        const scrollToTopBtn = document.createElement('button');
        scrollToTopBtn.className = 'scroll-to-top';
        scrollToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
        scrollToTopBtn.setAttribute('aria-label', 'Scroll to top');
        document.body.appendChild(scrollToTopBtn);
        
        // Show/hide button based on scroll position
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                scrollToTopBtn.classList.add('show');
            } else {
                scrollToTopBtn.classList.remove('show');
            }
        });
        
        // Scroll to top functionality
        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Enhanced button loading states - Simplified to avoid conflicts
    function addButtonLoadingStates() {
        // This function is now simplified to avoid conflicts with main event listeners
        // The main event listeners in setupEventListeners() handle the button clicks
    }

    // Remove button loading state
    function removeButtonLoadingState(buttonId) {
        const button = document.getElementById(buttonId);
        if (button) {
            button.classList.remove('loading', 'excel', 'pdf', 'word');
            button.disabled = false;
        }
    }

    // Parallax effect for background
    function setupParallaxEffect() {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallax = document.querySelector('body::before');
            if (parallax) {
                const speed = scrolled * 0.5;
                parallax.style.transform = `translateY(${speed}px)`;
            }
        });
    }

    // Initialize enhanced features
    document.addEventListener('DOMContentLoaded', function() {
        addButtonLoadingStates();
        setupParallaxEffect();
    });

    // -------------------------
    // Saved entries (localStorage)
    // -------------------------

    function getSavedEntries() {
        try {
            const raw = localStorage.getItem('bom_entries') || '[]';
            const arr = JSON.parse(raw);
            return Array.isArray(arr) ? arr : [];
        } catch (e) {
            console.error('Error reading saved entries', e);
            return [];
        }
    }

    function saveCurrentEntry() {
        try {
            const data = collectFormData();
            const entries = getSavedEntries();
            const entry = {
                id: Date.now(),
                orderNumber: data.orderNumber || ('Entry ' + (entries.length + 1)),
                buyerName: data.buyerName || '',
                savedAt: new Date().toISOString(),
                data
            };
            entries.unshift(entry);
            localStorage.setItem('bom_entries', JSON.stringify(entries));
            alert('Entry saved locally. Open "Show Saved Entries" to view.');
            renderSavedEntries();
        } catch (e) {
            console.error('Error saving entry', e);
            alert('Failed to save entry to local storage.');
        }
    }

    function renderSavedEntries() {
        const panel = document.getElementById('savedEntriesPanel');
        const listEl = document.getElementById('savedList');
        if (!listEl) return;
        const entries = getSavedEntries();
        listEl.innerHTML = '';
        if (entries.length === 0) {
            listEl.innerHTML = '<div style="padding:8px;color:#666">No saved entries</div>';
            return;
        }

        entries.forEach(entry => {
            const item = document.createElement('div');
            item.className = 'saved-item';
            item.style = 'padding:8px;border-bottom:1px solid #eee;display:flex;justify-content:space-between;align-items:center;gap:8px;';

            const left = document.createElement('div');
            left.innerHTML = `<div style="font-weight:600">${entry.orderNumber || 'Untitled'}</div><div style="font-size:12px;color:#666">${entry.buyerName || ''} • ${new Date(entry.savedAt).toLocaleString()}</div>`;

            const controls = document.createElement('div');
            controls.style = 'display:flex;gap:6px;';

            const loadBtn = document.createElement('button'); loadBtn.textContent = 'Load'; loadBtn.className = 'btn btn-sm';
            loadBtn.addEventListener('click', () => { if (confirm('Load this saved entry? Current form data will be replaced.')) { loadSavedEntry(entry.id); } });

            const delBtn = document.createElement('button'); delBtn.textContent = 'Delete'; delBtn.className = 'btn btn-sm';
            delBtn.addEventListener('click', () => { if (confirm('Delete this saved entry?')) { deleteSavedEntry(entry.id); } });

            controls.appendChild(loadBtn);
            controls.appendChild(delBtn);

            item.appendChild(left);
            item.appendChild(controls);
            listEl.appendChild(item);
        });
    }

    function deleteSavedEntry(id) {
        const entries = getSavedEntries().filter(e => e.id !== id);
        localStorage.setItem('bom_entries', JSON.stringify(entries));
        renderSavedEntries();
    }

    function loadSavedEntry(id) {
        const entries = getSavedEntries();
        const entry = entries.find(e => e.id === id);
        if (!entry) return alert('Saved entry not found');
        populateFormFromData(entry.data);
        calculateAllTotals();
        const panel = document.getElementById('savedEntriesPanel'); if (panel) panel.style.display = 'none';
    }

    function populateFormFromData(data) {
        if (!data) return;

        const setVal = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.value = val == null ? '' : val;
        };

        // Simple fields
        setVal('orderDate', data.orderDate || '');
        setVal('expectedDeliveryDate', data.expectedDeliveryDate || '');
        setVal('orderNumber', data.orderNumber || '');
        setVal('orderType', data.orderType || '');
        setVal('buyerName', data.buyerName || '');

        // Helper to populate repeatable blocks
        function populateRepeatable(containerId, blockSelector, items, applyItem) {
            const container = document.getElementById(containerId);
            if (!container) return;
            const template = container.querySelector(blockSelector);
            if (!template) return;
            // remove existing
            container.querySelectorAll(blockSelector).forEach(n => n.remove());
            // create blocks for each item
            items.forEach(item => {
                const clone = template.cloneNode(true);
                clone.querySelectorAll('input, select, textarea').forEach(el => {
                    if (el.id) el.removeAttribute('id');
                    if (el.tagName === 'SELECT') el.selectedIndex = 0;
                    else if (el.type === 'checkbox' || el.type === 'radio') el.checked = false;
                    else el.value = '';
                    el.addEventListener('input', calculateAllTotals);
                    el.addEventListener('change', calculateAllTotals);
                });
                applyItem(clone, item);
                container.appendChild(clone);
            });
        }

        // Export saved entries as a JSON file
        function exportSavedEntries() {
            try {
                const entries = getSavedEntries();
                if (!entries || entries.length === 0) return alert('No saved entries to export');
                const blob = new Blob([JSON.stringify(entries, null, 2)], { type: 'application/json' });
                const filename = `bom_entries_${new Date().toISOString().replace(/[:.]/g,'-')}.json`;
                if (typeof saveAs === 'function') {
                    saveAs(blob, filename);
                } else {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = filename;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    URL.revokeObjectURL(url);
                }
            } catch (e) {
                console.error('Export failed', e);
                alert('Export failed');
            }
        }

        // Merge imported entries into localStorage
        function importSavedEntries(importedArray) {
            try {
                const existing = getSavedEntries();
                const existingIds = new Set(existing.map(e => e.id));
                let added = 0;
                importedArray.forEach(item => {
                    if (!item || !item.id) {
                        // assign id if missing
                        item.id = Date.now() + Math.floor(Math.random()*1000);
                    }

                    // -------------------------
                    // Firebase sync (optional)
                    // Requires: a `firebase-config.js` that sets `window.FIREBASE_CONFIG`
                    // and Firestore enabled in your Firebase project. See firebase-config.example.js.
                    // -------------------------

                    let firebaseInitialized = false;
                    let firebaseDb = null;

                    function ensureFirebaseLibs(callback) {
                        if (window.firebase && window.firebase.firestore) return callback();
                        // load compat SDKs
                        const scripts = [
                            'https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js',
                            'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore-compat.js'
                        ];
                        let loaded = 0;
                        scripts.forEach(src => {
                            const s = document.createElement('script');
                            s.src = src;
                            s.onload = () => { if (++loaded === scripts.length) callback(); };
                            s.onerror = () => { alert('Failed to load Firebase SDK. Check network.'); };
                            document.head.appendChild(s);
                        });
                    }

                    function initFirebaseIfNeeded(cb) {
                        if (firebaseInitialized) return cb && cb();
                        ensureFirebaseLibs(() => {
                            const cfg = window.FIREBASE_CONFIG;
                            if (!cfg) {
                                alert('No Firebase config found. Create `firebase-config.js` from firebase-config.example.js and include it before `script.js`.');
                                return;
                            }
                            try {
                                if (!window.firebase.apps || window.firebase.apps.length === 0) {
                                    window.firebase.initializeApp(cfg);
                                }
                                firebaseDb = window.firebase.firestore();
                                firebaseInitialized = true;
                                cb && cb();
                            } catch (e) {
                                console.error('Firebase init error', e);
                                alert('Firebase initialization failed. See console.');
                            }
                        });
                    }

                    function syncUploadToFirebase() {
                        initFirebaseIfNeeded(() => {
                            const entries = getSavedEntries();
                            if (!entries || entries.length === 0) return alert('No saved entries to upload.');
                            const batch = firebaseDb.batch();
                            const col = firebaseDb.collection('bom_entries');
                            entries.forEach(e => {
                                const docRef = col.doc(String(e.id));
                                batch.set(docRef, e, { merge: true });
                            });
                            batch.commit().then(() => {
                                alert('Uploaded saved entries to Firebase.');
                            }).catch(err => {
                                console.error(err);
                                alert('Upload failed. See console.');
                            });
                        });
                    }

                    function syncDownloadFromFirebase() {
                        initFirebaseIfNeeded(() => {
                            const col = firebaseDb.collection('bom_entries');
                            col.get().then(snapshot => {
                                const docs = [];
                                snapshot.forEach(doc => docs.push(doc.data()));
                                if (docs.length === 0) return alert('No entries found in Firebase.');
                                if (!confirm(`Import ${docs.length} entries from Firebase into local storage?`)) return;
                                importSavedEntries(docs);
                            }).catch(err => {
                                console.error(err);
                                alert('Download failed. See console.');
                            });
                        });
                    }

                    // Wire the new sync buttons (safe if elements missing)
                    document.addEventListener('DOMContentLoaded', function() {
                        const up = document.getElementById('syncUploadBtn');
                        const down = document.getElementById('syncDownloadBtn');
                        if (up) up.addEventListener('click', function() { if (confirm('Upload local saved entries to Firebase?')) syncUploadToFirebase(); });
                        if (down) down.addEventListener('click', function() { if (confirm('Download entries from Firebase and merge locally?')) syncDownloadFromFirebase(); });
                    });
                    if (!existingIds.has(item.id)) {
                        existing.unshift(item);
                        existingIds.add(item.id);
                        added++;
                    }
                });
                localStorage.setItem('bom_entries', JSON.stringify(existing));
                renderSavedEntries();
                alert(`Imported ${added} new entr${added===1?'y':'ies'}`);
            } catch (e) {
                console.error('Import failed', e);
                alert('Import failed');
            }
        }

        // Fabrics
        if (Array.isArray(data.fabrics) && data.fabrics.length > 0) {
            populateRepeatable('fabricBlocks', '.fabric-block', data.fabrics, (node, f) => {
                node.querySelector('.fabricType') && (node.querySelector('.fabricType').value = f.type || '');
                node.querySelector('.fabricColor') && (node.querySelector('.fabricColor').value = f.color || '');
                node.querySelector('.fabricAmount') && (node.querySelector('.fabricAmount').value = f.amount || '');
                node.querySelector('.fabricUnit') && (node.querySelector('.fabricUnit').value = f.unit || '');
                node.querySelector('.fabricPerGarment') && (node.querySelector('.fabricPerGarment').value = f.perGarment || '');
                node.querySelector('.fabricSupplier') && (node.querySelector('.fabricSupplier').value = f.supplier || '');
                node.querySelector('.fabricQty') && (node.querySelector('.fabricQty').value = f.qty || '');
                const totalEl = node.querySelector('.fabricTotal'); if (totalEl) { totalEl.dataset.inr = String(f.total||0); totalEl.value = formatQuantity(f.total||0); }
            });
        }

        // Collars
        if (Array.isArray(data.collars) && data.collars.length > 0) {
            populateRepeatable('collarBlocks', '.collar-block', data.collars, (node, c) => {
                node.querySelector('.collarSize') && (node.querySelector('.collarSize').value = c.size || '');
                node.querySelector('.collarDimensions') && (node.querySelector('.collarDimensions').value = c.dimensions || '');
                node.querySelector('.collarUnit') && (node.querySelector('.collarUnit').value = c.unit || '');
                node.querySelector('.collarPerGarment') && (node.querySelector('.collarPerGarment').value = c.perGarment || '');
                node.querySelector('.collarSupplier') && (node.querySelector('.collarSupplier').value = c.supplier || '');
                node.querySelector('.collarQty') && (node.querySelector('.collarQty').value = c.qty || '');
                const totalEl = node.querySelector('.collarTotal'); if (totalEl) { totalEl.dataset.inr = String(c.total||0); totalEl.value = formatQuantity(c.total||0); }
            });
        }

        // Cuffs
        if (Array.isArray(data.cuffs) && data.cuffs.length > 0) {
            populateRepeatable('cuffBlocks', '.cuff-block', data.cuffs, (node, c) => {
                node.querySelector('.cuffSize') && (node.querySelector('.cuffSize').value = c.size || '');
                node.querySelector('.cuffDimensions') && (node.querySelector('.cuffDimensions').value = c.dimensions || '');
                node.querySelector('.cuffUnit') && (node.querySelector('.cuffUnit').value = c.unit || '');
                node.querySelector('.cuffPerGarment') && (node.querySelector('.cuffPerGarment').value = c.perGarment || '');
                node.querySelector('.cuffSupplier') && (node.querySelector('.cuffSupplier').value = c.supplier || '');
                node.querySelector('.cuffQty') && (node.querySelector('.cuffQty').value = c.qty || '');
                const totalEl = node.querySelector('.cuffTotal'); if (totalEl) { totalEl.dataset.inr = String(c.total||0); totalEl.value = formatQuantity(c.total||0); }
            });
        }

        // Buttons
        if (Array.isArray(data.buttons) && data.buttons.length > 0) {
            populateRepeatable('buttonBlocks', '.button-block', data.buttons, (node, b) => {
                node.querySelector('.buttonMaterial') && (node.querySelector('.buttonMaterial').value = b.material || '');
                node.querySelector('.buttonAmount') && (node.querySelector('.buttonAmount').value = b.amount || '');
                node.querySelector('.buttonUnit') && (node.querySelector('.buttonUnit').value = b.unit || '');
                node.querySelector('.buttonPerGarment') && (node.querySelector('.buttonPerGarment').value = b.perGarment || '');
                node.querySelector('.buttonSupplier') && (node.querySelector('.buttonSupplier').value = b.supplier || '');
                node.querySelector('.buttonQty') && (node.querySelector('.buttonQty').value = b.qty || '');
                const totalEl = node.querySelector('.buttonTotal'); if (totalEl) { totalEl.dataset.inr = String(b.total||0); totalEl.value = formatQuantity(b.total||0); }
            });
        }

        // Velvet
        if (Array.isArray(data.velvetTapes) && data.velvetTapes.length > 0) {
            populateRepeatable('velvetBlocks', '.velvet-block', data.velvetTapes, (node, v) => {
                node.querySelector('.velvetTapeQuality') && (node.querySelector('.velvetTapeQuality').value = v.quality || '');
                node.querySelector('.velvetTapeMeter') && (node.querySelector('.velvetTapeMeter').value = v.meter || '');
                node.querySelector('.velvetTapeUnit') && (node.querySelector('.velvetTapeUnit').value = v.unit || '');
                node.querySelector('.velvetTapePerGarment') && (node.querySelector('.velvetTapePerGarment').value = v.perGarment || '');
                node.querySelector('.velvetTapeSupplier') && (node.querySelector('.velvetTapeSupplier').value = v.supplier || '');
                node.querySelector('.velvetTapeQty') && (node.querySelector('.velvetTapeQty').value = v.qty || '');
                const totalEl = node.querySelector('.velvetTapeTotal'); if (totalEl) { totalEl.dataset.inr = String(v.total||0); totalEl.value = formatQuantity(v.total||0); }
            });
        }

        // Wash care
        if (Array.isArray(data.washCareLabels) && data.washCareLabels.length > 0) {
            populateRepeatable('washCareBlocks', '.washcare-block', data.washCareLabels, (node, w) => {
                node.querySelector('.washCareQuality') && (node.querySelector('.washCareQuality').value = w.quality || '');
                node.querySelector('.washCareAmount') && (node.querySelector('.washCareAmount').value = w.amount || '');
                node.querySelector('.washCareUnit') && (node.querySelector('.washCareUnit').value = w.unit || '');
                node.querySelector('.washCarePerGarment') && (node.querySelector('.washCarePerGarment').value = w.perGarment || '');
                node.querySelector('.washCareSupplier') && (node.querySelector('.washCareSupplier').value = w.supplier || '');
                node.querySelector('.washCareQty') && (node.querySelector('.washCareQty').value = w.qty || '');
                const totalEl = node.querySelector('.washCareTotal'); if (totalEl) { totalEl.dataset.inr = String(w.total||0); totalEl.value = formatQuantity(w.total||0); }
            });
        }

        // Woven
        if (Array.isArray(data.wovenSizes) && data.wovenSizes.length > 0) {
            populateRepeatable('wovenBlocks', '.woven-block', data.wovenSizes, (node, s) => {
                node.querySelector('.wovenSizeLabel') && (node.querySelector('.wovenSizeLabel').value = s.size || '');
                node.querySelector('.wovenSizeAmount') && (node.querySelector('.wovenSizeAmount').value = s.amount || '');
                node.querySelector('.wovenSizeUnit') && (node.querySelector('.wovenSizeUnit').value = s.unit || '');
                node.querySelector('.wovenSizePerGarment') && (node.querySelector('.wovenSizePerGarment').value = s.perGarment || '');
                node.querySelector('.wovenSizeSupplier') && (node.querySelector('.wovenSizeSupplier').value = s.supplier || '');
                node.querySelector('.wovenSizeQty') && (node.querySelector('.wovenSizeQty').value = s.qty || '');
                const totalEl = node.querySelector('.wovenSizeTotal'); if (totalEl) { totalEl.dataset.inr = String(s.total||0); totalEl.value = formatQuantity(s.total||0); }
            });
        }

        // Single-field sections: collar yarn, tipping yarn, polybag, printing etc.
        setVal('collarYarnType', data.collarYarnType || '');
        setVal('collarYarnAmount', data.collarYarnAmount || '');
        setVal('collarYarnUnit', data.collarYarnUnit || '');
        setVal('collarYarnPerGarment', data.collarYarnPerGarment || '');
        setVal('collarYarnSupplier', data.collarYarnSupplier || '');
        setVal('collarYarnQty', data.collarYarnQty || '');

        setVal('tippingYarnType', data.tippingYarnType || '');
        setVal('tippingYarnAmount', data.tippingYarnAmount || '');
        setVal('tippingYarnUnit', data.tippingYarnUnit || '');
        setVal('tippingYarnPerGarment', data.tippingYarnPerGarment || '');
        setVal('tippingYarnSupplier', data.tippingYarnSupplier || '');
        setVal('tippingYarnQty', data.tippingYarnQty || '');

        setVal('polybagQuality', data.polybagQuality || '');
        setVal('polybagSize', data.polybagSize || '');
        setVal('polybagUnit', data.polybagUnit || '');
        setVal('polybagPerGarment', data.polybagPerGarment || '');
        setVal('polybagSupplier', data.polybagSupplier || '');
        setVal('polybagQty', data.polybagQty || '');

        setVal('printing', data.printing || '');
        setVal('embroidery', data.embroidery || '');
        setVal('printFront', data.printFront || '');
        setVal('printBack', data.printBack || '');
        setVal('printSleeve', data.printSleeve || '');
        setVal('packing', data.packing || '');
        setVal('tagRequired', data.tagRequired || '');
    }
