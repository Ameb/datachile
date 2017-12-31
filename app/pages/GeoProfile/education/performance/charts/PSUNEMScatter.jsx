import React from "react";
import { Section } from "datawheel-canon";
import { Plot } from "d3plus-react";
import { simpleGeoChartNeed } from "helpers/MondrianClient";
import { translate } from "react-i18next";

import { sources } from "helpers/consts";
import { administrationColorScale } from "helpers/colors";
import { numeral } from "helpers/formatters";

import SourceNote from "components/SourceNote";
import ExportLink from "components/ExportLink";

class PSUNEMScatter extends Section {
  static need = [
    simpleGeoChartNeed(
      "path_education_psu_vs_nem_by_school",
      "education_performance_new",
      ["Average PSU", "Average NEM", "Number of records"],
      {
        drillDowns: [["Institution", "Institution", "Institution"]],
        cuts: [
          `[Year].[Year].[Year].&[${sources.education_performance_new.year}]`
        ],
        options: { parents: true }
      }
    ),
    simpleGeoChartNeed(
      "path_education_psu_vs_nem_by_school_chile",
      "education_performance_new",
      ["Average PSU", "Average NEM", "Number of records"],
      {
        drillDowns: [
          ["Geography", "Geography", "Comuna"],
          ["Institution", "Institution", "Administration"]
        ],
        cuts: [
          `[Year].[Year].[Year].&[${sources.education_performance_new.year}]`
        ],
        options: { parents: true }
      }
    )
  ];

  render() {
    const { t, className, i18n } = this.props;
    const {
      geo,
      path_education_psu_vs_nem_by_school,
      path_education_psu_vs_nem_by_school_chile
    } = this.context.data;

    const national = geo.key == "chile" ? true : false;

    const path =
      geo && national
        ? path_education_psu_vs_nem_by_school_chile
        : path_education_psu_vs_nem_by_school;

    const locale = i18n.language;

    return (
      <div className={className}>
        <h3 className="chart-title">
          <span>
            {national
              ? t("PSU vs NEM by Comuna & Administration")
              : t("PSU vs NEM by school")}
          </span>
          <ExportLink path={path} />
        </h3>
        <Plot
          config={{
            height: 500,
            data: path,
            groupBy: national
              ? ["ID Comuna", "ID Administration"]
              : ["ID Institution"],
            label: d => d["Administration"],
            x: "Average NEM",
            y: "Average PSU",
            size: "Number of records",
            colorScalePosition: false,
            shapeConfig: {
              fill: d => administrationColorScale(d["Administration"])
            },
            xConfig: {
              title: t("Average NEM")
            },
            yConfig: {
              title: t("Average PSU")
            },
            tooltipConfig: {
              title: d => {
                var title = "";
                if (d["ID Institution"]) {
                  title =
                    d["ID Institution"] instanceof Array
                      ? d["Administration"]
                      : d["Institution"] + " - " + d["Administration"];
                }
                if (d["ID Comuna"]) {
                  title =
                    d["ID Comuna"] instanceof Array
                      ? d["Administration"]
                      : d["Comuna"] +
                        " (" +
                        d["Region"] +
                        ") - " +
                        d["Administration"];
                }

                return title;
              },
              body: d => {
                var body = "";
                if (
                  (d["ID Institution"] &&
                    !(d["ID Institution"] instanceof Array)) ||
                  (d["ID Comuna"] && !(d["ID Comuna"] instanceof Array))
                ) {
                  var body = "<table class='tooltip-table'>";
                  body +=
                    "<tr><td class='title'>" +
                    t("Average NEM") +
                    "</td><td class='data'>" +
                    numeral(d["Average NEM"], locale).format("(0.[0])") +
                    "</td></tr>";
                  body +=
                    "<tr><td class='title'>" +
                    t("Average PSU") +
                    "</td><td class='data'>" +
                    numeral(d["Average PSU"], locale).format("(0)") +
                    "</td></tr>";
                  body +=
                    "<tr><td class='title'>" +
                    t("Students") +
                    "</td><td class='data'>" +
                    numeral(d["Number of records"], locale).format("(0,0)") +
                    "</td></tr>";
                  body += "</table>";
                }
                return body;
              }
            },
            legendConfig: {
              label: d => d["Administration"],
              shapeConfig: {
                width: 40,
                height: 40,
                backgroundImage: d =>
                  "/images/legend/college/administration.png"
              }
            }
          }}
          dataFormat={data => {
            return data.data.filter(f => {
              return f["Average NEM"] && f["Average PSU"];
            });
          }}
        />
        <SourceNote cube="education_performance_new" />
      </div>
    );
  }
}
export default translate()(PSUNEMScatter);
