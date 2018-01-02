import React from "react";
import { Section } from "datawheel-canon";
import { translate } from "react-i18next";
import { Treemap } from "d3plus-react";
import { browserHistory } from "react-router";

import mondrianClient, { levelCut } from "helpers/MondrianClient";
import { getLevelObject } from "helpers/dataUtils";
import { ordinalColorScale } from "helpers/colors";
import {
  numeral,
  slugifyItem,
  getNumberFromTotalString
} from "helpers/formatters";

import ExportLink from "components/ExportLink";
import SourceNote from "components/SourceNote";
import NoDataAvailable from "components/NoDataAvailable";

class ImportsByDestination extends Section {
  state = {
    chart: true
  };

  static need = [
    (params, store) => {
      const country = getLevelObject(params);
      const prm = mondrianClient.cube("imports").then(cube => {
        const q = levelCut(
          country,
          "Origin Country",
          "Country",
          cube.query
            .option("parents", true)
            .drilldown("Date", "Year")
            .drilldown("Geography", "Comuna")
            .measure("CIF US"),
          "Continent",
          "Country",
          store.i18n.locale,
          false
        );

        return {
          key: "path_country_imports_by_destination",
          data: __API__ + q.path("jsonrecords")
        };
      });

      return {
        type: "GET_DATA",
        promise: prm
      };
    }
  ];

  prepareData = data => {
    if (data.data && data.data.length) {
      return data.data;
    } else {
      this.setState({ chart: false });
    }
  };

  render() {
    const { t, className, i18n } = this.props;

    const path = this.context.data.path_country_imports_by_destination;
    const locale = i18n.language;

    return (
      <div className={className}>
        <h3 className="chart-title">
          <span>{t("Imports By Destination")}</span>
          <ExportLink path={path} />
        </h3>

        {this.state.chart ? (
          <Treemap
          config={{
            height: 500,
            data: path,
            groupBy: ["ID Region", "ID Comuna"],
            label: d => d["Comuna"],
            sum: d => d["CIF US"],
            total: d => d["CIF US"],
            totalConfig: {
              text: d =>
                "Total: US" +
                numeral(getNumberFromTotalString(d.text), locale).format(
                  "($ 0.[00] a)"
                )
            },
            time: "ID Year",
            shapeConfig: {
              fill: d => ordinalColorScale(d["ID Region"])
            },
            on: {
              click: d => {
                var url = slugifyItem(
                  "geo",
                  d["ID Region"],
                  d["Region"],
                  d["ID Comuna"] instanceof Array ? false : d["ID Comuna"],
                  d["Comuna"] instanceof Array ? false : d["Comuna"]
                );
                browserHistory.push(url);
              }
            },
            tooltipConfig: {
              title: d => {
                return d["Comuna"] instanceof Array
                  ? d["Region"]
                  : d["Comuna"] + " - " + d["Region"];
              },
              body: d =>
                numeral(d["CIF US"], locale).format("(USD 0 a)") +
                "<br/><a>" +
                t("tooltip.to_profile") +
                "</a>"
            },
            legendConfig: {
              label: false,
              shapeConfig: false
            }
          }}
          dataFormat={this.prepareData}
        />
      ) : (
        <NoDataAvailable />
      )}
        <SourceNote cube="imports" />
      </div>
    );
  }
}

export default translate()(ImportsByDestination);
