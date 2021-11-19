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
  { name: "Separate Axes y/n?", type: "text", defaultValue: "N" },
  { name: "Polygon Fill y/n?", type: "text", defaultValue: "N" },
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
  const ref = useRef();
  const options = useMemo(() => {
    const dimensions = config.dimension;
    const measures = config.measures;
    const separateY =
      client.config.getKey("Separate Axes y/n?") === "Y" ? true : false;

    // transform sigmaData --> treemap data
    if (sigmaData?.[dimensions]) {
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
        if (client.config.getKey("Polygon Fill y/n?") === "Y") {
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
        if (separateY) series[i].yAxis = i;
      }
      // if using a shared axis, take the first yAxis config only
      if (!separateY) yAxis = yAxis[0];

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
          //size: "80%",
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
          pointFormat:
            '<span style="color:{series.color}">{series.name}: <b>{point.y:,.0f}</b><br/>',
        },
        legend: {
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
  }, [config, sigmaData, sigmaColumns]);

  return (
    <div>
      <HighchartsReact highcharts={Highcharts} options={options} ref={ref} />
    </div>
  );
}

export default App;
