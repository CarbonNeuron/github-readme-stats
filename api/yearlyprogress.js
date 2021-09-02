require("dotenv").config();
const {
  renderError,
  parseBoolean,
  parseArray,
  clampValue,
  CONSTANTS,
} = require("../src/common/utils");
const svgToImg = require("svg-to-img");
const fetchStats = require("../src/fetchers/stats-fetcher");
const renderStatsCard = require("../src/cards/stats-card");
const renderYearlyProgressCard = require("../src/cards/yearly-progress-card");
const blacklist = require("../src/common/blacklist");
const { isLocaleAvailable } = require("../src/translations");

module.exports = async (req, res) => {
  const {
    BottomText,
    CurrentDay,
    DaysLeft,
    Progress,
    date,
    hide,
    hide_title,
    hide_border,
    hide_rank,
    show_icons,
    count_private,
    include_all_commits,
    line_height,
    title_color,
    icon_color,
    text_color,
    bg_color,
    theme,
    cache_seconds,
    custom_title,
    locale,
    disable_animations,
    border_radius,
    border_color,
  } = req.query;
  let stats;

  res.setHeader("Content-Type", "image/png");


  if (locale && !isLocaleAvailable(locale)) {
    return res.send(renderError("Something went wrong", "Language not found"));
  }

  try {
    stats = {
      rank: { level: Progress?Progress+"%":"0%", score: Progress?100-parseInt(Progress):100 },
      name:"test",
      bottomText: BottomText?BottomText:"",
      DaysLeft: DaysLeft?DaysLeft:"0",
      CurrentDay: CurrentDay?CurrentDay:"365"}

    const cacheSeconds = clampValue(
      parseInt(cache_seconds || CONSTANTS.TWO_HOURS, 10),
      CONSTANTS.TWO_HOURS,
      CONSTANTS.ONE_DAY,
    );

    res.setHeader("Cache-Control", `public, max-age=${cacheSeconds}`);
    const image = await svgToImg.from(renderYearlyProgressCard(stats, {
      hide: parseArray(hide),
      show_icons: parseBoolean(show_icons),
      hide_title: parseBoolean(hide_title),
      hide_border: parseBoolean(hide_border),
      hide_rank: parseBoolean(hide_rank),
      include_all_commits: parseBoolean(include_all_commits),
      line_height,
      title_color,
      icon_color,
      text_color,
      bg_color,
      theme,
      custom_title:date?date:"Unspecified",
      border_radius,
      border_color,
      locale: locale ? locale.toLowerCase() : null,
      disable_animations: parseBoolean(disable_animations),
    })).toPng()
    return res.send(image);
  } catch (err) {
    return res.send(renderError(err.message, err.secondaryMessage));
  }
};
