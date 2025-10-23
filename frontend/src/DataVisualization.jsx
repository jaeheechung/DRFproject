import React, { useState, useEffect } from 'react';
import Chart from './Chart';

// --- DRF API CONFIGURATION ---
const DRF_API_URL = 'http://localhost:8000/api/information/';

/**
 * Implements exponential backoff delay before retrying a fetch request.
 * @param {number} attempt The current retry attempt number (0-indexed).
 * @returns {Promise<void>} A promise that resolves after the calculated delay.
 */
const delay = (attempt) => {
    const time = Math.min(1000 * Math.pow(2, attempt), 30000); // Max delay of 30s
    return new Promise(resolve => setTimeout(resolve, time));
};

// --- REAL DRF API DATA FETCHING FUNCTION ---
// This function fetches time-series data from your Django backend.
const fetchSensorData = async (maxRetries = 3) => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(DRF_API_URL);

      if (!response.ok) {
        // Throw an error for non-successful HTTP status codes
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      return data; // Return the successfully fetched data

    } catch (error) {
      if (attempt < maxRetries - 1) {
        // Only log for visibility, but do not throw an error yet
        console.warn(`Fetch attempt ${attempt + 1} failed. Retrying...`);
        await delay(attempt); // Wait with exponential backoff
      } else {
        // Last attempt failed, throw the final error
        throw new Error(`Failed to fetch data after ${maxRetries} attempts. Error: ${error.message}. Ensure Django server is running and CORS is configured.`);
      }
    }
  }
};


// --- CHART CONFIGURATION ---
const createChartData = (sensorData) => {
  // Assuming each data point object looks like:
  // { timestamp: "HH:MM", temperature: 22.5, humidity: 65.2 }
  const labels = sensorData.map(d => d.timestamp);
  const temperatures = sensorData.map(d => d.temperature);
  const humidities = sensorData.map(d => d.humidity);

  return {
    labels: labels,
    datasets: [
      {
        label: 'Temperature (°C)',
        data: temperatures,
        borderColor: 'rgb(252, 165, 165)', // Red-300
        backgroundColor: 'rgba(252, 165, 165, 0.5)',
        yAxisID: 'y', // Assign to the left Y-axis
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
      {
        label: 'Humidity (%)',
        data: humidities,
        borderColor: 'rgb(96, 165, 250)', // Blue-400
        backgroundColor: 'rgba(96, 165, 250, 0.5)',
        yAxisID: 'y1', // Assign to the right Y-axis
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
    ],
  };
};

// --- CHART OPTIONS (Dual Axis Setup) ---
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        font: {
          family: 'Inter',
        },
        padding: 20,
      }
    },
    title: {
      display: true,
      text: 'Environmental Sensor Trends',
      font: {
        size: 18,
        family: 'Inter',
        weight: '600'
      }
    },
    tooltip: {
        mode: 'index',
        intersect: false,
        bodyFont: {
            family: 'Inter'
        }
    }
  },
  interaction: {
    mode: 'index',
    intersect: false,
  },
  scales: {
    x: {
      title: {
        display: true,
        text: 'Time',
        font: { family: 'Inter', size: 14 }
      },
      ticks: {
        autoSkip: true,
        maxTicksLimit: 12,
        font: { family: 'Inter' }
      },
      grid: {
        display: false,
      }
    },
    y: {
      // Left Y-Axis for Temperature
      type: 'linear',
      display: true,
      position: 'left',
      title: {
        display: true,
        text: 'Temperature (°C)',
        font: { family: 'Inter', size: 14, weight: '600' },
        color: 'rgb(252, 165, 165)',
      },
      min: 10,
      max: 35,
      ticks: {
        color: 'rgb(252, 165, 165)',
        font: { family: 'Inter' }
      }
    },
    y1: {
      // Right Y-Axis for Humidity
      type: 'linear',
      display: true,
      position: 'right',
      title: {
        display: true,
        text: 'Humidity (%)',
        font: { family: 'Inter', size: 14, weight: '600' },
        color: 'rgb(96, 165, 250)',
      },
      min: 20,
      max: 100,
      ticks: {
        color: 'rgb(96, 165, 250)',
        font: { family: 'Inter' }
      },
      grid: {
        drawOnChartArea: false,
      },
    },
  },
};

const App = () => {
  const [sensorData, setSensorData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch data from the real DRF API endpoint
  useEffect(() => {
    const loadData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await fetchSensorData();
            // Data validation: ensure it's an array and has content
            if (Array.isArray(data) && data.length > 0) {
                setSensorData(data);
            } else {
                setSensorData([]);
                setError("API returned successfully, but no data was found or the format was unexpected.");
            }
        } catch (err) {
            console.error("Final Fetch Error:", err);
            // The error message from fetchSensorData includes helpful context
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    loadData();
  }, []); // Empty dependency array means this runs once on mount

  // chartData is generated inside the Chart component now; keep createChartData for legacy use if needed

  const latestReading = sensorData.length > 0 ? sensorData[sensorData.length - 1] : null;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-inter">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
          Environmental Data Dashboard
        </h1>
        <p className="text-lg text-gray-500">
          Visualizing data fetched from 
          <code className="bg-gray-200 p-1 rounded font-mono text-sm">http://localhost:8000/api/information/</code>
        </p>
      </header>

      {/* Metric Cards Section */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">

        {/* Latest Temperature */}
        <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-red-400 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Current Temperature</p>
            <p className="text-3xl font-bold text-red-600">
              {latestReading ? `${latestReading.temperature}°C` : 'N/A'}
            </p>
          </div>
        </div>

        {/* Latest Humidity */}
        <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-blue-400 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Current Humidity</p>
            <p className="text-3xl font-bold text-blue-600">
              {latestReading ? `${latestReading.humidity}%` : 'N/A'}
            </p>
          </div>
        </div>

        {/* Latest Timestamp */}
        <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-gray-400 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Last Reading Time</p>
            <p className="text-3xl font-bold text-gray-600">
              {latestReading ? latestReading.timestamp : 'N/A'}
            </p>
          </div>
        </div>

      </div>

      {/* Chart Visualization Area */}
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-2xl">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">
          Data Trends
        </h2>

        {isLoading && (
          <div className="h-96 flex items-center justify-center text-xl text-gray-600">
            <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Fetching data from {DRF_API_URL}...
          </div>
        )}

        {error && (
          <div className="h-96 flex flex-col items-center justify-center bg-red-50 p-4 rounded-lg border border-red-300">
            <p className="text-red-700 font-medium text-center">Connection Error:</p>
            <p className="text-red-600 text-sm mt-1 max-w-lg">{error}</p>
            <p className="text-gray-500 text-xs mt-3">
              Ensure your Django server is running and configured with `django-cors-headers` to allow requests from the frontend origin.
            </p>
          </div>
        )}

        {!isLoading && !error && sensorData.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-96">
              <Chart data={sensorData} metric={'temperature'} height={'100%'} width={'100%'} />
            </div>
            <div className="h-96">
              <Chart data={sensorData} metric={'humidity'} height={'100%'} width={'100%'} />
            </div>
          </div>
        )}

        {!isLoading && !error && sensorData.length === 0 && (
            <div className="h-96 flex items-center justify-center text-xl text-gray-600">
                Data loaded successfully, but the dataset is empty. Check your database.
            </div>
        )}
      </div>

    </div>
  );
};

export default App;
