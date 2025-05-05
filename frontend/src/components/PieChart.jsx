// src/components/PieChart.js
import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const PieChart = ({ completedPercentage }) => {
  const data = {
    labels: ["Completed", "Pending"],
    datasets: [
      {
        data: [completedPercentage, 100 - completedPercentage],
        backgroundColor: ["green", "red"],
        hoverBackgroundColor: ["darkgreen", "darkred"],
      },
    ],
  };

  return <Pie data={data} />;
};

export default PieChart;
