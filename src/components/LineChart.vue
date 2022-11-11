<script lang="ts">
import { defineComponent, h, PropType } from 'vue';

import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  Plugin,
  ChartData,
  DefaultDataPoint,
  Filler,
  LinearScale,
  PointElement,
  LineElement,
} from 'chart.js';
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  Filler,
  LinearScale,
  PointElement,
  LineElement
  //   Line
);
ChartJS.defaults.plugins.legend.position = 'bottom';
// ChartJS.defaults.plugins.tooltip.enabled = false;
export default defineComponent({
  name: 'PieChart',
  components: {
    Line,
  },
  props: {
    chartId: {
      type: String,
      default: 'line-chart',
    },
    width: {
      type: Number,
      default: 400,
    },
    height: {
      type: Number,
      default: 200,
    },
    cssClasses: {
      default: '',
      type: String,
    },
    styles: {
      type: Object as PropType<Partial<CSSStyleDeclaration>>,
      default: () => ({}),
    },
    plugins: {
      type: Array as PropType<Plugin<'line'>[]>,
      default: () => [Filler],
    },
    labels: {
      type: Array as PropType<{ value: number; label: string }[]>,
      default: () => [],
    },
    chartData: {
      type: Object as PropType<
        ChartData<'line', DefaultDataPoint<'line'>, unknown>
      >,
      required: true,
    },
  },
  setup(props) {
    //  const chartData = {
    //   labels: ["January", "February", "March", "April", "May", "June", "July"],
    //   datasets: [
    //     {
    //       label: "Data One",
    //       backgroundColor: "#f87910",
    //       data: [40, 39, 10, 40, 39, 80, 40],
    //       tension: 0.2
    //     },
    //     {
    //       label: "Data Two",
    //       backgroundColor: "#f87979",
    //       data: [4, 3, 19, 30, 39, 80, 40],
    //       tension: 0.2,
    //       fill: "0",
    //     }
    //   ]
    // };
    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        filler: {
          propagate: false,
        },
      },
    };

    return () =>
      h(Line, {
        chartData: props.chartData,
        chartOptions,
        chartId: props.chartId,
        width: props.width,
        height: props.height,
        cssClasses: props.cssClasses,
        styles: props.styles,
        plugins: props.plugins,
      });
  },
});
</script>
