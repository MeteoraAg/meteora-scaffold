const TV_CHART_STATE = 'TRADING_VIEW_STATE';

export const saveChartState = (state: object) => {
  window.localStorage.setItem(TV_CHART_STATE, JSON.stringify(state));
};

export const loadChartState = () => {
  const rawChartData = window.localStorage.getItem(TV_CHART_STATE);
  return rawChartData ? JSON.parse(rawChartData) : undefined;
};
