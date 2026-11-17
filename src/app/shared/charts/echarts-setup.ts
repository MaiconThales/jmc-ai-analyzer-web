// Carregado sob demanda (provideEchartsCore): registra só os módulos usados, para reduzir o bundle.
import { BarChart, LineChart } from 'echarts/charts';
import { AriaComponent, DataZoomComponent, GridComponent, LegendComponent, TooltipComponent } from 'echarts/components';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
  LineChart,
  BarChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  DataZoomComponent,
  AriaComponent,
  CanvasRenderer,
]);

export * from 'echarts/core';
