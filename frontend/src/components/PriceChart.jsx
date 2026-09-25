import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const compact = (n) => new Intl.NumberFormat("en-PK", { notation: "compact", maximumFractionDigits: 1 }).format(n);

export default function PriceChart({ trend = [] }) {
  const data = {
    labels: trend.map((x) => x.month),
    datasets: [{
      label: "Estimated value",
      data: trend.map((x) => x.price),
      borderColor: "#60a5fa",
      backgroundColor: "rgba(59,130,246,.12)",
      borderWidth: 2.5, pointRadius: 3, pointHoverRadius: 6,
      pointBackgroundColor: "#60a5fa", fill: true, tension: .35,
    }],
  };
  const options = {
    responsive: true, maintainAspectRatio: false,
    interaction: { intersect: false, mode: "index" },
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: "#111827", borderColor: "#334155", borderWidth: 1, padding: 12,
        callbacks: { label: (c) => ` PKR ${new Intl.NumberFormat("en-PK").format(c.parsed.y)}` } },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: "#94a3b8", maxRotation: 0, autoSkip: true, maxTicksLimit: 6 }, border: { display: false } },
      y: { grid: { color: "rgba(148,163,184,.1)" }, ticks: { color: "#94a3b8", callback: compact }, border: { display: false } },
    },
  };
  return <div className="h-64 w-full"><Line data={data} options={options} /></div>;
}
