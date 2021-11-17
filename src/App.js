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
]);

HighchartsMore(Highcharts);

function App() {
  const config = useConfig();
  const sigmaData = useElementData(config.source);
  const sigmaColumns = useElementColumns(config.source);
  const ref = useRef();
  const options = useMemo(() => {
    const dimensions = config.dimension;
    const measures = config.measures;

    // transform sigmaData --> treemap data
    if (sigmaData?.[dimensions[0]]) {
      let categories = [];
      let series = [];
      let yAxis = [];
      for (let i = 0; i < sigmaData[dimensions[0]].length; i++) {
        categories[i] = sigmaData[dimensions[0]][i];
      }
      for (let i = 0; i < measures.length; i++) {
        yAxis[i] = {};
        yAxis[i].lineWidth = 3;
        yAxis[i].angle = 90 * i;
        series[i] = {};
        series[i].name = sigmaColumns[measures[i]].name;
        series[i].pointPlacement = "on";
        series[i].data = [];
        series[i].data = sigmaData[measures[i]];
        series[i].yAxis = i;
      }
      console.log(series);
      const options = {
        chart: {
          polar: true,
        },
        title: {
          text: undefined,
        },
        pane: {
          size: "80%",
        },
        xAxis: {
          categories: categories,
          tickmarkPlacement: "on",
          lineWidth: 0,
        },
        yAxis: yAxis,
        /*
        yAxis: {
          gridLineInterpolation: "polygon",
          lineWidth: 0,
          min: 0,
        },
        */
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
        series: series,
        responsive: {
          rules: [
            {
              condition: {
                maxWidth: 500,
              },
              chartOptions: {
                legend: {
                  align: "center",
                  verticalAlign: "bottom",
                  layout: "horizontal",
                },
                pane: {
                  size: "70%",
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
