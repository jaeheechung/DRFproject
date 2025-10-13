import 'chartjs-adapter-date-fns'; // Removed due to bundling issues
import React, { useState, useEffect, useCallback } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
// Removed 'chartjs-adapter-date-fns' import as it causes bundling issues.
// TimeScale is now registered, and Chart.js will handle date parsing from the timestamps.

// Register Chart.js components
// We include TimeScale here to ensure the X-axis is treated as a time series.
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

// --- Utility Functions for Fetching Data ---

/**
 * Fetches sensor data from the DRF backend.
 * Uses the native Fetch API with error handling.
 * @returns {Promise<Array>} The processed array of sensor data objects.
 */
const fetchSensorData = async () => {
  // Correcting the API_URL to include the full endpoint path for information
  const API_URL = 'http://localhost:8000/api/information/';
  
  try {
    const response = await fetch(API_URL);
    
    // Check for HTTP errors (4xx or 5xx status codes)
    if (!response.ok) {
      // Try to parse error message if available
      const errorText = await response.text();
      throw new Error(`HTTP error! Status: ${response.status}. Response: ${errorText.substring(0, 100)}...`);
    }
    
    // Parse the JSON response body
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Fetch API failed:", error);
    // Return an empty array on failure
    return [];
  }
};


// --- Main Application Component ---

function App() {
  const [data, setData] = useState(null); // Will store data formatted for Chart.js
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Chart.js Options for responsive and dual-axis display
  const options = {
    responsive: true,
    maintainAspectRatio: false, // Allows full control of container size
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20
        }
      },
      title: {
        display: true,
        text: 'Temperature and Humidity Over Time',
        font: { size: 18, weight: 'bold' },
        color: '#4b5563',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y;
              label += context.dataset.label === 'Temperature' ? ' °C' : ' %';
            }
            return label;
          },
          title: function(context) {
             // Use toLocaleString for a friendly, localized date/time format
             const date = new Date(context[0].parsed.x);
             return date.toLocaleString();
          }
        }
      }
    },
    scales: {
      x: {
        type: 'time',
        // Note: Chart.js uses the built-in date functions without the adapter,
        // which may limit specific date-fns functionality, but works for basic time series.
        time: {
          unit: 'hour', // Default unit hint
          tooltipFormat: 'MMM d, yyyy h:mm a' // Custom format for tooltip date
        },
        title: {
          display: true,
          text: 'Time',
          color: '#4b5563',
        },
        ticks: {
          color: '#4b5563',
        }
      },
      temperature: { // Left Y-Axis for Temperature
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Temperature (°C)',
          color: '#ef4444',
        },
        ticks: {
          color: '#ef4444',
        }
      },
      humidity: { // Right Y-Axis for Humidity
        type: 'linear',
        display: true,
        position: 'right',
        grid: {
          drawOnChartArea: false, // Do not draw grid lines for the second axis
        },
        title: {
          display: true,
          text: 'Humidity (%)',
          color: '#3b82f6',
        },
        min: 0,
        max: 100,
        ticks: {
          color: '#3b82f6',
        }
      },
    },
  };


  // Function to process data for the chart.js format
  const processChartData = useCallback((rawData) => {
    // Sort raw data by timestamp to ensure the line chart draws correctly
    const sortedData = rawData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    // Map data to the {x: time, y: value} format expected by Chart.js when using time scale
    // Chart.js can parse the standard ISO 8601 timestamp strings directly.
    const tempPoints = sortedData.map(item => ({
      x: item.timestamp, 
      y: parseFloat(item.temperature),
    }));
    
    const humiPoints = sortedData.map(item => ({
      x: item.timestamp, 
      y: parseFloat(item.humidity),
    }));

    return {
      datasets: [
        {
          label: 'Temperature',
          data: tempPoints,
          borderColor: 'rgb(239, 68, 68)', // Tailwind Red 500
          backgroundColor: 'rgba(239, 68, 68, 0.5)',
          yAxisID: 'temperature',
          tension: 0.3,
          pointRadius: 3,
        },
        {
          label: 'Humidity',
          data: humiPoints,
          borderColor: 'rgb(59, 130, 246)', // Tailwind Blue 500
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          yAxisID: 'humidity',
          tension: 0.3,
          pointRadius: 3,
        },
      ],
    };
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // NOTE: Correcting fetch URL to the correct API endpoint path for sensordata
        const rawData = await fetchSensorData();
        
        if (rawData.length === 0) {
            setError("The backend returned a successful response (200 OK) but no sensor data was found in the database. Please check your data records.");
        }
        
        const processedData = processChartData(rawData);
        setData(processedData);
        setError(null);
      } catch (e) {
        // If fetchSensorData threw an error, it's caught here
        setError(e.message || "An unknown error occurred during data fetching.");
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [processChartData]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-sans antialiased">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-indigo-700 mb-2">
          Daily Sensor Data Trends
        </h1>
        <p className="text-lg text-gray-500">Temperature & Humidity Visualization</p>
        <p className="mt-4 text-xs text-gray-400">
          Fetching from: <code className="bg-gray-200 p-1 rounded">http://localhost:8000/api/information/</code>
        </p>
      </header>

      <div className="max-w-6xl mx-auto bg-white p-6 sm:p-10 rounded-xl shadow-2xl border border-gray-100">
        {loading && (
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
            <p className="ml-3 text-indigo-500">Loading data...</p>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg" role="alert">
            <p className="font-bold">Data Error:</p>
            <p className="text-sm">{error}</p>
            <p className="mt-2 text-xs">Please check the Django server console and database content.</p>
          </div>
        )}

        {/* Chart Rendering */}
        {!loading && !error && (
            <div className='w-full' style={{ height: 500 }}>
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Temperature & Humidity Over Time</h2>
              
              {data && data.datasets.length > 0 && data.datasets[0].data.length > 0 ? (
                  <div className='w-full h-full'>
                    <Line data={data} options={options} />
                  </div>
              ) : (
                  <p className="text-center text-gray-500 p-10">No data points available to display the chart.</p>
              )}
            </div>
        )}
      </div>
      
      <footer className="mt-10 text-center text-gray-400 text-sm">
        Data visualization powered by Chart.js and React.
      </footer>
    </div>
  );
}

export default App;
