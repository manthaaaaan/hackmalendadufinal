import React from 'react';
import { Chart } from "react-google-charts";

const EMOTION_COLORS = {
  joy: '#22C55E',      // green
  anger: '#EF4444',    // red
  disgust: '#F97316',  // orange
  sadness: '#3B82F6',  // blue
  fear: '#EC4899',     // pink
  surprise: '#A855F7', // purple
  neutral: '#6B7280'   // gray
};

export const EmotionDonut = ({ data }) => {
  const chartData = [["Emotion", "Reviews"]];
  const colors = [];
  
  Object.entries(data)
    .filter(([_, value]) => value > 0)
    .sort((a, b) => b[1] - a[1])
    .forEach(([key, value]) => {
       chartData.push([key.charAt(0).toUpperCase() + key.slice(1), value]);
       colors.push(EMOTION_COLORS[key] || EMOTION_COLORS.neutral);
    });

  // Fallback if no emotions found
  if (chartData.length === 1) {
    chartData.push(["No Data", 1]);
    colors.push("#2C2C2E");
  }

  const options = {
    pieHole: 0.65,
    is3D: false,
    backgroundColor: "transparent",
    colors: colors,
    legend: { 
       position: "bottom", 
       textStyle: { color: "#A1A1AA", fontSize: 13 } 
    },
    pieSliceText: "none",
    tooltip: { textStyle: { color: "#000000" }, showColorCode: true },
    chartArea: { width: "95%", height: "80%" },
    pieSliceBorderColor: "transparent",
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div className="h-[300px] w-full flex justify-center -mt-4">
         <Chart
           chartType="PieChart"
           width="100%"
           height="320px"
           data={chartData}
           options={options}
         />
      </div>
    </div>
  );
};
