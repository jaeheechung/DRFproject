import React from 'react';
import Chart from './Chart';

export default function TemperatureChart({ apiUrl = 'http://localhost:8000/api/information/', height = '100%', width = '100%' }) {
  return <Chart apiUrl={apiUrl} metric={'temperature'} height={height} width={width} />;
}
import React from 'react';
import Chart from './Chart';

// TemperatureChart is a tiny wrapper around Chart that renders temperature vs time.
export default function TemperatureChart({ data = null, height = '100%', width = '100%' }) {
  return <Chart data={data} metric="temperature" height={height} width={width} />;
}
