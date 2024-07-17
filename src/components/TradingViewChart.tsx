import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, UTCTimestamp, IChartApi, ISeriesApi, CandlestickData } from 'lightweight-charts';

interface ChartProps {
  data: { time: number; open: number; high: number; low: number; close: number; volume: number }[];
}

const TradingViewChart: React.FC<ChartProps> = ({ data }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  useEffect(() => {
    if (chartContainerRef.current && data.length > 0) {
      const chart = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: 500,
        layout: {
          background: { type: ColorType.Solid, color: '#131722' },
          textColor: '#d1d4dc',
        },
        grid: {
          vertLines: { color: '#242732' },
          horzLines: { color: '#242732' },
        },
        crosshair: {
          mode: 0,
        },
        rightPriceScale: {
          borderColor: '#485c7b',
        },
        timeScale: {
          borderColor: '#485c7b',
          timeVisible: true,
          secondsVisible: false,
        },
      });

      const candlestickSeries = chart.addCandlestickSeries({
        upColor: '#26a69a',
        downColor: '#ef5350',
        borderVisible: false,
        wickUpColor: '#26a69a',
        wickDownColor: '#ef5350',
      });

      const sortedData = data
        .sort((a, b) => a.time - b.time)
        .map(item => ({
          time: item.time as UTCTimestamp,
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close,
        }));

      candlestickSeries.setData(sortedData);

      // Add volume series
      const volumeSeries = chart.addHistogramSeries({
        color: '#26a69a',
        priceFormat: {
          type: 'volume',
        },
        priceScaleId: '',
      });

      // Set scale margins for volume series
      chart.priceScale('').applyOptions({
        scaleMargins: {
          top: 0.8,
          bottom: 0,
        },
      });

      const volumeData = sortedData.map((item, index) => ({
        time: item.time,
        value: data[index].volume,
        color: item.close > item.open ? '#26a69a' : '#ef5350',
      }));

      volumeSeries.setData(volumeData);

      chart.timeScale().fitContent();

      // Add price formatter to display small values correctly
      chart.applyOptions({
        localization: {
          priceFormatter: (price: number) => {
            return price.toFixed(9);
          },
        },
      });

      const handleResize = () => {
        chart.applyOptions({ width: chartContainerRef.current!.clientWidth });
      };

      window.addEventListener('resize', handleResize);

      chartRef.current = chart;
      candlestickSeriesRef.current = candlestickSeries;

      return () => {
        window.removeEventListener('resize', handleResize);
        chart.remove();
      };
    }
  }, [data]);

  return (
    <div className="relative">
      <div ref={chartContainerRef} />
      <div className="absolute top-4 left-4 text-white text-sm">
        <div>O: {data[data.length - 1]?.open.toFixed(9)}</div>
        <div>H: {data[data.length - 1]?.high.toFixed(9)}</div>
        <div>L: {data[data.length - 1]?.low.toFixed(9)}</div>
        <div>C: {data[data.length - 1]?.close.toFixed(9)}</div>
      </div>
    </div>
  );
};

export default TradingViewChart;