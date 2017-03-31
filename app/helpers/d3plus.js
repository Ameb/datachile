const axisConfig = {
  barConfig: {
    "stroke": "#979797",
    "stroke-width": 1
  },
  gridConfig: {
    "stroke": "#979797",
    "stroke-width": 1
  },
  shapeConfig: {
    fill: "#979797",
    fontColor: "rgba(0, 0, 0, 0.8)",
    fontFamily: () => "Chivo",
    fontSize: () => 12,
    stroke: "#979797"
  },
  tickSize: 0,
  titleConfig: {
    fontFamily: "Chivo",
    fontSize: "14px",
    fontWeight: 600,
    textTransform: "uppercase"
  }
};

export default {
  legendConfig: {
    shapeConfig: {
      fontColor: "rgba(0, 0, 0, 0.8)",
      fontFamily: "Chivo",
      fontResize: false,
      fontSize: 12,
      fontWeight: 400,
      height: () => 20,
      textTransform: "uppercase",
      width: () => 20
    }
  },
  shapeConfig: {
    fontColor: "rgba(0, 0, 0, 0.4)",
    fontFamily: "Chivo",
    fontWeight: 600
  },
  xConfig: axisConfig,
  yConfig: axisConfig
};
