import React from 'react';
import Chart from './Chart';

export default function HumidityChart({ apiUrl = 'http://localhost:8000/api/information/', height = '100%', width = '100%' }) {
  return <Chart apiUrl={apiUrl} metric={'humidity'} height={height} width={width} />;
}
import React from 'react';
import Chart from './Chart';

// HumidityChart is a tiny wrapper around Chart that renders humidity vs time.
export default function HumidityChart({ data = null, height = '100%', width = '100%' }) {
  return <Chart data={data} metric="humidity" height={height} width={width} />;
}
