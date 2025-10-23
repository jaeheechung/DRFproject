import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';

// Chart.js imports
import {
    Chart as ChartJS,
    TimeScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';

// Date adapter so Chart.js can parse time values (uses date-fns under the hood)
import 'chartjs-adapter-date-fns';

ChartJS.register(
    TimeScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

/**
 * Chart component that expects userData to be an array of objects like:
 * [{ timestamp: '2025-10-23T12:34:56Z' | 'HH:MM', temperature: 22.5, humidity: 55 }, ...]
 * It will render a time-series line chart with time on the x-axis and temperature on the y-axis.
 */
export default function Chart({ data: userData = null, options: userOptions = null, height = 300, width = 600, apiUrl = null }) {
    // If no user data is provided, show a small example timeseries for dev UX
    const fallbackData = [
        { timestamp: new Date().toISOString(), temperature: 22 },
        { timestamp: new Date(Date.now() + 60 * 60 * 1000).toISOString(), temperature: 23 },
        { timestamp: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), temperature: 21.5 },
    ];

        // Allow Chart to fetch its own data when apiUrl prop is provided.
        // If caller passes `data`, that will be used instead of fetching.
        const [fetchedData, setFetchedData] = useState(null);
        const [isLoading, setIsLoading] = useState(false);
        const [fetchError, setFetchError] = useState(null);

        // Default API url (matches DataVisualization.jsx)
        const defaultApiUrl = 'http://localhost:8000/api/information/';

        const series = Array.isArray(userData) && userData.length > 0 ? userData : fetchedData || fallbackData;

        // Exponential backoff helper
        const delay = (attempt) => new Promise((res) => setTimeout(res, Math.min(1000 * Math.pow(2, attempt), 30000)));

        // Fetch helper (maxRetries optional)
        const fetchSensorData = async (apiUrl, maxRetries = 3) => {
            for (let attempt = 0; attempt < maxRetries; attempt++) {
                try {
                    const res = await fetch(apiUrl);
                    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
                    const json = await res.json();
                    return json;
                } catch (err) {
                    if (attempt < maxRetries - 1) {
                        // wait then retry
                        // console.warn(`Fetch attempt ${attempt + 1} failed. Retrying...`);
                        await delay(attempt);
                    } else {
                        throw err;
                    }
                }
            }
            return null;
        };

        useEffect(() => {
            // Only auto-fetch when user did not pass data prop
            if (Array.isArray(userData) && userData.length > 0) return;

            let isMounted = true;
        // prefer explicit apiUrl prop, else accept userData as url string (legacy), else default
        const resolvedApiUrl = apiUrl || (typeof userData === 'string' ? userData : defaultApiUrl);
            setIsLoading(true);
            setFetchError(null);

        fetchSensorData(resolvedApiUrl)
                .then((data) => {
                    if (!isMounted) return;
                    setFetchedData(Array.isArray(data) ? data : []);
                })
                .catch((err) => {
                    if (!isMounted) return;
                    setFetchError(err.message || String(err));
                })
                .finally(() => {
                    if (!isMounted) return;
                    setIsLoading(false);
                });

            return () => {
                isMounted = false;
            };
        }, [userData]);

    // Convert to Chart.js time-series dataset: data points are { x: timestamp, y: value }
    const temperaturePoints = series.map((d) => ({ x: d.timestamp, y: d.temperature }));
    const humidityPoints = series.map((d) => ({ x: d.timestamp, y: d.humidity }));

    const TData = {
        datasets: [
            {
                label: 'Temperature (°C)',
                data: temperaturePoints,
                fill: true,
                backgroundColor: 'rgba(252,165,165,0.2)',
                borderColor: 'rgba(252,165,165,1)',
                tension: 0.4,
                pointRadius: 3,
                yAxisID: 'y',
            },
        ],
    };

    const HData = {
        datasets: [
            {
                label: 'Humidity (%)',
                data: humidityPoints,
                fill: true,
                backgroundColor: 'rgba(96,165,250,0.2)',
                borderColor: 'rgba(96,165,250,1)',
                tension: 0.4,
                pointRadius: 3,
                yAxisID: 'y',
            },
        ],
    };


    const TemperatureOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Temperature Chart' },
            tooltip: { mode: 'index', intersect: false },
        },
        interaction: { mode: 'nearest', axis: 'x', intersect: false },
        scales: {
            x: {
                type: 'time',
                time: {
                    tooltipFormat: 'PPpp',
                    displayFormats: {
                        minute: 'HH:mm',
                        hour: 'HH:mm',
                        day: 'MMM d',
                    },
                },
                title: { display: true, text: 'Time' },
            },
            y: { display: true, title: { display: true, text: 'Temperature (°C)' }, beginAtZero: false },
        },
    };

    const HumidityOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Humidity Chart' },
            tooltip: { mode: 'index', intersect: false },
        },
        interaction: { mode: 'nearest', axis: 'x', intersect: false },
        scales: {
            x: {
                type: 'time',
                time: {
                    tooltipFormat: 'PPpp',
                    displayFormats: {
                        minute: 'HH:mm',
                        hour: 'HH:mm',
                        day: 'MMM d',
                    },
                },
                title: { display: true, text: 'Time' },
            },
            y: { display: true, title: { display: true, text: 'Humidity (%)' }, beginAtZero: false },
        },
    };

        // Simple inline UX for loading/error states when Chart fetches its own data
        if (isLoading) {
            return (
                <div style={{ height, width, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span>Loading chart data…</span>
                </div>
            );
        }

        if (fetchError) {
            return (
                <div style={{ height, width, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b91c1c' }}>
                    <span>Error loading data: {fetchError}</span>
                </div>
            );
        }

        return (
            <div style={{ height, width }}>
                <Line data={TData} options={userOptions || TemperatureOptions} />
                <Line data={HData} options={userOptions || HumidityOptions} />
            </div>
        );
}