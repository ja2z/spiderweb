import { useMemo, useRef } from "react";
import Highcharts from "highcharts";
import HighchartsMore from "highcharts/highcharts-more";
import HighchartsReact from "highcharts-react-official";
import {
  client,
  useConfig,
  useElementData,
  useElementColumns,
} from "@sigmacomputing/plugin";
//npm install highcharts highcharts-more highcharts-react-official

client.config.configureEditorPanel([
  { name: "source", type: "element" },
  { name: "dimension", type: "column", source: "source", allowMultiple: false },
  { name: "measures", type: "column", source: "source", allowMultiple: true },
  { name: "Separate Axes", type: "checkbox" },
  { name: "Polygon Fill", type: "checkbox" },
  { name: "Show Legend", type: "checkbox" },
]);

HighchartsMore(Highcharts);
const seriesColors = [
  "#ED5E4F",
  "#C1A836",
  "#964F7D",
  "#DD9684",
  "#005C4A",
  "#C9C7F5",
  "#FDCFB6",
  "#ACE0DF",
];
const axisColor = "#B2B2B2";
const spiderColor = "#666666";
const spiderColorCategories = "#E5E5E5";

function App() {
  const config = useConfig();
  const sigmaData = useElementData(config.source);
  const sigmaColumns = useElementColumns(config.source);
  const polygonFill = (client.config.getKey)("Polygon Fill");
  const separateAxes = (client.config.getKey)("Separate Axes");
  const showLegend = (client.config.getKey)("Show Legend");
  const ref = useRef();

  const options = useMemo(() => {
    const dimensions = config.dimension;
    const measures = config.measures;

    // transform sigmaData --> treemap data
    if (sigmaData?.[dimensions] && sigmaColumns?.[measures[0]]) {
      let series = [];
      let yAxis = [];
      const categories = sigmaData[dimensions];
      for (let i = 0; i < measures.length; i++) {
        yAxis[i] = {};
        yAxis[i].lineWidth = 3;
        yAxis[i].tickAmount = 5;
        yAxis[i].angle = 45 * i;
        yAxis[i].gridLineInterpolation = "polygon";
        yAxis[i].lineColor = axisColor;
        yAxis[i].gridLineColor = spiderColor;

        series[i] = {};
        series[i].name = sigmaColumns[measures[i]].name;
        series[i].pointPlacement = "on";
        series[i].data = [];
        if (polygonFill) {
          series[i].type = "polygon";
          series[i].opacity = "0.3";
        } else {
          series[i].type = "line";
          series[i].opacity = "1";
        }
        series[i].data = sigmaData[measures[i]];
        series[i].color = seriesColors[i];
        series[i].lineWidth = 2;
        // if axes are separate, add a y index to each series
        if (separateAxes) series[i].yAxis = i;
      }
      // if using a shared axis, take the first yAxis config only
      if (!separateAxes) yAxis = yAxis[0];

      const options = {
        chart: {
          polar: true,
          height: (9 / 16) * 100 + "%",
          backgroundColor: "transparent",
        },
        title: {
          text: undefined,
        },
        pane: {
          size: "90%",
        },
        xAxis: {
          categories: categories,
          tickmarkPlacement: "on",
          lineWidth: 0,
          gridLineColor: spiderColorCategories,
        },
        yAxis: yAxis,
        tooltip: {
          shared: true,
          formatter: function() {
            let s = '';
            this.points.forEach(point => {
              const value = point.y;
              const formattedValue = (value > -1 && value < 1) 
                ? value.toFixed(2)
                : Highcharts.numberFormat(value, 0, '.', ',');
              s += `<span style="color:${point.series.color}">${point.series.name}: <b>${formattedValue}</b><br/>`;
            });
            return s;
          }
        },
        legend: {
          enabled: showLegend,
          align: "right",
          verticalAlign: "middle",
          layout: "vertical",
        },
        plotOptions: {
          series: {
            lineWidth: 1,
          },
        },
        series: series,
        responsive: {
          rules: [
            {
              condition: {
                maxWidth: 700,
              },
              chartOptions: {
                legend: {
                  enabled: showLegend,
                  align: "center",
                  verticalAlign: "bottom",
                  layout: "horizontal",
                },
                pane: {
                  //size: "70%",
                },
              },
            },
          ],
        },
      };
      return options;
    }
  }, [config, sigmaData, sigmaColumns, polygonFill]);

  return (
    <div>
      <HighchartsReact highcharts={Highcharts} options={options} ref={ref} />
    </div>
  );
}

export default App;
