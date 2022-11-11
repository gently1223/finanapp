<script lang="ts">
import { defineComponent, h, PropType } from 'vue';

import { Pie } from 'vue-chartjs';
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
} from 'chart.js';
import ChartDataLabels, { Context } from 'chartjs-plugin-datalabels';
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  ChartDataLabels
);
ChartJS.defaults.plugins.legend.position = 'bottom';
// ChartJS.defaults.plugins.tooltip.enabled = false;
export default defineComponent({
  name: 'PieChart',
  components: {
    Pie,
  },
  props: {
    chartId: {
      type: String,
      default: 'pie-chart',
    },
    width: {
      type: Number,
      default: 400,
    },
    height: {
      type: Number,
      default: 400,
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
      type: Array as PropType<Plugin<'pie'>[]>,
      default: () => [ChartDataLabels],
    },
    labels: {
      type: Array as PropType<{ value: number; label: string }[]>,
      default: () => [],
    },
    chartData: {
      type: Object as PropType<
        ChartData<'pie', DefaultDataPoint<'pie'>, unknown>
      >,
      required: true,
    },
  },
  setup(props) {
    // const labels = ref(props.labels.map((e) => e.label))
    // const data = ref(props.labels.map((e) => e.value))
    // const chartData = {
    //   labels: labels.value,
    //   datasets: [
    //     {
    //       backgroundColor: [
    //         '#41B883',
    //         '#E46651',
    //         '#00D8FF',
    //         '#DD1B16',
    //         '#41B883',
    //         '#E46651',
    //         '#00D8FF',
    //         '#DD1B16',
    //       ],
    //       data: data.value,
    //     },
    //   ],
    // };

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        datalabels: {
          color: '#fff',
          formatter: function (value: number, ctx: Context) {
            return `${props.labels[ctx.dataIndex].label || ''} ${value} €`;
          },
          offset: 10,
        },
      },
    };

    return () =>
      h(Pie, {
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
