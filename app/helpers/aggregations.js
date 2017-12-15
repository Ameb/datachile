import maxBy from "lodash/maxBy";
import minBy from "lodash/minBy";
import groupBy from "lodash/groupBy";
import mapValues from "lodash/mapValues";
import sumBy from "lodash/sumBy";
import sortBy from "lodash/sortBy";

import { numeral, slugifyItem } from "helpers/formatters";

function annualized_growth(last_v, first_v, last_time, first_time) {
  var temp = parseFloat(last_time) - parseFloat(first_time);
  //bypass
  if (temp === 0) {
    temp = 1;
  }

  return Math.pow(last_v / first_v, 1 / temp) - 1;
}

function trade_by_time_and_product(
  aggregation,
  trade_measure,
  show_rank = true,
  locale = "en"
) {
  const max_year = maxBy(aggregation, function(o) {
    return o["ID Year"];
  })["ID Year"];

  const by_date_array = groupBy(aggregation, function(obj, children) {
    return obj["ID Year"];
  });

  const by_date = mapValues(by_date_array, function(array) {
    return sumBy(array, function(o) {
      return o[trade_measure] && !isNaN(o[trade_measure])
        ? parseInt(o[trade_measure])
        : 0;
    });
  });

  const first_year = minBy(aggregation, function(o) {
    return o["ID Year"];
  })["ID Year"];

  const trade_first_year = by_date[first_year];
  const trade_last_year = by_date[max_year];
  const annualized_rate = annualized_growth(
    trade_last_year,
    trade_first_year,
    max_year,
    first_year
  );

  const current_trade_array = by_date_array[max_year];

  const top_trade_latest_year = current_trade_array.sort(function(a, b) {
    return b[trade_measure] - a[trade_measure];
  });

  const total_trade_latest_year = sumBy(top_trade_latest_year, function(o) {
    return o[trade_measure] && !isNaN(o[trade_measure])
      ? parseInt(o[trade_measure])
      : 0;
  });

  var p_text_values = {
    latest_year: max_year,
    rank: numeral(
      current_trade_array[0]["Geo Rank Across Time"],
      locale
    ).format("0o"),
    trade_volume: numeral(total_trade_latest_year, locale).format("($ 0.00 a)"),
    first_year: first_year,
    trade_first_year: numeral(trade_first_year, locale).format("($ 0.00 a)"),
    last_year: max_year,
    trade_last_year: numeral(trade_last_year, locale).format("($ 0.00 a)"),
    annualized_rate: numeral(annualized_rate, locale).format("0%"),
    increased: annualized_rate > 0 ? true : false,
    trade_first_product: top_trade_latest_year[0].HS2,
    trade_first_product_link: slugifyItem(
      "products",
      top_trade_latest_year[0]["ID HS0"],
      top_trade_latest_year[0]["HS0"],
      top_trade_latest_year[0]["ID HS2"],
      top_trade_latest_year[0]["HS2"]
    ),
    trade_first_val: parseInt(top_trade_latest_year[0][trade_measure]),
    trade_first_share: numeral(
      parseInt(top_trade_latest_year[0][trade_measure]) /
        total_trade_latest_year,
      locale
    ).format("0%"),
    number_of_years: max_year - first_year
  };

  if (top_trade_latest_year.length > 2) {
    p_text_values.trade_second_product = top_trade_latest_year[1].HS2;
    p_text_values.trade_second_product_link = slugifyItem(
      "products",
      top_trade_latest_year[1]["ID HS0"],
      top_trade_latest_year[1]["HS0"],
      top_trade_latest_year[1]["ID HS2"],
      top_trade_latest_year[1]["HS2"]
    );
    p_text_values.trade_second_share = numeral(
      parseInt(top_trade_latest_year[1][trade_measure]) /
        total_trade_latest_year,
      locale
    ).format("0%");
  } else {
    p_text_values.trade_second_product = "-";
    p_text_values.trade_second_share = "-";
  }

  return p_text_values;
}

function maxMinGrowthByYear(aggregation, measure, locale = "en") {
  const last_year = maxBy(aggregation, function(o) {
    return o["ID Year"];
  })["ID Year"];

  const by_date_array = groupBy(aggregation, function(obj, children) {
    return obj["ID Year"];
  });

  const by_date = mapValues(by_date_array, function(array) {
    return sumBy(array, function(o) {
      return o[measure] && !isNaN(o[measure]) ? parseInt(o[measure]) : 0;
    });
  });

  const first_year = minBy(aggregation, function(o) {
    return o["ID Year"];
  })["ID Year"];

  const value_first_year = by_date[first_year];
  const value_last_year = by_date[last_year];
  const annualized_rate = annualized_growth(
    value_last_year,
    value_first_year,
    last_year,
    first_year
  );

  return {
    first_year: first_year,
    first_year_value: numeral(value_first_year, locale).format("($ 0.0 a)"),
    last_year: last_year,
    last_year_value: numeral(value_last_year, locale).format("($ 0.0 a)"),
    annualized_rate: numeral(annualized_rate, locale).format("0%"),
    increased: annualized_rate > 0 ? true : false,
    number_of_years: last_year - first_year
  };
}

function info_from_data(
  aggregation,
  msrName,
  territoryKey,
  locale = "en",
  format = "($ 0.00 a)"
) {
  aggregation = aggregation.sort((a, b) => {
    return b[msrName] - a[msrName];
  });

  const total = aggregation.reduce((all, item) => {
    return all + item[msrName];
  }, 0);
  return {
    total: numeral(total, locale).format(format),
    territory: {
      first: aggregation[0] ? aggregation[0][territoryKey] : "",
      second: aggregation[1] ? aggregation[1][territoryKey] : "",
      third: aggregation[2] ? aggregation[2][territoryKey] : ""
    },
    share: {
      first: aggregation[0]
        ? numeral(aggregation[0][msrName] / total, locale).format("0.0 %")
        : "",
      second: aggregation[1]
        ? numeral(aggregation[1][msrName] / total, locale).format("0.0 %")
        : "",
      third: aggregation[2]
        ? numeral(aggregation[2][msrName] / total, locale).format("0.0 %")
        : ""
    },
    values: {
      first: aggregation[0] ? aggregation[0][msrName] : "",
      second: aggregation[1] ? aggregation[1][msrName] : "",
      third: aggregation[2] ? aggregation[2][msrName] : ""
    }
  };
}

function trade_balance_text(
  aggregation,
  msrName,
  territoryKey,
  locale = "en",
  format = "($ 0.00 a)"
) {
  const last_value = aggregation[aggregation.length - 1];
  const first_value = aggregation[0];

  const growth_rate = Math.log(last_value / first_value);

  return {
    growth_rate: numeral(growth_rate, locale).format("0.0 %"),
    increased_or_decreased: growth_rate > 0 ? "increased" : "decreased",
    value: {
      first: numeral(first_value, locale).format(format),
      last: numeral(last_value, locale).format(format)
    }
  };
}

function recentChampionsBy(collection, key_value, key_time = "Year") {
  const max_year = maxBy(collection, key_time)[key_time];
  const collection_recent = collection.filter(d => d.Year == max_year);
  const sorted = sortBy(collection_recent, key_value);
  return { first: sorted[0], second: sorted[1], third: sorted[2] };
}

export {
  info_from_data,
  maxMinGrowthByYear,
  recentChampionsBy,
  trade_balance_text,
  trade_by_time_and_product
};
