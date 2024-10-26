// Function to fetch CSV data
function fetchCSVData() {
    Papa.parse("evData.csv", {
        download: true,
        header: true,
        complete: function(results) {
            const data = results.data;
            renderTable(data);
            displayMetrics(data);
        },
        error: function(error) {
            console.error("Error loading CSV data:", error);
        }
    });
}

// Function to render table
function renderTable(data) {
    const tableBody = document.getElementById("table-body");
    tableBody.innerHTML = ""; // Clear existing rows

    data.forEach(item => {
        const row = `
            <tr>
                <td>${item["VIN (1-10)"]}</td>
                <td>${item.County}</td>
                <td>${item.City}</td>
                <td>${item.State}</td>
                <td>${item["Model Year"]}</td>
                <td>${item.Make}</td>
                <td>${item.Model}</td>
                <td>${item["Electric Vehicle Type"]}</td>
                <td>${item["Electric Range"]}</td>
            </tr>
        `;
        tableBody.insertAdjacentHTML('beforeend', row);
    });
}

// Display metrics
function displayMetrics(data) {
    document.getElementById("total-evs").querySelector("p").textContent = data.length;

    const avgRange = data.reduce((sum, item) => sum + (parseFloat(item["Electric Range"]) || 0), 0) / data.length;
    document.getElementById("avg-range").querySelector("p").textContent = `${avgRange.toFixed(2)} miles`;


    const popularBrand = data.reduce((acc,item) => {
        acc[item.Make] = (acc[item.Make]  || 0 ) +1;
        return acc;
    },{});
    const mostPopularBrand = Object.keys(popularBrand).reduce((c, d) => popularBrand[c]> popularBrand[d]? c : b );
    document.getElementById("popular-brand").querySelector("p").textContent = mostPopularBrand;


    const popularModel = data.reduce((acc, item) => {
        acc[item.Model] = (acc[item.Model] || 0) + 1;
        return acc;
    }, {});
    const mostPopularModel = Object.keys(popularModel).reduce((a, b) => popularModel[a] > popularModel[b] ? a : b);
    document.getElementById("popular-Model").querySelector("p").textContent = mostPopularModel;
}

// Apply filters
function applyFilters() {
    const make = document.getElementById("make").value;
    const modelYear = document.getElementById("model-year").value;
    const evType = document.getElementById("ev-type").value;

    Papa.parse("evData.csv", {
        download: true,
        header: true,
        complete: function(results) {
            let data = results.data;

            if (make) data = data.filter(item => item.Make === make);
            if (modelYear) data = data.filter(item => item["Model Year"] === modelYear);
            if (evType) data = data.filter(item => item["Electric Vehicle Type"].includes(evType));

            renderTable(data);
            displayMetrics(data);
        }
    });
}


function renderYearlyGrowthChart(data) {
    const yearCounts = data.reduce((acc, item) => {
        const year = item["Model Year"];
        if (year) {
            acc[year] = (acc[year] || 0) + 1;
        }
        return acc;
    }, {});

    // Extract years and counts as arrays sorted by year
    const years = Object.keys(yearCounts).sort((a, b) => a - b);
    const counts = years.map(year => yearCounts[year]);

    // Setup data for Chart.js
    const ctx = document.getElementById("ev-growth-chart").getContext("2d");
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: years,
            datasets: [{
                label: 'EV Growth by Model Year',
                data: counts,
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.2)',
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top'
                },
                title: {
                    display: true,
                    text: 'Electric Vehicle Yearly Growth'
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Model Year'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Number of EVs'
                    },
                    beginAtZero: true
                }
            }
        }
    });
}


// Load and display data on page load
fetchCSVData();
