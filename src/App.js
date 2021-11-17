import { useMemo, useRef } from "react";
import Highcharts from "highcharts";
import HighchartsMore from "highcharts/highcharts-more";
import HighchartsReact from "highcharts-react-official";
import { client, useConfig, useElementData } from "@sigmacomputing/plugin";
//npm install highcharts highcharts-more highcharts-react-official

client.config.configureEditorPanel([
  { name: "source", type: "element" },
  { name: "dimension", type: "column", source: "source", allowMultiple: true },
  { name: "measures", type: "column", source: "source", allowMultiple: true },
]);

HighchartsMore(Highcharts);

function App() {
  const config = useConfig();
  const sigmaData = useElementData(config.source);
  const ref = useRef();
  const options = useMemo(() => {
    const dimensions = config.dimension;
    const measures = config.measures;

    // transform sigmaData --> treemap data
    const options = {
      chart: {
        polar: true,

        type: 'line'
      },
      title: {
        text: undefined,
      },
      pane: {
        size: "80%",
      },
      xAxis: {
        categories: [
          "Sales",
          "Marketing",
          "Development",
          "Customer Support",
          "Information Technology",
          "Administration",
        ],
        tickmarkPlacement: "on",
        lineWidth: 0,
      },

      yAxis: {
        gridLineInterpolation: "polygon",
        lineWidth: 0,
        min: 0,
      },

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

      series: [
        {
          name: "Allocated Budget",
          data: [43000, 19000, 60000, 35000, 17000, 10000],
          pointPlacement: "on",
        },
        {
          name: "Actual Spending",
          data: [50000, 39000, 42000, 31000, 26000, 14000],
          pointPlacement: "on",
        },
      ],

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
  }, [config, sigmaData]);

  return (
    <div>
      <HighchartsReact highcharts={Highcharts} options={options} ref={ref} />
    </div>
  );
}

export default App;
