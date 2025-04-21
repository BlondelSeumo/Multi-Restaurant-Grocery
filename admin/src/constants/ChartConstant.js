export const COLOR_1 = '#2F80ED'; // blue
export const COLOR_2 = '#00C3F8'; // cyan
export const COLOR_3 = '#FF8901'; // volcano
export const COLOR_4 = '#E0F160'; // gold
export const COLOR_5 = '#46CC6B'; // purple
export const COLOR_6 = '#FF392B'; // orange
export const COLOR_7 = '#17bcff'; // geekblue

export const COLORS = [
  COLOR_1,
  COLOR_2,
  COLOR_3,
  COLOR_4,
  COLOR_5,
  COLOR_6,
  COLOR_7,
];

export const apexLineChartDefaultOption = {
  chart: {
    zoom: {
      enabled: false,
    },
    toolbar: {
      show: false,
    },
  },
  colors: [...COLORS],
  labels: {
    show: true,
    showAlways: true,
    label: 'Orders',
    fontSize: '22px',
    fontFamily: 'Montserrat, sans-serif',
    fontWeight: 600,
    cssClass: 'apexcharts-yaxis-label',
  },
  dataLabels: {
    enabled: false,
  },
  stroke: {
    width: 3,
    curve: 'smooth',
    lineCap: 'round',
  },
  legend: {
    position: 'top',
    horizontalAlign: 'right',
    offsetY: -15,
    itemMargin: {
      vertical: 20,
    },
    tooltipHoverFormatter: function (val, opts) {
      return (
        val +
        ' - ' +
        opts.w.globals.series[opts.seriesIndex][opts.dataPointIndex] +
        ''
      );
    },
  },
  xaxis: {
    categories: [],
  },
  grid: {
    xaxis: {
      lines: {
        show: false,
      },
    },
    yaxis: {
      lines: {
        show: true,
      },
    },
  },
};

export const apexAreaChartDefaultOption = {
  ...apexLineChartDefaultOption,
  fill: {
    fillTo: 'end',
    type: 'gradient',
    gradient: {
      shadeIntensity: 0.9999,
      opacityFrom: 0.9,
      opacityTo: 0.2,
      stops: [0, 100],
    },
  },
};

export const apexBarChartDefaultOption = {
  chart: {
    zoom: {
      enabled: false,
    },
    toolbar: {
      show: false,
    },
  },
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: '25px',
      startingShapre: 'rounded',
      endingShape: 'rounded',
    },
  },
  colors: [...COLORS],
  dataLabels: {
    enabled: false,
  },
  stroke: {
    show: true,
    width: 6,
    curve: 'smooth',
    colors: ['transparent'],
  },
  legend: {
    position: 'top',
    horizontalAlign: 'right',
    offsetY: -15,
    inverseOrder: true,
    itemMargin: {
      vertical: 20,
    },
    tooltipHoverFormatter: function (val, opts) {
      return (
        val +
        ' - ' +
        opts.w.globals.series[opts.seriesIndex][opts.dataPointIndex] +
        ''
      );
    },
  },
  xaxis: {
    categories: [],
  },
  fill: {
    opacity: 1,
  },
  tooltip: {
    y: {
      formatter: (val) => `${val}`,
    },
  },
};

export const apexPieChartDefaultOption = {
  colors: [...COLORS],
  plotOptions: {
    pie: {
      startAngle: 0,
      endAngle: 360,
      expandOnClick: true,
      offsetX: 0,
      offsetY: 0,
      customScale: 1,
      dataLabels: {
        offset: 0,
        minAngleToShowLabel: 10,
      },
    },
  },
  dataLabels: {
    enabled: true,
    style: {
      fontSize: '14px',
      fontFamily: 'Montserrat',
      fontWeight: 'bold',
      color: '#000',
    },
  },
  legend: {
    show: false,
  },
};

export const apexDonutChartDefaultOption = {
  colors: [...COLORS],
  plotOptions: {
    pie: {
      startAngle: 0,
      endAngle: 360,
      expandOnClick: true,
      offsetX: 0,
      offsetY: 0,
      customScale: 1,
      dataLabels: {
        offset: 0,
        minAngleToShowLabel: 10,
      },
      donut: {
        size: '60px',
        labels: {
          show: true,
          showAlways: true,
          label: 'Orders',
          fontSize: '22px',
          fontFamily: 'Montserrat, sans-serif',
          fontWeight: 600,
          // classes
          // apexcharts-text apexcharts-datalabel-label
          // apexcharts-text apexcharts-datalabel-value
          value: {
            show: true,
            fontSize: '20px',
            lineHeight: '24.38px',
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 600,
            color: 'var(--dark-blue)',
            letterSpacing: 0,
            textAlign: 'center',
            formatter: function (val) {
              return val;
            },
          },
          total: {
            show: true,
            showAlways: true,
            label: 'Orders',
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 600,
            color: '#8E95A9',
            value: {
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 600,
              color: 'var(--dark-blue)',
            },
            formatter: function (w) {
              return w.globals.seriesTotals.reduce((a, b) => {
                return a + b;
              }, 0);
            },
          },
          formatter: function (w) {
            return w.globals.seriesTotals.reduce((a, b) => {
              return a + b;
            }, 0);
          },
        },
      },
    },
  },
  legend: {
    show: false,
  },
};
